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

let currentMode = 'all';

// Product data (this would come from an API)
const products = [
    {
        id: 1,
        name: 'Adjustable Base Jack',
        rentPrice: 60.00,
        salePrice: 300.00,
        image: 'images/Adjustable-Base-Jack.jpg',
        description: 'Provides height adjustment and stability for scaffolding structures.'
    },
    {
        id: 2,
        name: 'Catwalk',
        rentPrice: 200.00,
        salePrice: 2000.00,
        image: 'images/Scaffolding-Catwalk.jpg',
        description: 'A sturdy walkway for safe movement on scaffolding.'
    },
    {
        id: 3,
        name: 'Adjustable U-Head',
        rentPrice: 60.00,
        salePrice: 330.00,
        image: 'images/Adjustable-U-Head.png',
        description: 'Supports beams with adjustable height for precise leveling.'
    },
    {
        id: 4,
        name: 'Swivel Clamp',
        rentPrice: 20.00,
        salePrice: 60.00,
        image: 'images/Swivel-Clamp.jpg',
        description: 'Connects scaffold tubes at various angles for flexibility.'
    },
    {
        id: 5,
        name: 'Ladder',
        rentPrice: 300.00,
        salePrice: 2800.00,
        image: 'images/Ladder.jpg',
        description: 'Ensures safe access to different scaffold levels.'
    },
    {
        id: 6,
        name: 'Caster Wheel',
        rentPrice: 100.00,
        salePrice: 850.00,
        image: 'images/Caster-Wheel.jpg',
        description: 'Adds mobility to scaffolding for easy repositioning.'
    },
    {
        id: 7,
        name: 'Shoring Jack',
        rentPrice: 200.00,
        salePrice: 1300.00,
        image: 'images/Shoring-Jack.jpg',
        description: 'Supports heavy loads in construction and formwork.'
    },
    {
        id: 8,
        name: 'BI Scaffolding Set',
        rentPrice: 300.00,
        salePrice: 2800.00,
        image: 'images/BI-Scaffolding-Set.jpg',
        description: 'Provides stable and durable support for construction work.'
    }
];

let filteredProducts = [...products];

// Filter products by category
function filterByCategory(mode) {
    currentMode = mode;
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${mode}"]`).classList.add('active');

    filteredProducts = [...products];
    updatePriceRange();
    renderProducts();
}

// Filter products by price range
function filterByPrice() {
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;

    let keyPrice = 'rentPrice';
    if (currentMode === 'sale') {
        keyPrice = 'salePrice';
    } else if (currentMode === 'all') {
        keyPrice = 'rentPrice';
    }

    filteredProducts = products.filter(product =>
        product[keyPrice] >= minPrice && product[keyPrice] <= maxPrice
    );

    renderProducts();
}

// Update price range inputs
function updatePriceRange() {
    let prices;
    if (currentMode === 'sale') {
        prices = products.map(product => product.salePrice);
    } else {
        prices = products.map(product => product.rentPrice);
    }
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const priceRange = document.getElementById('priceRange');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    priceRange.min = minPrice;
    priceRange.max = maxPrice;
    priceRange.value = maxPrice;

    minPriceInput.value = minPrice.toFixed(2);
    maxPriceInput.value = maxPrice.toFixed(2);
}

// Render products
function renderProducts() {
    const productsGrid = document.querySelector('.products-grid');

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <p>No products found matching your criteria.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => {
        if (currentMode === 'rent') {
            return `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price-rent">Rent: ${formatCurrency(product.rentPrice)} / month</p>
                        <p class="description">${product.description}</p>
                        <button class="add-to-cart" data-product-id="${product.id}" data-action="rent">
                            <i class="fas fa-shopping-cart"></i> RENT
                        </button>
                    </div>
                </div>
            `;
        } else if (currentMode === 'sale') {
            return `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price-sale">Sale: ${formatCurrency(product.salePrice)}</p>
                        <p class="description">${product.description}</p>
                        <button class="add-to-cart" data-product-id="${product.id}" data-action="sale">
                            <i class="fas fa-shopping-cart"></i> BUY
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="price-rent">Rent: ${formatCurrency(product.rentPrice)} / month</p>
            <p class="price-sale">Sale: ${formatCurrency(product.salePrice)}</p>
            <p class="description">${product.description}</p>
            <div class="action-buttons">
                <button class="add-to-cart" data-product-id="${product.id}" data-action="sale">
                    <i class="fas fa-shopping-cart"></i> BUY
                </button>
                <button class="add-to-cart" data-product-id="${product.id}" data-action="rent">
                    <i class="fas fa-shopping-cart"></i> RENT
                </button>
            </div>
        </div>
    </div>
`;
        }
    }).join('');

    // Add event listeners to Add to Cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
}

// Handle add to cart
function handleAddToCart(event) {
    const button = event.currentTarget;
    const productId = parseInt(button.dataset.productId);
    const action = button.dataset.action;
    const product = products.find(p => p.id === productId);

    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    let price, purchaseType;
    if (action === 'rent') {
        price = product.rentPrice;
        purchaseType = 'rent';
    } else if (action === 'sale') {
        price = product.salePrice;
        purchaseType = 'sale';
    }

    // Disable button temporarily
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === productId && item.purchaseType === purchaseType);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: price,
                image: product.image,
                quantity: 1,
                purchaseType: purchaseType
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Product added to cart!');

        // Reset button after successful addition
        setTimeout(() => {
            button.disabled = false;
            if (currentMode === 'all') {
                if (action === 'rent') {
                    button.innerHTML = '<i class="fas fa-shopping-cart"></i> RENT';
                } else {
                    button.innerHTML = '<i class="fas fa-shopping-cart"></i> BUY';
                }
            } else if (currentMode === 'rent') {
                button.innerHTML = '<i class="fas fa-shopping-cart"></i> RENT';
            } else if (currentMode === 'sale') {
                button.innerHTML = '<i class="fas fa-shopping-cart"></i> BUY';
            }
        }, 500);
    } catch (error) {
        showNotification('Failed to add product to cart', 'error');
        button.disabled = false;
        if (currentMode === 'all') {
            if (action === 'rent') {
                button.innerHTML = '<i class="fas fa-shopping-cart"></i> RENT';
            } else {
                button.innerHTML = '<i class="fas fa-shopping-cart"></i> BUY';
            }
        } else if (currentMode === 'rent') {
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> RENT';
        } else if (currentMode === 'sale') {
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> BUY';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Setup price range filter
    const priceRange = document.getElementById('priceRange');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    priceRange.addEventListener('input', (e) => {
        maxPriceInput.value = parseFloat(e.target.value).toFixed(2);
        filterByPrice();
    });

    minPriceInput.addEventListener('change', filterByPrice);
    maxPriceInput.addEventListener('change', filterByPrice);

    // Set up category filter
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterByCategory(button.dataset.category);
        });
    });

    // Initial render
    updatePriceRange();
    renderProducts();
}); 