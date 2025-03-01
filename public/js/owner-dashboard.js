// Check owner authentication
function checkOwnerAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user || user.role !== 'owner') {
        window.location.href = 'owner-login.html';
        return false;
    }
    return true;
}

if (!checkOwnerAuth()) {
    window.location.href = 'owner-login.html';
}

let orders = [];

// Load orders and initialize dashboard
function initializeDashboard() {
    try {
        // Load owner name
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('ownerName').textContent = user.name;
        }

        // Load orders
        orders = JSON.parse(localStorage.getItem('orders') || '[]')
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        updateDashboardStats();
        renderOrders();
    } catch (error) {
        handleError(error);
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order =>
        order.status === 'processing' || order.status === 'out-for-delivery'
    ).length;
    const completedOrders = orders.filter(order =>
        order.status === 'completed'
    ).length;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
}

// Filter orders by status
function filterOrders(status) {
    const filteredOrders = status === 'all'
        ? orders
        : orders.filter(order => order.status === status);
    renderOrders(filteredOrders);
}

// Search orders
function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    if (!searchTerm) {
        renderOrders();
        return;
    }

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm) ||
        order.customer.name.toLowerCase().includes(searchTerm) ||
        order.customer.email.toLowerCase().includes(searchTerm)
    );
    renderOrders(filteredOrders);
}

// Render orders
function renderOrders(ordersToRender = orders) {
    const ordersList = document.getElementById('ordersList');

    if (!ordersToRender || ordersToRender.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-inbox fa-3x"></i>
                <p>No orders found</p>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = ordersToRender.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>Order #${order.id}</h3>
                <select class="status-select" data-order-id="${order.id}" onchange="updateOrderStatus('${order.id}', this.value)">
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="out-for-delivery" ${order.status === 'out-for-delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
            <div class="customer-info">
                <p><strong>Customer:</strong> ${order.customer.name}</p>
                <p><strong>Email:</strong> ${order.customer.email}</p>
                <p><strong>Phone:</strong> ${order.customer.phone}</p>
                <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city} ${order.customer.postal}</p>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>Quantity: ${item.quantity}</p>
                            <p>Price: ${formatCurrency(item.price)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <h4>Total Cost: ${formatCurrency(order.total)}</h4>
            </div>
            <div class="action-buttons">
    <button class="action-btn view-btn" onclick="viewOrderDetails('${order.id}')">
        <i class="fas fa-eye"></i> View Details
    </button>
    <button class="action-btn print-btn" onclick="printOrder('${order.id}')">
        <i class="fas fa-print"></i> Print Order
    </button>
    <button class="action-btn delete-btn" onclick="deleteOrder('${order.id}')">
        <i class="fas fa-trash"></i> Delete Order
    </button>
</div>
        </div>
    `).join('');
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const orderIndex = orders.findIndex(order => order.id === orderId);
        if (orderIndex === -1) return;

        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));

        updateDashboardStats();
        showNotification('Order status updated successfully');
    } catch (error) {
        handleError(error);
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(order => order.id === orderId);
    if (!order) return;

    const modal = document.getElementById('orderDetailsModal');
    const modalContent = modal.querySelector('.order-details');

    modalContent.innerHTML = `
        <div class="order-info">
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status}</span></p>
        </div>
        <div class="customer-info">
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
            <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city} ${order.customer.postal}</p>
        </div>
        <div class="order-items">
            <h4>Order Items</h4>
            ${order.items.map(item => `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Price: ${formatCurrency(item.price)}</p>
                        <p>Subtotal: ${formatCurrency(item.price * item.quantity)}</p>
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

// Print order
function printOrder(orderId) {
    const order = orders.find(order => order.id === orderId);
    if (!order) return;

    const printContent = `
        <div class="print-order">
            <h2>Order #${order.id}</h2>
            <div class="order-date">
                <p>Date: ${new Date(order.date).toLocaleString()}</p>
                <p>Status: ${order.status}</p>
            </div>
            
            <div class="customer-info">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${order.customer.name}</p>
                <p><strong>Email:</strong> ${order.customer.email}</p>
                <p><strong>Phone:</strong> ${order.customer.phone}</p>
                <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city} ${order.customer.postal}</p>
            </div>
            
            <div class="order-items">
                <h3>Order Items</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="order-summary">
                <h3>Order Summary</h3>
                <p><strong>Subtotal:</strong> ${formatCurrency(order.total)}</p>
                <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
            </div>
        </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Order #${order.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .print-order { max-width: 800px; margin: 0 auto; }
                    .order-date { margin: 20px 0; }
                    .customer-info, .order-items, .order-summary { margin: 30px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
        </html>
    `);
}

function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    orders = orders.filter(order => order.id !== orderId);
    localStorage.setItem('orders', JSON.stringify(orders));

    updateDashboardStats();
    renderOrders();
    showNotification('Order deleted successfully');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();

    // Set up status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            filterOrders(e.target.value);
        });
    }

    // Set up search functionality
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchOrders();
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

    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'owner-login.html';
        });
    }
});