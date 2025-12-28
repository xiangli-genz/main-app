// main-app/public/assets/js/scripts.js

// ===== GLOBAL STATE =====
const bookingState = {
    movieId: null,
    movieName: null,
    movieAvatar: null,
    movieDuration: null,
    movieAgeRating: null,
    cinema: '',
    date: '',
    time: '',
    format: '',
    selectedSeats: [],
    ticketPrice: 0,
    prices: {
        standard: 50000,
        vip: 60000,
        couple: 110000
    },
    combos: {},
    comboTotal: 0,
    customerInfo: {
        name: '',
        phone: '',
        email: '',
        note: ''
    },
    paymentMethod: 'cash',
    bookingId: null,
    bookingCode: null
};

// ===== HELPER: Safe Set Text =====
function safeSetText(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = value || '-';
    } else {
        console.warn(`Element not found: ${elementId}`);
    }
}

function safeSetSrc(elementId, value) {
    const el = document.getElementById(elementId);
    if (el && value) {
        el.src = value;
        el.style.display = 'block';
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    console.log('=== PAGE LOADED ===', currentPage);
    
    try {
        // Load movie detail
        if (currentPage.includes('/movie/detail/')) {
            const movieId = currentPage.split('/').pop();
            loadMovieDetail(movieId);
        }
        
        // Initialize seat grid
        if (document.getElementById('seat-grid')) {
            console.log('Initializing seat grid...');
            initSeatGrid();
        }
        
        // Initialize combo page
        if (document.getElementById('page-combo-selection')) {
            console.log('Initializing combo page...');
            initComboPage();
        }
        
        // Initialize checkout page
        if (document.getElementById('page-checkout')) {
            console.log('Initializing checkout page...');
            initCheckoutPage();
        }
    } catch (error) {
        console.error('❌ Error during initialization:', error);
    }
});

// ===== LOAD MOVIE DETAIL =====
async function loadMovieDetail(movieId) {
    try {
        const loadingEl = document.getElementById('loading-state');
        const contentEl = document.getElementById('movie-detail-content');
        
        const res = await fetch(`/api/movies/${movieId}`);
        const data = await res.json();
        
        if (data.code === 'success') {
            const movie = data.data.movie;
            
            // Save FULL movie data to state
            bookingState.movieId = movie._id;
            bookingState.movieName = movie.name;
            bookingState.movieAvatar = movie.avatar;
            bookingState.movieDuration = movie.duration;
            bookingState.movieAgeRating = movie.ageRating;
            bookingState.prices = movie.prices || bookingState.prices;
            
            // Update UI safely
            safeSetSrc('movie-avatar', movie.avatar);
            safeSetText('movie-name', movie.name);
            safeSetText('movie-age-rating', movie.ageRating);
            safeSetText('movie-language', movie.language);
            safeSetText('movie-duration', movie.duration);
            safeSetText('movie-director', movie.director);
            safeSetText('movie-cast', movie.cast);
            safeSetText('movie-category', movie.category);
            safeSetText('movie-description', movie.description);
            
            const releaseDate = new Date(movie.releaseDate);
            safeSetText('movie-release-date', releaseDate.toLocaleDateString('vi-VN'));
            
            // Render showtimes
            renderShowtimes(movie.showtimes);
            
            // Hide loading, show content
            if (loadingEl) loadingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'block';
        }
    } catch (err) {
        console.error('Error loading movie:', err);
        const loadingEl = document.getElementById('loading-state');
        if (loadingEl) {
            loadingEl.innerHTML = `
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #EF5350;"></i>
                <p style="margin-top: 20px; color: #666;">Không thể tải thông tin phim!</p>
                <button onclick="window.location.href='/'" class="btn btn-primary" style="margin-top: 15px;">
                    <i class="fa-solid fa-home"></i> Về trang chủ
                </button>
            `;
        }
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
        const dateKey = new Date(st.date).toISOString().split('T')[0];
        if (!grouped[st.cinema][dateKey]) {
            grouped[st.cinema][dateKey] = {
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
                <div class="date-tab ${idx === 0 ? 'active' : ''}" data-date="${date}" data-cinema="${cinema}">
                    <div style="font-weight: 700;">${dayName}</div>
                    <div style="font-size: 12px;">${dayNum}</div>
                </div>
            `;
        });
        datesHTML += '</div>';
        
        let timesHTML = '<div class="time-slots" data-cinema="${cinema}">';
        const firstDate = dates[0];
        const times = grouped[cinema][firstDate].times;
        const format = grouped[cinema][firstDate].format;
        
        times.forEach(time => {
            timesHTML += `
                <div class="time-slot" data-time="${time}" data-format="${format}" data-cinema="${cinema}" data-date="${firstDate}">
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
    
    attachShowtimeListeners(grouped);
}

// ===== ATTACH SHOWTIME LISTENERS =====
function attachShowtimeListeners(grouped) {
    // Date tab listeners
    document.querySelectorAll('.date-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const cinema = this.getAttribute('data-cinema');
            const selectedDate = this.getAttribute('data-date');
            
            console.log('📅 Date selected:', selectedDate, 'at', cinema);
            
            // Update active state
            const parent = this.closest('.cinema-item');
            parent.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update time slots for this date
            const timeSlotsContainer = parent.querySelector('.time-slots');
            const showtimeData = grouped[cinema][selectedDate];
            
            if (showtimeData) {
                let newTimesHTML = '';
                showtimeData.times.forEach(time => {
                    newTimesHTML += `
                        <div class="time-slot" data-time="${time}" data-format="${showtimeData.format}" data-cinema="${cinema}" data-date="${selectedDate}">
                            ${time} - ${showtimeData.format}
                        </div>
                    `;
                });
                timeSlotsContainer.innerHTML = newTimesHTML;
                
                // Re-attach time slot listeners
                attachTimeSlotListeners();
            }
            
            // Clear previous selection
            bookingState.time = '';
            checkShowtimeSelection();
        });
    });
    
    // Time slot listeners
    attachTimeSlotListeners();
    
    // Button listener
    const btnToSeat = document.getElementById('btn-to-seat');
    if (btnToSeat) {
        btnToSeat.addEventListener('click', function(e) {
            e.preventDefault(); // ← QUAN TRỌNG: Ngăn form submit
            
            console.log('🎯 Going to seat selection...');
            console.log('Current state:', bookingState);
            
            if (!bookingState.cinema || !bookingState.date || !bookingState.time) {
                alert('Vui lòng chọn suất chiếu!');
                return false;
            }
            
            // Save to sessionStorage
            sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
            console.log('✅ Saved to sessionStorage');
            
            // Navigate
            window.location.href = '/booking/seat';
            return false;
        });
    }
}

