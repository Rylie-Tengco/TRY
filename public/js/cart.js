// Check authentication
if (!checkAuth()) {
    window.location.href = 'customer-login.html';
}

let cart = [];

// Load cart items
function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
        renderCart();
        updateCartCount();
    } catch (error) {
        handleError(error);
    }
}

// Render cart items
function renderCart() {
    const cartItems = document.querySelector('.cart-items');
    const cartContent = document.querySelector('.cart-content');

    if (!cart || cart.length === 0) {
        cartContent.classList.add('empty');
        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="shop.html" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
        return;
    } else {
        cartContent.classList.remove('empty');
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <!-- New purchase type indicator -->
                <p class="purchase-type">${item.purchaseType === 'rent' ? 'For Rent' : 'For Sale'}</p>
                <p class="price">${formatCurrency(item.price)}</p>
                <div class="quantity-controls">
    <button class="quantity-btn minus" data-product-id="${item.id}" data-purchase-type="${item.purchaseType}">-</button>
    <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-product-id="${item.id}" data-purchase-type="${item.purchaseType}">
    <button class="quantity-btn plus" data-product-id="${item.id}" data-purchase-type="${item.purchaseType}">+</button>
</div>
            </div>
            <button class="remove-item" data-product-id="${item.id}" data-purchase-type="${item.purchaseType}">
    <i class="fas fa-trash"></i>
</button>
        </div>
    `).join('');

    updateCartSummary();
    addCartEventListeners();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;

    document.querySelector('.subtotal').textContent = formatCurrency(subtotal);
    document.querySelector('.total-amount').textContent = formatCurrency(total);

    // Update checkout button state
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Add event listeners to cart items
function addCartEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.productId);
            const purchaseType = button.dataset.purchaseType;
            updateQuantity(productId, 'decrease', null, purchaseType);
        });
    });

    // Quantity increase buttons
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.productId);
            const purchaseType = button.dataset.purchaseType;
            updateQuantity(productId, 'increase', null, purchaseType);
        });
    });

    // Quantity input fields
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = parseInt(input.dataset.productId);
            const purchaseType = input.dataset.purchaseType;
            const newQuantity = parseInt(e.target.value);
            if (newQuantity > 0) {
                updateQuantity(productId, 'set', newQuantity, purchaseType);
            } else {
                loadCart(); // Reset to previous value
            }
        });
    });

    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.productId);
            const purchaseType = button.dataset.purchaseType;
            removeFromCart(productId, purchaseType);
        });
    });
}

// Update item quantity
function updateQuantity(productId, action, value = null, purchaseType) {
    const itemIndex = cart.findIndex(item => item.id === productId && item.purchaseType === purchaseType);
    if (itemIndex === -1) return;

    switch (action) {
        case 'increase':
            cart[itemIndex].quantity += 1;
            break;
        case 'decrease':
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            }
            break;
        case 'set':
            cart[itemIndex].quantity = value;
            break;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    showNotification('Cart updated successfully');
}

// Remove item from cart
function removeFromCart(productId, purchaseType) {
    cart = cart.filter(item => !(item.id === productId && item.purchaseType === purchaseType));
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    showNotification('Item removed from cart');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    // Handle checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }
}); 