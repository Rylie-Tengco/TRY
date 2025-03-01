// Fallback authentication check in case main.js is not loaded
if (typeof checkAuth !== 'function') {
    function checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'customer-login.html';
            return false;
        }
        return true;
    }
}

// Check authentication
if (!checkAuth()) {
    window.location.href = 'customer-login.html';
}

let cart = [];
let user = null;

// Load checkout data
function loadCheckout() {
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
        user = JSON.parse(localStorage.getItem('user') || 'null');

        if (!cart || cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        if (user) {
            prefillUserData();
        }

        renderOrderItems();
        updateOrderSummary();
    } catch (error) {
        handleError(error);
    }
}

// Prefill user data kung meron na
function prefillUserData() {
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('address').value = user.address || '';
    document.getElementById('city').value = user.city || '';
    document.getElementById('postal').value = user.postal || '';
}

// Render order items
function renderOrderItems() {
    const orderItems = document.querySelector('.order-items');
    
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p class="quantity">Quantity: ${item.quantity}</p>
                <p class="price">${formatCurrency(item.price)}</p>
            </div>
        </div>
    `).join('');
}

// Update order summary
function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;

    document.querySelector('.subtotal').textContent = formatCurrency(subtotal);
    document.querySelector('.total-amount').textContent = formatCurrency(total);
}

// Handle payment method change
function handlePaymentMethodChange() {
    const bankDetails = document.querySelector('.bank-details');
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (bankDetails) {
        bankDetails.classList.toggle('active', paymentMethod === 'bank');
    }
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone format
function validatePhone(phone) {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
}

// Validate checkout form
function validateCheckoutForm() {
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'postal'];
    let isValid = true;

    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });

    // Validate email
    const email = document.getElementById('email');
    if (!validateEmail(email.value)) {
        email.classList.add('error');
        isValid = false;
    }

    // Validate phone
    const phone = document.getElementById('phone');
    if (!validatePhone(phone.value)) {
        phone.classList.add('error');
        isValid = false;
    }

    return isValid;
}

// Generate order ID gamit ang local date
function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;

    let orderCounter = localStorage.getItem('orderCounter_' + formattedDate);
    orderCounter = orderCounter ? parseInt(orderCounter, 10) + 1 : 1;
    localStorage.setItem('orderCounter_' + formattedDate, orderCounter);

    const sequence = String(orderCounter).padStart(4, '0');
    return `${formattedDate}-${sequence}`;
}

// Handle place order
async function handlePlaceOrder(event) {
    event.preventDefault();

    if (!validateCheckoutForm()) {
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }

    if (!user) {
        user = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postal: document.getElementById('postal').value
        };
    } else {
        user.name = document.getElementById('name').value;
        user.email = document.getElementById('email').value;
        user.phone = document.getElementById('phone').value;
        user.address = document.getElementById('address').value;
        user.city = document.getElementById('city').value;
        user.postal = document.getElementById('postal').value;
    }
    localStorage.setItem('user', JSON.stringify(user));

    const orderData = {
        id: generateOrderId(),
        items: cart,
        customer: {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postal: document.getElementById('postal').value
        },
        payment: document.querySelector('input[name="payment"]:checked').value,
        status: 'processing',
        date: new Date().toISOString(),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    try {
        // Save order to localStorage
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear cart
        localStorage.removeItem('cart');
        updateCartCount();

        // Show success message
        showNotification('Order placed successfully! Redirecting to orders page...', 'success');

        // Redirect to orders page after a delay
        setTimeout(() => {
            window.location.href = 'my-orders.html';
        }, 2000);
    } catch (error) {
        handleError(error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCheckout();

    // Set up payment method change handler
    const paymentInputs = document.querySelectorAll('input[name="payment"]');
    paymentInputs.forEach(input => {
        input.addEventListener('change', handlePaymentMethodChange);
    });

    // Set up place order handler
    const placeOrderBtn = document.querySelector('.place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    // Add input validation on blur
    const form = document.querySelector('.checkout-form');
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (!input.value.trim()) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
    });
});