// ===== ATTACH TIME SLOT LISTENERS =====
function attachTimeSlotListeners() {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('⏰ Time slot clicked');
            
            // Get data from attributes
            const cinema = this.getAttribute('data-cinema');
            const date = this.getAttribute('data-date');
            const time = this.getAttribute('data-time');
            const format = this.getAttribute('data-format');
            
            console.log('Selected:', { cinema, date, time, format });
            
            // Update state
            bookingState.cinema = cinema;
            bookingState.date = date;
            bookingState.time = time;
            bookingState.format = format;
            
            // Update UI
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            
            console.log('✅ State updated:', bookingState);
            
            checkShowtimeSelection();
        });
    });
}

function checkShowtimeSelection() {
    const btn = document.getElementById('btn-to-seat');
    if (btn) {
        const hasSelection = bookingState.cinema && bookingState.date && bookingState.time;
        btn.disabled = !hasSelection;
        console.log('Button state:', hasSelection ? 'enabled' : 'disabled');
    }
}

// ===== SEAT GRID =====
function initSeatGrid() {
    const seatGrid = document.getElementById('seat-grid');
    if (!seatGrid) {
        console.error('❌ Seat grid element not found!');
        return;
    }
    
    console.log('🎬 Initializing seat grid...');
    
    // Load from sessionStorage
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
        try {
            Object.assign(bookingState, JSON.parse(savedData));
            console.log('✅ Loaded booking data:', bookingState);
        } catch (error) {
            console.error('❌ Error parsing saved data:', error);
            alert('Không thể tải dữ liệu đặt vé. Vui lòng chọn lại suất chiếu.');
            window.location.href = '/';
            return;
        }
    } else {
        console.error('❌ No booking data found in sessionStorage');
        alert('Không tìm thấy thông tin đặt vé. Vui lòng chọn lại suất chiếu.');
        window.location.href = '/';
        return;
    }
    
    // Validate required data
    if (!bookingState.movieId || !bookingState.cinema || !bookingState.date || !bookingState.time) {
        console.error('❌ Missing required booking data:', bookingState);
        alert('Thông tin đặt vé không đầy đủ. Vui lòng chọn lại suất chiếu.');
        window.location.href = '/';
        return;
    }
    
                // Update seat page info safely
    const avatarEl = document.getElementById('seat-movie-avatar');
    if (avatarEl && bookingState.movieAvatar) {
        avatarEl.src = bookingState.movieAvatar;
        avatarEl.style.display = 'block';
    }
    
    safeSetText('seat-movie-name', bookingState.movieName);
    safeSetText('seat-cinema', bookingState.cinema);
    safeSetText('seat-date', bookingState.date ? 
        new Date(bookingState.date).toLocaleDateString('vi-VN') : '-');
    safeSetText('seat-time', bookingState.time ? 
        `${bookingState.time} - ${bookingState.format}` : '-');
    
    // Update prices
    safeSetText('price-standard', formatPrice(bookingState.prices.standard));
    safeSetText('price-vip', formatPrice(bookingState.prices.vip));
    safeSetText('price-couple', formatPrice(bookingState.prices.couple));
    
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 10;
    const vipRows = ['F', 'G', 'H'];
    const coupleRow = 'J';
    
    // Load booked seats first
    loadBookedSeats();
    
    // Create seat grid
    rows.forEach(row => {
        const seatRow = document.createElement('div');
        seatRow.className = 'seat-row';
        
        if (row === coupleRow) {
            for (let i = 1; i <= seatsPerRow; i += 2) {
                const seatNum = `${row}${i}-${row}${i+1}`;
                const seat = createSeat(seatNum, 'couple', bookingState.prices.couple);
                seatRow.appendChild(seat);
            }
        } else {
            for (let i = 1; i <= seatsPerRow; i++) {
                const seatNum = `${row}${i}`;
                let type = 'normal';
                let price = bookingState.prices.standard;
                
                if (vipRows.includes(row)) {
                    type = 'vip';
                    price = bookingState.prices.vip;
                }
                
                const seat = createSeat(seatNum, type, price);
                seatRow.appendChild(seat);
            }
        }
        
        seatGrid.appendChild(seatRow);
    });
    
    console.log('✅ Seat grid created');
    
    // Button listener
    const btnToCombo = document.getElementById('btn-to-combo');
    if (btnToCombo) {
        btnToCombo.addEventListener('click', function(e) {
            e.preventDefault();
            
            console.log('🎯 Going to combo selection...');
            
            if (bookingState.selectedSeats.length === 0) {
                alert('Vui lòng chọn ít nhất 1 ghế!');
                return false;
            }
            
            sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
            console.log('✅ Saved to sessionStorage');
            
            window.location.href = '/booking/combo';
            return false;
        });
    }
}

