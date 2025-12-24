// main-app/public/assets/js/scripts.js

// ===== GLOBAL STATE =====
const bookingState = {
    movieId: null,
    movieName: null,
    movieAvatar: null,
    cinema: '',
    date: '',
    time: '',
    format: '',
    selectedSeats: [],
    ticketPrice: 0,
    combos: {},
    comboTotal: 0,
    customerInfo: {
        name: '',
        phone: '',
        email: '',
        note: ''
    },
    paymentMethod: 'cash',
    bookingId: null
};

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    // Load movie detail nếu đang ở trang movie-detail
    if (currentPage.includes('/movie/detail/')) {
        const movieId = currentPage.split('/').pop();
        loadMovieDetail(movieId);
    }
    
    // Initialize seat grid nếu có
    if (document.getElementById('seat-grid')) {
        initSeatGrid();
    }
    
    // Initialize combo page nếu có
    if (document.getElementById('page-combo-selection')) {
        initComboPage();
    }
    
    // Initialize checkout page nếu có
    if (document.getElementById('page-checkout')) {
        initCheckoutPage();
    }
});

// ===== LOAD MOVIE DETAIL =====
async function loadMovieDetail(movieId) {
    try {
        const res = await fetch(`/api/movies/${movieId}`);
        const data = await res.json();
        
        if (data.code === 'success') {
            const movie = data.data.movie;
            
            // Save to state
            bookingState.movieId = movie._id;
            bookingState.movieName = movie.name;
            bookingState.movieAvatar = movie.avatar;
            
            // Update UI
            const posterImg = document.querySelector('.movie-poster img');
            if (posterImg) posterImg.src = movie.avatar;
            
            const title = document.querySelector('.movie-details h1');
            if (title) title.textContent = movie.name;
            
            // Render showtimes
            renderShowtimes(movie.showtimes);
        }
    } catch (err) {
        console.error('Error loading movie:', err);
        alert('Không thể tải thông tin phim!');
    }
}

// ===== RENDER SHOWTIMES =====
function renderShowtimes(showtimes) {
    if (!showtimes || showtimes.length === 0) return;
    
    const cinemaList = document.querySelector('.cinema-list');
    if (!cinemaList) return;
    
    // Group by cinema
    const grouped = {};
    showtimes.forEach(st => {
        if (!grouped[st.cinema]) {
            grouped[st.cinema] = {};
        }
        if (!grouped[st.cinema][st.date]) {
            grouped[st.cinema][st.date] = {
                times: st.times || [],
                format: st.format
            };
        }
    });
    
    cinemaList.innerHTML = '';
    
    Object.keys(grouped).forEach(cinema => {
        const cinemaItem = document.createElement('div');
        cinemaItem.className = 'cinema-item';
        
        let datesHTML = '<div class="date-tabs">';
        const dates = Object.keys(grouped[cinema]);
        dates.forEach((date, idx) => {
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
            const dayNum = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            
            datesHTML += `
                <div class="date-tab ${idx === 0 ? 'active' : ''}" data-date="${date}">
                    <div style="font-weight: 700;">${dayName}</div>
                    <div style="font-size: 12px;">${dayNum}</div>
                </div>
            `;
        });
        datesHTML += '</div>';
        
        let timesHTML = '<div class="time-slots">';
        const firstDate = dates[0];
        const times = grouped[cinema][firstDate].times;
        const format = grouped[cinema][firstDate].format;
        
        times.forEach(time => {
            timesHTML += `
                <div class="time-slot" data-time="${time}" data-format="${format}">
                    ${time} - ${format}
                </div>
            `;
        });
        timesHTML += '</div>';
        
        cinemaItem.innerHTML = `
            <div class="cinema-name"><i class="fa-solid fa-building"></i> ${cinema}</div>
            ${datesHTML}
            ${timesHTML}
        `;
        
        cinemaList.appendChild(cinemaItem);
    });
    
    // Attach event listeners
    attachShowtimeListeners();
}

// ===== ATTACH SHOWTIME LISTENERS =====
function attachShowtimeListeners() {
    document.querySelectorAll('.date-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const parent = this.closest('.cinema-item');
            parent.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // TODO: Update time slots based on selected date
            parent.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
            checkShowtimeSelection();
        });
    });
    
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            
            const cinemaItem = this.closest('.cinema-item');
            const cinemaName = cinemaItem.querySelector('.cinema-name').textContent.replace(/.*\s/, '').trim();
            const activeDate = cinemaItem.querySelector('.date-tab.active');
            const dateValue = activeDate ? activeDate.getAttribute('data-date') : '';
            
            bookingState.cinema = cinemaName;
            bookingState.date = dateValue;
            bookingState.time = this.getAttribute('data-time');
            bookingState.format = this.getAttribute('data-format');
            
            checkShowtimeSelection();
        });
    });
    
    const btnToSeat = document.getElementById('btn-to-seat');
    if (btnToSeat) {
        btnToSeat.addEventListener('click', function() {
            if (bookingState.time) {
                // Save to sessionStorage
                sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
                window.location.href = '/booking/seat';
            }
        });
    }
}

