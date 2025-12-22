// booking-script.js

// Booking state
const bookingState = {
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
    paymentMethod: 'cash'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initMovieDetail();
    initSeatGrid();
});

// Page 1: Movie Detail & Showtime Selection
function initMovieDetail() {
    // Date tab selection
    const dateTabs = document.querySelectorAll('.date-tab');
    dateTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const parent = this.closest('.cinema-item');
            parent.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Reset time selection
            parent.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
            checkShowtimeSelection();
        });
    });

    // Time slot selection
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            // Remove all selected
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            
            // Get cinema info
            const cinemaItem = this.closest('.cinema-item');
            const cinemaName = cinemaItem.querySelector('.cinema-name').textContent.trim().replace(/.*\s/, '');
            const activeDate = cinemaItem.querySelector('.date-tab.active');
            const dateText = activeDate ? activeDate.querySelector('div:last-child').textContent : '';
            
            // Save to state
            bookingState.cinema = cinemaName;
            bookingState.date = dateText;
            bookingState.time = this.getAttribute('data-time');
            bookingState.format = this.getAttribute('data-format');
            
            checkShowtimeSelection();
        });
    });

    // Next button
    document.getElementById('btn-to-seat').addEventListener('click', function() {
        if (bookingState.time) {
            showPage('page-seat-selection');
        }
    });
}