async function loadBookedSeats() {
    if (!bookingState.movieId || !bookingState.cinema || !bookingState.date || !bookingState.time) {
        console.warn('⚠️ Missing data for loading booked seats');
        return;
    }
    
    try {
        const url = `/api/bookings/seats/booked?movieId=${bookingState.movieId}&cinema=${encodeURIComponent(bookingState.cinema)}&date=${bookingState.date}&time=${encodeURIComponent(bookingState.time)}`;
        console.log('📡 Loading booked seats:', url);
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.code === 'success' && data.data.bookedSeats) {
            console.log('✅ Booked seats:', data.data.bookedSeats);
            data.data.bookedSeats.forEach(seatNum => {
                const seatEl = document.querySelector(`[data-seat="${seatNum}"]`);
                if (seatEl) {
                    seatEl.classList.add('seat-booked');
                    seatEl.style.pointerEvents = 'none';
                }
            });
        }
    } catch (err) {
        console.error('❌ Error loading booked seats:', err);
    }
}

function createSeat(seatNum, type, price) {
    const seat = document.createElement('div');
    seat.className = `seat seat-${type}`;
    seat.textContent = seatNum;
    seat.setAttribute('data-seat', seatNum);
    seat.setAttribute('data-price', price);
    
    seat.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
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
    
    if (bookingState.selectedSeats.length === 0) {
        if (display) display.textContent = 'Chưa chọn ghế';
        if (priceDisplay) priceDisplay.textContent = '0đ';
        if (btnNext) btnNext.disabled = true;
    } else {
        const seatNumbers = bookingState.selectedSeats.map(s => s.seatNumber).join(', ');
        if (display) display.textContent = seatNumbers;
        
        bookingState.ticketPrice = bookingState.selectedSeats.reduce((sum, s) => sum + s.price, 0);
        if (priceDisplay) priceDisplay.textContent = formatPrice(bookingState.ticketPrice);
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

function goToCheckout() {
    sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
    window.location.href = '/booking/checkout';
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
    
    console.log('=== CHECKOUT PAGE DATA ===', bookingState);
    
    updateCheckoutPage();
}

function updateCheckoutPage() {
    // Movie info
    safeSetText('summary-movie-name', bookingState.movieName);
    safeSetText('summary-movie-duration', bookingState.movieDuration);
    safeSetText('summary-movie-rating', bookingState.movieAgeRating);
    safeSetSrc('summary-movie-avatar', bookingState.movieAvatar);
    
    // Booking details
    safeSetText('summary-cinema', bookingState.cinema);
    safeSetText('summary-date', bookingState.date ? 
        new Date(bookingState.date).toLocaleDateString('vi-VN') : '--');
    safeSetText('summary-time', bookingState.time ? 
        `${bookingState.time} - ${bookingState.format}` : '--');
    
    const seatsEl = document.getElementById('summary-seats');
    if (seatsEl && bookingState.selectedSeats.length > 0) {
        seatsEl.textContent = bookingState.selectedSeats.map(s => s.seatNumber).join(', ');
    }
    
    const comboCount = Object.keys(bookingState.combos).length;
    safeSetText('summary-combo', comboCount > 0 ? `${comboCount} combo` : 'Không');
    
    // Prices
    safeSetText('summary-ticket-price', formatPrice(bookingState.ticketPrice));
    safeSetText('summary-combo-price', formatPrice(bookingState.comboTotal));
    
    const total = bookingState.ticketPrice + bookingState.comboTotal;
    safeSetText('summary-total', formatPrice(total));
    
    console.log('✓ Checkout page updated');
}

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
    
    // Validation
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
    
    const selectedPaymentMethod = paymentMethod ? paymentMethod.value : 'cash';
    
    // Prepare payload
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
        paymentMethod: selectedPaymentMethod
    };
    
    console.log('=== SENDING BOOKING ===', payload);
    
    try {
        const res = await fetch('/api/bookings/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (data.code === 'success') {
            const bookingId = data.data.bookingId;
            
            bookingState.bookingId = bookingId;
            sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
            
            // Redirect to success page
            window.location.href = `/booking/success?bookingId=${bookingId}`;
            
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

// ===== 🔥 COMPLETE BOOKING WITH PAYMENT HANDLING (CẬP NHẬT) =====
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
    
    // Validation
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
    
    const selectedPaymentMethod = paymentMethod ? paymentMethod.value : 'cash';
    
    // ✅ BƯỚC 1: Tạo booking
    const bookingPayload = {
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
        paymentMethod: selectedPaymentMethod
    };
    
    console.log('=== STEP 1: CREATING BOOKING ===', bookingPayload);
    
    try {
        // Disable button
        const submitBtn = event.target;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
        
        const bookingRes = await fetch('/booking/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingPayload)
        });
        
        const bookingData = await bookingRes.json();
        
        if (bookingData.code !== 'success') {
            alert(bookingData.message || 'Đặt vé thất bại!');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Xác nhận đặt vé';
            return;
        }
        
        console.log('✓ Booking created:', bookingData.data.bookingId);
        
        // Lưu booking info
        bookingState.bookingId = bookingData.data.bookingId;
        bookingState.bookingCode = bookingData.data.bookingCode;
        sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
        
        // ✅ BƯỚC 2: Xử lý thanh toán
        if (selectedPaymentMethod === 'cash') {
            // Tiền mặt → Success luôn
            window.location.href = `/booking/success?bookingId=${bookingData.data.bookingId}`;
        } else {
            // Online payment → Tạo payment
            console.log('=== STEP 2: CREATING PAYMENT ===');
            
            const paymentPayload = {
                bookingId: bookingData.data.bookingId,
                bookingCode: bookingData.data.bookingCode,
                amount: bookingState.ticketPrice + bookingState.comboTotal,
                method: selectedPaymentMethod,
                customerName: name,
                customerPhone: phone,
                customerEmail: email
            };
            
            const paymentRes = await fetch('/payment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentPayload)
            });
            
            const paymentData = await paymentRes.json();
            
            if (paymentData.code === 'success') {
                console.log('✓ Payment created:', paymentData.data.paymentCode);
                
                // Nếu có payment URL → redirect
                if (paymentData.data.paymentUrl) {
                    window.location.href = paymentData.data.paymentUrl;
                } else {
                    // Không có URL → redirect to processing page
                    window.location.href = `/payment/processing?paymentId=${paymentData.data.paymentId}`;
                }
            } else {
                alert(paymentData.message || 'Không thể tạo thanh toán!');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Xác nhận đặt vé';
            }
        }
        
    } catch (err) {
        console.error('Error:', err);
        alert('Không thể kết nối tới server!');
        
        // Re-enable button
        const submitBtn = document.querySelector('.btn-success');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Xác nhận đặt vé';
        }
    }
}

