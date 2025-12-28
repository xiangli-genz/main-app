// main-app/public/assets/js/booking-success.js
// ✅ Script riêng cho trang success

(function() {
    'use strict';
    
    // Get booking ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    
    console.log('=== SUCCESS PAGE ===');
    console.log('Booking ID from URL:', bookingId);
    
    // Load booking info on page load
    loadBookingInfo();
    
    // Load booking info
    async function loadBookingInfo() {
        const loadingState = document.getElementById('loading-state');
        const successContent = document.getElementById('success-content');
        const errorState = document.getElementById('error-state');
        
        if (!bookingId) {
            console.error('❌ No booking ID in URL');
            if (loadingState) loadingState.style.display = 'none';
            if (errorState) errorState.style.display = 'block';
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
            if (cashNotice) {
                cashNotice.style.display = 'block';
                document.getElementById('cash-booking-code').textContent = booking.bookingCode;
                document.getElementById('cash-total-amount').textContent = formatPrice(booking.total);
            }
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
            if (comboRow) {
                comboRow.style.display = 'flex';
                
                const comboTexts = booking.combos.map(c => 
                    `${c.name} (x${c.quantity})`
                ).join(', ');
                document.getElementById('success-combos').textContent = comboTexts;
            }
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
            if (emailRow) {
                emailRow.style.display = 'flex';
                document.getElementById('success-customer-email').textContent = booking.email;
            }
        }
    }
    
    // Print ticket
    window.printTicket = function() {
        window.print();
    };
    
    // Format price
    function formatPrice(price) {
        return price.toLocaleString('vi-VN') + 'đ';
    }
    
})();