function checkShowtimeSelection() {
    const btn = document.getElementById('btn-to-seat');
    if (bookingState.time) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

// Page 2: Seat Selection
function initSeatGrid() {
    const seatGrid = document.getElementById('seat-grid');
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 10;
    const vipRows = ['F', 'G', 'H'];
    const coupleRow = 'J';
    
    // Simulated booked seats
    const bookedSeats = ['A3', 'A4', 'B5', 'C6', 'F2', 'G7'];
    
    rows.forEach(row => {
        const seatRow = document.createElement('div');
        seatRow.className = 'seat-row';
        
        if (row === coupleRow) {
            // Couple seats
            for (let i = 1; i <= seatsPerRow; i += 2) {
                const seatNum = `${row}${i}-${row}${i+1}`;
                const seat = createSeat(seatNum, 'couple', 150000, bookedSeats.includes(seatNum));
                seatRow.appendChild(seat);
            }
        } else {
            // Normal and VIP seats
            for (let i = 1; i <= seatsPerRow; i++) {
                const seatNum = `${row}${i}`;
                let type = 'normal';
                let price = 50000;
                
                if (vipRows.includes(row)) {
                    type = 'vip';
                    price = 70000;
                }
                
                const seat = createSeat(seatNum, type, price, bookedSeats.includes(seatNum));
                seatRow.appendChild(seat);
            }
        }
        
        seatGrid.appendChild(seatRow);
    });

    // Next button
    document.getElementById('btn-to-combo').addEventListener('click', function() {
        if (bookingState.selectedSeats.length > 0) {
            updateComboPage();
            showPage('page-combo-selection');
        }
    });
}

function createSeat(seatNum, type, price, isBooked) {
    const seat = document.createElement('div');
    seat.className = `seat seat-${type}`;
    seat.textContent = seatNum;
    seat.setAttribute('data-seat', seatNum);
    seat.setAttribute('data-price', price);
    
    if (isBooked) {
        seat.classList.add('seat-booked');
    } else {
        seat.addEventListener('click', function() {
            toggleSeat(this);
        });
    }
    
    return seat;
}

function toggleSeat(seatElement) {
    const seatNum = seatElement.getAttribute('data-seat');
    const price = parseInt(seatElement.getAttribute('data-price'));
    
    if (seatElement.classList.contains('selected')) {
        seatElement.classList.remove('selected');
        const index = bookingState.selectedSeats.findIndex(s => s.number === seatNum);
        if (index > -1) {
            bookingState.selectedSeats.splice(index, 1);
        }
    } else {
        seatElement.classList.add('selected');
        bookingState.selectedSeats.push({
            number: seatNum,
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
        display.textContent = 'Chưa chọn ghế';
        priceDisplay.textContent = '0đ';
        btnNext.disabled = true;
    } else {
        const seatNumbers = bookingState.selectedSeats.map(s => s.number).join(', ');
        display.textContent = seatNumbers;
        
        bookingState.ticketPrice = bookingState.selectedSeats.reduce((sum, s) => sum + s.price, 0);
        priceDisplay.textContent = formatPrice(bookingState.ticketPrice);
        btnNext.disabled = false;
    }
}

// Page 3: Combo Selection
function changeComboQty(comboId, change) {
    const qtyElement = document.getElementById(`combo-qty-${comboId}`);
    let currentQty = parseInt(qtyElement.textContent);
    let newQty = Math.max(0, currentQty + change);
    
    qtyElement.textContent = newQty;
    
    const comboCard = document.querySelector(`[data-combo="${comboId}"]`);
    const price = parseInt(comboCard.getAttribute('data-price'));
    
    if (newQty > 0) {
        bookingState.combos[comboId] = {
            quantity: newQty,
            price: price
        };
    } else {
        delete bookingState.combos[comboId];
    }
    
    updateComboTotal();
}

function updateComboPage() {
    document.getElementById('ticket-price-display').textContent = formatPrice(bookingState.ticketPrice);
    updateComboTotal();
}

function updateComboTotal() {
    bookingState.comboTotal = 0;
    for (let comboId in bookingState.combos) {
        const combo = bookingState.combos[comboId];
        bookingState.comboTotal += combo.price * combo.quantity;
    }
    
    document.getElementById('combo-price-display').textContent = formatPrice(bookingState.comboTotal);
    const total = bookingState.ticketPrice + bookingState.comboTotal;
    document.getElementById('total-with-combo').textContent = formatPrice(total);
}

// Page 4: Checkout
function updateCheckoutPage() {
    document.getElementById('summary-cinema').textContent = bookingState.cinema;
    document.getElementById('summary-date').textContent = bookingState.date;
    document.getElementById('summary-time').textContent = `${bookingState.time} - ${bookingState.format}`;
    
    const seatNumbers = bookingState.selectedSeats.map(s => s.number).join(', ');
    document.getElementById('summary-seats').textContent = seatNumbers;
    
    const comboCount = Object.keys(bookingState.combos).length;
    if (comboCount > 0) {
        document.getElementById('summary-combo').textContent = `${comboCount} combo`;
    } else {
        document.getElementById('summary-combo').textContent = 'Không';
    }
    
    document.getElementById('summary-ticket-price').textContent = formatPrice(bookingState.ticketPrice);
    document.getElementById('summary-combo-price').textContent = formatPrice(bookingState.comboTotal);
    
    const total = bookingState.ticketPrice + bookingState.comboTotal;
    document.getElementById('summary-total').textContent = formatPrice(total);
}

function completeBooking() {
    // Validate
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    
    if (!name) {
        alert('Vui lòng nhập họ tên!');
        document.getElementById('customer-name').focus();
        return;
    }
    
    if (!phone) {
        alert('Vui lòng nhập số điện thoại!');
        document.getElementById('customer-phone').focus();
        return;
    }
    
    // Save customer info
    bookingState.customerInfo = {
        name: name,
        phone: phone,
        email: document.getElementById('customer-email').value.trim(),
        note: document.getElementById('customer-note').value.trim()
    };
    
    bookingState.paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Show success page
    updateSuccessPage();
    showPage('page-success');
}

// Page 5: Success
function updateSuccessPage() {
    const bookingCode = 'BK' + Date.now().toString(36).toUpperCase();
    document.getElementById('final-booking-code').textContent = bookingCode;
    document.getElementById('final-cinema').textContent = bookingState.cinema;
    document.getElementById('final-date').textContent = bookingState.date;
    document.getElementById('final-time').textContent = `${bookingState.time} - ${bookingState.format}`;
    
    const seatNumbers = bookingState.selectedSeats.map(s => s.number).join(', ');
    document.getElementById('final-seats').textContent = seatNumbers;
    document.getElementById('final-name').textContent = bookingState.customerInfo.name;
    document.getElementById('final-phone').textContent = bookingState.customerInfo.phone;
    
    const total = bookingState.ticketPrice + bookingState.comboTotal;
    document.getElementById('final-total').textContent = formatPrice(total);
}

function resetBooking() {
    // Reset state
    bookingState.cinema = '';
    bookingState.date = '';
    bookingState.time = '';
    bookingState.format = '';
    bookingState.selectedSeats = [];
    bookingState.ticketPrice = 0;
    bookingState.combos = {};
    bookingState.comboTotal = 0;
    bookingState.customerInfo = { name: '', phone: '', email: '', note: '' };
    
    // Reset UI
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    
    for (let i = 1; i <= 4; i++) {
        const qtyEl = document.getElementById(`combo-qty-${i}`);
        if (qtyEl) qtyEl.textContent = '0';
    }
    
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-email').value = '';
    document.getElementById('customer-note').value = '';
    
    showPage('page-movie-detail');
}

// Utility functions
function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        window.scrollTo(0, 0);
        
        // Update checkout page when showing it
        if (pageId === 'page-checkout') {
            updateCheckoutPage();
        }
    }
}

function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}