/* ============================================ */
/* FILE 4: main-app/public/assets/js/payment-processing.js */
/* ============================================ */

(function() {
    'use strict';
    
    // Get payment ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    
    // Payment status polling
    let pollCount = 0;
    const maxPolls = 60; // 60 times x 2s = 2 minutes
    let pollInterval = null;
    
    // Initialize
    if (paymentId) {
        console.log('Payment ID:', paymentId);
        startPolling();
    } else {
        console.warn('No payment ID found');
        showError('Không tìm thấy thông tin thanh toán');
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }
    
    // Start polling payment status
    function startPolling() {
        // Initial check
        checkPaymentStatus();
        
        // Poll every 2 seconds
        pollInterval = setInterval(() => {
            checkPaymentStatus();
        }, 2000);
    }
    
    // Check payment status
    async function checkPaymentStatus() {
        try {
            const response = await fetch(`/payment/status/${paymentId}`);
            const data = await response.json();
            
            if (data.code === 'success' && data.data.payment) {
                const payment = data.data.payment;
                
                console.log('Payment status:', payment.status);
                
                // Update UI with payment info
                updatePaymentInfo(payment);
                
                // Check payment status
                if (payment.status === 'completed') {
                    clearInterval(pollInterval);
                    console.log('✓ Payment completed');
                    
                    // Show success message briefly
                    document.querySelector('.payment-title').textContent = 'Thanh toán thành công!';
                    document.querySelector('.payment-icon').innerHTML = '<i class="fa-solid fa-check-circle" style="color: #4CAF50;"></i>';
                    
                    // Redirect to success page
                    setTimeout(() => {
                        window.location.href = `/booking/success?bookingId=${payment.bookingId}`;
                    }, 1500);
                    
                } else if (payment.status === 'failed' || payment.status === 'cancelled') {
                    clearInterval(pollInterval);
                    console.log('✗ Payment failed/cancelled');
                    
                    // Redirect to failed page
                    setTimeout(() => {
                        window.location.href = `/payment/failed?bookingId=${payment.bookingId}`;
                    }, 1500);
                }
            } else {
                console.warn('Payment not found or invalid response');
            }
            
            // Update progress
            pollCount++;
            updateProgress(pollCount, maxPolls);
            
            // Check timeout
            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                console.warn('Payment check timeout');
                
                // Redirect to failed page with timeout error
                window.location.href = '/payment/failed?error=timeout';
            }
            
        } catch (error) {
            console.error('Poll error:', error);
            
            pollCount++;
            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                window.location.href = '/payment/failed?error=connection';
            }
        }
    }
    
    // Update payment info in UI
    function updatePaymentInfo(payment) {
        const paymentCodeEl = document.getElementById('payment-code');
        const paymentAmountEl = document.getElementById('payment-amount');
        const paymentMethodEl = document.getElementById('payment-method');
        const paymentInfoBox = document.getElementById('payment-info');
        
        if (paymentCodeEl) {
            paymentCodeEl.textContent = payment.paymentCode;
        }
        
        if (paymentAmountEl) {
            paymentAmountEl.textContent = formatPrice(payment.amount);
        }
        
        if (paymentMethodEl) {
            paymentMethodEl.textContent = getPaymentMethodName(payment.method);
        }
        
        if (paymentInfoBox) {
            paymentInfoBox.style.display = 'block';
        }
    }
    
    // Update progress bar
    function updateProgress(current, max) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        const percentage = Math.min((current / max) * 100, 100);
        
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        
        if (progressText) {
            const timeRemaining = Math.ceil((max - current) * 2 / 60);
            if (timeRemaining > 0) {
                progressText.textContent = `Đang kiểm tra... (${timeRemaining} phút còn lại)`;
            } else {
                progressText.textContent = 'Đang hoàn tất...';
            }
        }
    }
    
    // Show error message
    function showError(message) {
        const container = document.querySelector('.payment-container');
        if (container) {
            container.innerHTML = `
                <div class="payment-icon" style="color: #EF5350;">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                </div>
                <h2 class="payment-title">Có lỗi xảy ra</h2>
                <p class="payment-description">${message}</p>
                <button class="btn btn-primary" onclick="window.location.href='/'">
                    <i class="fa-solid fa-home"></i> Về trang chủ
                </button>
            `;
        }
    }
    
    // Format price
    function formatPrice(price) {
        return price.toLocaleString('vi-VN') + 'đ';
    }
    
    // Get payment method name
    function getPaymentMethodName(method) {
        const methods = {
            'cash': 'Tiền mặt',
            'momo': 'Ví MoMo',
            'zalopay': 'ZaloPay',
            'vnpay': 'VNPay',
            'bank': 'Chuyển khoản ngân hàng'
        };
        return methods[method] || method;
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (pollInterval) {
            clearInterval(pollInterval);
        }
    });
    
})();