function checkShowtimeSelection() {
    const btn = document.getElementById('btn-to-seat');
    if (btn) {
        btn.disabled = !bookingState.time;
    }
}

// ===== SEAT GRID =====
function initSeatGrid() {
    const seatGrid = document.getElementById('seat-grid');
    if (!seatGrid) return;
    
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 10;
    const vipRows = ['F', 'G', 'H'];
    const coupleRow = 'J';
    
    // Load booked seats from API
    loadBookedSeats();
    
    rows.forEach(row => {
        const seatRow = document.createElement('div');
        seatRow.className = 'seat-row';
        
        if (row === coupleRow) {
            for (let i = 1; i <= seatsPerRow; i += 2) {
                const seatNum = `${row}${i}-${row}${i+1}`;
                const seat = createSeat(seatNum, 'couple', 150000);
                seatRow.appendChild(seat);
            }
        } else {
            for (let i = 1; i <= seatsPerRow; i++) {
                const seatNum = `${row}${i}`;
                let type = 'normal';
                let price = 50000;
                
                if (vipRows.includes(row)) {
                    type = 'vip';
                    price = 70000;
                }
                
                const seat = createSeat(seatNum, type, price);
                seatRow.appendChild(seat);
            }
        }
        
        seatGrid.appendChild(seatRow);
    });
    
    const btnToCombo = document.getElementById('btn-to-combo');
    if (btnToCombo) {
        btnToCombo.addEventListener('click', function() {
            if (bookingState.selectedSeats.length > 0) {
                sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
                window.location.href = '/booking/combo?movieId=' + bookingState.movieId;
            }
        });
    }
}

