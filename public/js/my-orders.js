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

let orders = [];
let user = null;

// Load orders
function loadOrders() {
    try {
        user = JSON.parse(localStorage.getItem('user'));
        orders = JSON.parse(localStorage.getItem('orders') || '[]')
            .filter(order => order.customer.email === user.email)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        renderOrders();
    } catch (error) {
        handleError(error);
    }
}

// Filter orders by status
function filterOrders(status) {
    const filteredOrders = status === 'all'
        ? orders
        : orders.filter(order => order.status === status);
    renderOrders(filteredOrders);
}

// Render orders
function renderOrders(ordersToRender = orders) {
    const ordersList = document.querySelector('.orders-list');

    if (!ordersToRender || ordersToRender.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-box-open"></i>
                <p>No orders found</p>
                <a href="shop.html" class="shop-now-btn">Shop Now</a>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = ordersToRender.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p class="order-date">Ordered on: ${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="order-status">
                    <span class="status-badge ${order.status}">${order.status}</span>
                </div>
            </div>

            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p class="quantity">Quantity: ${item.quantity}</p>
                            <p class="price">${formatCurrency(item.price)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="order-footer">
                <div class="total-amount">
                    <span>Total:</span>
                    <span class="amount">${formatCurrency(order.total)}</span>
                </div>
                <button class="view-details-btn" onclick="viewOrderDetails('${order.id}')">View Details</button>
            </div>
        </div>
    `).join('');
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('orderDetailsModal');
    const modalContent = modal.querySelector('.order-details');

    modalContent.innerHTML = `
        <div class="order-info">
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status}</span></p>
        </div>
        <div class="shipping-info">
            <h4>Shipping Information</h4>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city} ${order.customer.postal}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
        </div>
        <div class="order-items">
            <h4>Items</h4>
            ${order.items.map(item => `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p class="quantity">Quantity: ${item.quantity}</p>
                        <p class="price">${formatCurrency(item.price)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="order-summary">
    <div class="summary-item">
        <span>Subtotal</span>
        <span>${formatCurrency(order.total)}</span>
    </div>
    <div class="summary-item total">
        <span>Total</span>
        <span>${formatCurrency(order.total)}</span>
    </div>
</div>
    `;

    modal.style.display = 'block';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();

    // Set up status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            filterOrders(e.target.value);
        });
    }

    // Set up modal close button
    const closeModal = document.querySelector('.close-modal');
    const modal = document.getElementById('orderDetailsModal');
    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});