/* ============================================ */
/* FILE 5: main-app/public/assets/js/payment-failed.js */
/* ============================================ */

(function() {
    'use strict';
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    const error = urlParams.get('error');
    
    console.log('Booking ID:', bookingId);
    console.log('Error:', error);
    
    // Show error message based on error type
    if (error) {
        showErrorMessage(error);
    }
    
    // Load booking info if available
    if (bookingId) {
        loadBookingInfo(bookingId);
    }
    
    // Show specific error message
    function showErrorMessage(errorType) {
        const descriptionEl = document.querySelector('.payment-description');
        if (!descriptionEl) return;
        
        const errorMessages = {
            'timeout': 'Giao dịch đã hết thời gian chờ. Vui lòng thử lại.',
            'connection': 'Không thể kết nối với hệ thống thanh toán. Vui lòng kiểm tra kết nối mạng.',
            'invalid_signature': 'Chữ ký giao dịch không hợp lệ. Vui lòng liên hệ hỗ trợ.',
            'payment_not_found': 'Không tìm thấy thông tin thanh toán.',
            'system_error': 'Lỗi hệ thống. Vui lòng thử lại sau.'
        };
        
        const message = errorMessages[errorType] || 'Có lỗi xảy ra trong quá trình thanh toán.';
        descriptionEl.innerHTML = message + '<br>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.';
    }
    
    // Load booking information
    async function loadBookingInfo(bookingId) {
        try {
            console.log('Loading booking info for:', bookingId);
            
            const response = await fetch(`/booking/${bookingId}`);
            const data = await response.json();
            
            if (data.code === 'success' && data.data.booking) {
                const booking = data.data.booking;
                
                console.log('Booking loaded:', booking);
                
                // Update UI
                const bookingCodeEl = document.getElementById('booking-code');
                const bookingAmountEl = document.getElementById('booking-amount');
                const bookingInfoBox = document.getElementById('booking-info');
                
                if (bookingCodeEl) {
                    bookingCodeEl.textContent = booking.bookingCode;
                }
                
                if (bookingAmountEl) {
                    bookingAmountEl.textContent = formatPrice(booking.total);
                }
                
                if (bookingInfoBox) {
                    bookingInfoBox.style.display = 'block';
                }
                
            } else {
                console.warn('Booking not found or invalid response');
            }
            
        } catch (error) {
            console.error('Error loading booking:', error);
        }
    }
    
    // Retry payment function
    window.retryPayment = function() {
        if (bookingId) {
            // Go back to checkout page with booking ID
            window.location.href = `/booking/checkout?bookingId=${bookingId}`;
        } else {
            // No booking ID, go to home
            window.location.href = '/';
        }
    };
    
    // Format price helper
    function formatPrice(price) {
        return price.toLocaleString('vi-VN') + 'đ';
    }
    
})();