async function loadBookedSeats() {
    // Load from sessionStorage
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
        Object.assign(bookingState, JSON.parse(savedData));
    }
    
    if (!bookingState.movieId || !bookingState.cinema || !bookingState.date || !bookingState.time) {
        return;
    }
    
    try {
        const url = `/api/bookings/seats/booked?movieId=${bookingState.movieId}&cinema=${encodeURIComponent(bookingState.cinema)}&date=${bookingState.date}&time=${encodeURIComponent(bookingState.time)}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.code === 'success' && data.data.bookedSeats) {
            data.data.bookedSeats.forEach(seatNum => {
                const seatEl = document.querySelector(`[data-seat="${seatNum}"]`);
                if (seatEl) {
                    seatEl.classList.add('seat-booked');
                    seatEl.style.pointerEvents = 'none';
                }
            });
        }
    } catch (err) {
        console.error('Error loading booked seats:', err);
    }
}

function createSeat(seatNum, type, price) {
    const seat = document.createElement('div');
    seat.className = `seat seat-${type}`;
    seat.textContent = seatNum;
    seat.setAttribute('data-seat', seatNum);
    seat.setAttribute('data-price', price);
    
    seat.addEventListener('click', function() {
        if (this.classList.contains('seat-booked')) return;
        toggleSeat(this);
    });
    
    return seat;
}

function toggleSeat(seatElement) {
    const seatNum = seatElement.getAttribute('data-seat');
    const price = parseInt(seatElement.getAttribute('data-price'));
    const type = seatElement.classList.contains('seat-vip') ? 'vip' : 
                 seatElement.classList.contains('seat-couple') ? 'couple' : 'standard';
    
    if (seatElement.classList.contains('selected')) {
        seatElement.classList.remove('selected');
        const index = bookingState.selectedSeats.findIndex(s => s.seatNumber === seatNum);
        if (index > -1) {
            bookingState.selectedSeats.splice(index, 1);
        }
    } else {
        seatElement.classList.add('selected');
        bookingState.selectedSeats.push({
            seatNumber: seatNum,
            type: type,
            price: price
        });
    }
    
    updateSeatDisplay();
}

function updateSeatDisplay() {
    const display = document.getElementById('selected-seats-display');
    const priceDisplay = document.getElementById('total-price');
    const btnNext = document.getElementById('btn-to-combo');
    
    if (!display || !priceDisplay) return;
    
    if (bookingState.selectedSeats.length === 0) {
        display.textContent = 'Chưa chọn ghế';
        priceDisplay.textContent = '0đ';
        if (btnNext) btnNext.disabled = true;
    } else {
        const seatNumbers = bookingState.selectedSeats.map(s => s.seatNumber).join(', ');
        display.textContent = seatNumbers;
        
        bookingState.ticketPrice = bookingState.selectedSeats.reduce((sum, s) => sum + s.price, 0);
        priceDisplay.textContent = formatPrice(bookingState.ticketPrice);
        if (btnNext) btnNext.disabled = false;
    }
}

// ===== COMBO PAGE =====
function initComboPage() {
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
        Object.assign(bookingState, JSON.parse(savedData));
    }
    
    const ticketPriceEl = document.getElementById('ticket-price-display');
    if (ticketPriceEl) {
        ticketPriceEl.textContent = formatPrice(bookingState.ticketPrice);
    }
    
    updateComboTotal();
}

function changeComboQty(comboId, change) {
    const qtyElement = document.getElementById(`combo-qty-${comboId}`);
    if (!qtyElement) return;
    
    let currentQty = parseInt(qtyElement.textContent);
    let newQty = Math.max(0, currentQty + change);
    
    qtyElement.textContent = newQty;
    
    const comboCard = document.querySelector(`[data-combo="${comboId}"]`);
    const price = parseInt(comboCard.getAttribute('data-price'));
    const name = comboCard.querySelector('.combo-name').textContent;
    
    if (newQty > 0) {
        bookingState.combos[comboId] = {
            name: name,
            quantity: newQty,
            price: price
        };
    } else {
        delete bookingState.combos[comboId];
    }
    
    updateComboTotal();
}

function updateComboTotal() {
    bookingState.comboTotal = 0;
    for (let comboId in bookingState.combos) {
        const combo = bookingState.combos[comboId];
        bookingState.comboTotal += combo.price * combo.quantity;
    }
    
    const comboDisplay = document.getElementById('combo-price-display');
    if (comboDisplay) {
        comboDisplay.textContent = formatPrice(bookingState.comboTotal);
    }
    
    const totalDisplay = document.getElementById('total-with-combo');
    if (totalDisplay) {
        const total = bookingState.ticketPrice + bookingState.comboTotal;
        totalDisplay.textContent = formatPrice(total);
    }
}

// ===== CHECKOUT PAGE =====
function initCheckoutPage() {
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
        Object.assign(bookingState, JSON.parse(savedData));
    }
    
    updateCheckoutPage();
}

function updateCheckoutPage() {
    const elements = {
        cinema: document.getElementById('summary-cinema'),
        date: document.getElementById('summary-date'),
        time: document.getElementById('summary-time'),
        seats: document.getElementById('summary-seats'),
        combo: document.getElementById('summary-combo'),
        ticketPrice: document.getElementById('summary-ticket-price'),
        comboPrice: document.getElementById('summary-combo-price'),
        total: document.getElementById('summary-total')
    };
    
    if (elements.cinema) elements.cinema.textContent = bookingState.cinema || '--';
    if (elements.date) elements.date.textContent = bookingState.date ? new Date(bookingState.date).toLocaleDateString('vi-VN') : '--';
    if (elements.time) elements.time.textContent = bookingState.time ? `${bookingState.time} - ${bookingState.format}` : '--';
    
    if (elements.seats && bookingState.selectedSeats.length > 0) {
        elements.seats.textContent = bookingState.selectedSeats.map(s => s.seatNumber).join(', ');
    }
    
    const comboCount = Object.keys(bookingState.combos).length;
    if (elements.combo) {
        elements.combo.textContent = comboCount > 0 ? `${comboCount} combo` : 'Không';
    }
    
    if (elements.ticketPrice) elements.ticketPrice.textContent = formatPrice(bookingState.ticketPrice);
    if (elements.comboPrice) elements.comboPrice.textContent = formatPrice(bookingState.comboTotal);
    
    const total = bookingState.ticketPrice + bookingState.comboTotal;
    if (elements.total) elements.total.textContent = formatPrice(total);
}

// ===== ✅ COMPLETE BOOKING (GỌI API) =====
async function completeBooking() {
    const nameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('customer-phone');
    const emailInput = document.getElementById('customer-email');
    const noteInput = document.getElementById('customer-note');
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    
    if (!nameInput || !phoneInput) {
        alert('Không tìm thấy form!');
        return;
    }
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput ? emailInput.value.trim() : '';
    const note = noteInput ? noteInput.value.trim() : '';
    
    if (!name) {
        alert('Vui lòng nhập họ tên!');
        nameInput.focus();
        return;
    }
    
    if (!phone) {
        alert('Vui lòng nhập số điện thoại!');
        phoneInput.focus();
        return;
    }
    
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (!phoneRegex.test(phone)) {
        alert('Số điện thoại không đúng định dạng!');
        phoneInput.focus();
        return;
    }
    
    // ✅ CHUẨN BỊ PAYLOAD
    const payload = {
        movieId: bookingState.movieId,
        movieName: bookingState.movieName,
        movieAvatar: bookingState.movieAvatar,
        cinema: bookingState.cinema,
        showtimeDate: bookingState.date,
        showtimeTime: bookingState.time,
        showtimeFormat: bookingState.format,
        seats: bookingState.selectedSeats,
        combos: bookingState.combos,
        fullName: name,
        phone: phone,
        email: email,
        note: note,
        paymentMethod: paymentMethod ? paymentMethod.value : 'cash'
    };
    
    console.log('=== SENDING BOOKING ===', payload);
    
    try {
        const res = await fetch('/booking/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (data.code === 'success') {
            bookingState.bookingId = data.data.bookingId;
            sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
            window.location.href = `/booking/success?bookingId=${data.data.bookingId}`;
        } else {
            alert(data.message || 'Đặt vé thất bại!');
        }
    } catch (err) {
        console.error('Error creating booking:', err);
        alert('Không thể kết nối tới server!');
    }
}

// ===== UTILITY =====
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        window.scrollTo(0, 0);
    }
}