// Get booking ID from URL
const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get('bookingId');

// Load booking info
async function loadBookingInfo() {
    const loadingState = document.getElementById('loading-state');
    const successContent = document.getElementById('success-content');
    const errorState = document.getElementById('error-state');
    
    if (!bookingId) {
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        const data = await response.json();
        
        if (data.code === 'success' && data.data.booking) {
            const booking = data.data.booking;
            
            // Hide loading, show success
            loadingState.style.display = 'none';
            successContent.style.display = 'block';
            
            // Update UI
            updateSuccessPage(booking);
            
            // Clear session storage
            sessionStorage.removeItem('bookingData');
            
        } else {
            throw new Error('Booking not found');
        }
        
    } catch (error) {
        console.error('Error loading booking:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
    }
}

// Update success page with booking data
function updateSuccessPage(booking) {
    // Booking code
    document.getElementById('booking-code-display').textContent = booking.bookingCode;
    
    // Success message
    const messageEl = document.getElementById('success-message');
    if (booking.paymentStatus === 'paid') {
        messageEl.innerHTML = 'Cảm ơn bạn đã đặt vé! Vé của bạn đã được thanh toán thành công.<br>Vui lòng đến rạp trước giờ chiếu ít nhất 15 phút.';
    } else {
        messageEl.innerHTML = 'Cảm ơn bạn đã đặt vé! Vui lòng thanh toán tại quầy vé trước giờ chiếu.';
        
        // Show cash payment notice
        const cashNotice = document.getElementById('cash-payment-notice');
        cashNotice.style.display = 'block';
        document.getElementById('cash-booking-code').textContent = booking.bookingCode;
        document.getElementById('cash-total-amount').textContent = formatPrice(booking.total);
    }
    
    // Movie info
    if (booking.movieAvatar) {
        const avatarEl = document.getElementById('success-movie-avatar');
        avatarEl.src = booking.movieAvatar;
        avatarEl.style.display = 'block';
    }
    
    document.getElementById('success-movie-name').textContent = booking.movieName || '-';
    document.getElementById('success-cinema').textContent = booking.cinema || '-';
    
    // Date & Time
    if (booking.showtime) {
        const dateObj = new Date(booking.showtime.date);
        document.getElementById('success-date').textContent = dateObj.toLocaleDateString('vi-VN');
        document.getElementById('success-time').textContent = 
            `${booking.showtime.time} - ${booking.showtime.format || '2D'}`;
    }
    
    // Seats
    if (booking.seats && booking.seats.length > 0) {
        const seatNumbers = booking.seats.map(s => s.seatNumber).join(', ');
        document.getElementById('success-seats').textContent = seatNumbers;
    }
    
    // Combos
    if (booking.combos && booking.combos.length > 0) {
        const comboRow = document.getElementById('combo-row');
        comboRow.style.display = 'flex';
        
        const comboTexts = booking.combos.map(c => 
            `${c.name} (x${c.quantity})`
        ).join(', ');
        document.getElementById('success-combos').textContent = comboTexts;
    }
    
    // Prices
    document.getElementById('success-total').textContent = formatPrice(booking.total);
    
    // Payment info
    const paymentMethods = {
        'cash': 'Tiền mặt',
        'momo': 'Ví MoMo',
        'zalopay': 'ZaloPay',
        'vnpay': 'VNPay',
        'bank': 'Chuyển khoản'
    };
    document.getElementById('success-payment-method').textContent = 
        paymentMethods[booking.paymentMethod] || booking.paymentMethod;
    
    const paymentStatuses = {
        'paid': 'Đã thanh toán',
        'unpaid': 'Chưa thanh toán'
    };
    const statusEl = document.getElementById('success-payment-status');
    statusEl.textContent = paymentStatuses[booking.paymentStatus] || booking.paymentStatus;
    statusEl.style.color = booking.paymentStatus === 'paid' ? 
        'var(--color-success)' : 'var(--color-warning)';
    
    // Customer info
    document.getElementById('success-customer-name').textContent = booking.fullName || '-';
    document.getElementById('success-customer-phone').textContent = booking.phone || '-';
    
    if (booking.email) {
        const emailRow = document.getElementById('email-row');
        emailRow.style.display = 'flex';
        document.getElementById('success-customer-email').textContent = booking.email;
    }
}

// Print ticket
function printTicket() {
    window.print();
}

// Format price
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

// Load booking on page load
loadBookingInfo();