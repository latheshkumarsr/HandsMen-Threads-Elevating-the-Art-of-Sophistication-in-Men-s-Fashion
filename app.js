// HandsMen Threads E-commerce Application

// Sample data
const productsData = [
  {
    id: 1,
    name: "Classic Navy Suit",
    price: 899,
    category: "Suits",
    image: "/api/placeholder/400/500",
    description: "Sophisticated navy wool suit with modern tailoring. Perfect for business meetings and formal occasions. Made from premium wool with a contemporary fit.",
    sizes: ["38", "40", "42", "44", "46"],
    colors: ["Navy", "Charcoal"],
    featured: true
  },
  {
    id: 2,
    name: "White Dress Shirt",
    price: 189,
    category: "Shirts",
    image: "/api/placeholder/400/500",
    description: "Premium cotton dress shirt with French cuffs. Crisp, clean lines with exceptional attention to detail. Perfect for any professional setting.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Light Blue"],
    featured: true
  },
  {
    id: 3,
    name: "Leather Oxford Shoes",
    price: 349,
    category: "Shoes",
    image: "/api/placeholder/400/500",
    description: "Handcrafted Italian leather oxford shoes. Classic design meets modern comfort with premium materials and expert craftsmanship.",
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Black", "Brown"],
    featured: false
  },
  {
    id: 4,
    name: "Silk Tie Collection",
    price: 89,
    category: "Accessories",
    image: "/api/placeholder/400/500",
    description: "Premium silk tie with sophisticated patterns. Add the perfect finishing touch to your professional wardrobe.",
    sizes: ["One Size"],
    colors: ["Navy", "Burgundy", "Silver"],
    featured: true
  },
  {
    id: 5,
    name: "Wool Blazer",
    price: 549,
    category: "Blazers",
    image: "/api/placeholder/400/500",
    description: "Tailored wool blazer for business and formal occasions. Versatile piece that pairs perfectly with dress pants or jeans.",
    sizes: ["38", "40", "42", "44", "46"],
    colors: ["Navy", "Charcoal", "Brown"],
    featured: false
  },
  {
    id: 6,
    name: "Cashmere Sweater",
    price: 329,
    category: "Sweaters",
    image: "/api/placeholder/400/500",
    description: "Luxurious cashmere V-neck sweater. Soft, warm, and sophisticated - perfect for cooler weather and layering.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Grey", "Navy", "Camel"],
    featured: true
  }
];

const categoriesData = [
  {name: "Suits", count: 15},
  {name: "Shirts", count: 24},
  {name: "Blazers", count: 12},
  {name: "Accessories", count: 18},
  {name: "Shoes", count: 14},
  {name: "Sweaters", count: 16}
];

// Application state
let currentPage = 'home';
let cart = [];
let filters = {
  category: [],
  color: [],
  priceMax: 1000,
  search: ''
};
let sortBy = 'name';
let selectedProduct = null;
let currentAccountSection = 'profile';

// DOM elements
let pages, navLinks, cartCountElement, searchInput, sortSelect, priceRange, priceValue, clearFiltersBtn;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeDOMElements();
  initializeApp();
  setupEventListeners();
  loadHomePage();
});

function initializeDOMElements() {
  pages = document.querySelectorAll('.page');
  navLinks = document.querySelectorAll('[data-page]');
  cartCountElement = document.querySelector('.cart-count');
  searchInput = document.querySelector('.search-input');
  sortSelect = document.getElementById('sort-select');
  priceRange = document.getElementById('price-range');
  priceValue = document.getElementById('price-value');
  clearFiltersBtn = document.getElementById('clear-filters');
}

function initializeApp() {
  updateCartCount();
  setupPriceRange();
}

function setupEventListeners() {
  // Global event delegation for navigation and buttons
  document.addEventListener('click', handleGlobalClick);
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }
  
  const searchBtn = document.querySelector('.search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }

  // Sort functionality
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSort);
  }

  // Price range
  if (priceRange) {
    priceRange.addEventListener('input', handlePriceFilter);
  }

  // Clear filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearAllFilters);
  }

  // Modal close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function handleGlobalClick(e) {
  // Navigation handling
  if (e.target.hasAttribute('data-page')) {
    e.preventDefault();
    const page = e.target.getAttribute('data-page');
    navigateToPage(page);
    return;
  }

  // Logo click to home
  if (e.target.closest('.logo')) {
    e.preventDefault();
    navigateToPage('home');
    return;
  }

  // Add to cart buttons
  if (e.target.classList.contains('add-to-cart-btn')) {
    e.stopPropagation();
    const productId = parseInt(e.target.dataset.productId);
    addToCart(productId);
    return;
  }

  // Quick view buttons
  if (e.target.classList.contains('quick-view-btn')) {
    e.stopPropagation();
    const productId = parseInt(e.target.dataset.productId);
    showProductDetail(productId);
    return;
  }

  // Product card clicks
  if (e.target.closest('.product-card')) {
    const card = e.target.closest('.product-card');
    const productId = parseInt(card.dataset.productId);
    showProductDetail(productId);
    return;
  }

  // Category card clicks
  if (e.target.closest('.category-card')) {
    const card = e.target.closest('.category-card');
    const category = card.dataset.category;
    filters.category = [category];
    navigateToPage('catalog');
    return;
  }

  // Modal handling
  if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
    closeModal();
    return;
  }

  // Size guide button
  if (e.target.textContent.includes('Size Guide')) {
    e.preventDefault();
    showSizeGuide();
    return;
  }

  // Account navigation
  if (e.target.classList.contains('account-nav-link')) {
    e.preventDefault();
    const section = e.target.dataset.section;
    
    // Update active link
    document.querySelectorAll('.account-nav-link').forEach(l => l.classList.remove('active'));
    e.target.classList.add('active');
    
    loadAccountContent(section);
    return;
  }

  // Checkout button
  if (e.target.id === 'checkout-btn') {
    navigateToPage('checkout');
    return;
  }

  // Place order button
  if (e.target.id === 'place-order-btn') {
    handlePlaceOrder();
    return;
  }

  // Quantity controls in product detail
  if (e.target.onclick && e.target.onclick.toString().includes('changeQuantity')) {
    // Let the onclick handler deal with it
    return;
  }

  // Quantity controls in cart
  if (e.target.onclick && e.target.onclick.toString().includes('updateCartItemQuantity')) {
    // Let the onclick handler deal with it
    return;
  }

  // Remove from cart
  if (e.target.onclick && e.target.onclick.toString().includes('removeFromCart')) {
    // Let the onclick handler deal with it
    return;
  }

  // Add to cart detailed
  if (e.target.onclick && e.target.onclick.toString().includes('addToCartDetailed')) {
    // Let the onclick handler deal with it
    return;
  }
}

function navigateToPage(pageName) {
  // Hide all pages
  pages.forEach(page => page.classList.remove('active'));
  
  // Show selected page
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
    currentPage = pageName;
    
    // Update active nav link
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // Load page content
    switch(pageName) {
      case 'home':
        loadHomePage();
        break;
      case 'catalog':
        loadCatalogPage();
        break;
      case 'cart':
        loadCartPage();
        break;
      case 'account':
        loadAccountPage();
        break;
      case 'checkout':
        loadCheckoutPage();
        break;
    }
  }
}

function loadHomePage() {
  loadFeaturedProducts();
  loadCategories();
}

function loadFeaturedProducts() {
  const container = document.getElementById('featured-products-grid');
  if (!container) return;
  
  const featuredProducts = productsData.filter(product => product.featured);
  container.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
}

function loadCategories() {
  const container = document.getElementById('categories-grid');
  if (!container) return;
  
  container.innerHTML = categoriesData.map(category => `
    <div class="category-card" data-category="${category.name}">
      <h3 class="category-name">${category.name}</h3>
      <p class="category-count">${category.count} items</p>
    </div>
  `).join('');
}

function loadCatalogPage() {
  loadCategoryFilters();
  loadColorFilters();
  loadProducts();
}

function loadCategoryFilters() {
  const container = document.getElementById('category-filters');
  if (!container) return;
  
  container.innerHTML = categoriesData.map(category => `
    <label class="filter-option">
      <input type="checkbox" value="${category.name}" ${filters.category.includes(category.name) ? 'checked' : ''}>
      <span>${category.name} (${category.count})</span>
    </label>
  `).join('');
  
  // Add event listeners
  container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', handleCategoryFilter);
  });
}

function loadColorFilters() {
  const container = document.getElementById('color-filters');
  if (!container) return;
  
  const allColors = [...new Set(productsData.flatMap(product => product.colors))];
  
  container.innerHTML = allColors.map(color => `
    <label class="color-option ${filters.color.includes(color) ? 'active' : ''}" data-color="${color}">
      <input type="checkbox" value="${color}" ${filters.color.includes(color) ? 'checked' : ''}>
      <span>${color}</span>
    </label>
  `).join('');
  
  // Add event listeners
  container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', handleColorFilter);
  });
}

function loadProducts() {
  const container = document.getElementById('catalog-products-grid');
  if (!container) return;
  
  let filteredProducts = filterProducts(productsData);
  filteredProducts = sortProducts(filteredProducts);
  
  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">Product Image</div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">$${product.price}</p>
        <div class="product-actions">
          <button class="btn btn--primary btn--sm add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
          <button class="btn btn--outline btn--sm quick-view-btn" data-product-id="${product.id}">Quick View</button>
        </div>
      </div>
    </div>
  `;
}

function showProductDetail(productId) {
  selectedProduct = productsData.find(p => p.id === productId);
  if (!selectedProduct) return;
  
  const container = document.getElementById('product-detail-content');
  container.innerHTML = `
    <div class="product-gallery">
      <div class="main-image">Product Image</div>
    </div>
    <div class="product-details">
      <h1 class="product-title">${selectedProduct.name}</h1>
      <p class="product-price-large">$${selectedProduct.price}</p>
      <p class="product-description">${selectedProduct.description}</p>
      
      <div class="product-options">
        <div class="option-group">
          <label class="option-label">Size:</label>
          <div class="size-options">
            ${selectedProduct.sizes.map(size => `
              <button class="size-option" data-size="${size}">${size}</button>
            `).join('')}
          </div>
          <button class="btn btn--outline btn--sm">Size Guide</button>
        </div>
        
        <div class="option-group">
          <label class="option-label">Color:</label>
          <div class="color-options">
            ${selectedProduct.colors.map(color => `
              <button class="color-option-btn" data-color="${color}">${color}</button>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="product-actions-detail">
        <div class="quantity-selector">
          <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
          <input type="number" class="quantity-input" value="1" min="1" id="product-quantity">
          <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
        </div>
        <button class="btn btn--primary" onclick="addToCartDetailed()">Add to Cart</button>
      </div>
      
      <div class="product-recommendations">
        <h3>You might also like</h3>
        <div class="recommendations-grid">
          ${getRecommendations(selectedProduct).map(product => createProductCard(product)).join('')}
        </div>
      </div>
    </div>
  `;
  
  // Setup option selection
  setupProductOptions();
  
  navigateToPage('product-detail');
}

function setupProductOptions() {
  // Size selection
  document.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
  
  // Color selection
  document.querySelectorAll('.color-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}

// Global functions for onclick handlers
window.changeQuantity = function(delta) {
  const input = document.getElementById('product-quantity');
  if (input) {
    const currentValue = parseInt(input.value);
    const newValue = Math.max(1, currentValue + delta);
    input.value = newValue;
  }
}

window.addToCartDetailed = function() {
  if (!selectedProduct) return;
  
  const size = document.querySelector('.size-option.selected')?.dataset.size;
  const color = document.querySelector('.color-option-btn.selected')?.dataset.color;
  const quantityInput = document.getElementById('product-quantity');
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
  
  if (!size || !color) {
    alert('Please select size and color');
    return;
  }
  
  addToCart(selectedProduct.id, quantity, { size, color });
}

window.updateCartItemQuantity = function(itemId, delta) {
  const item = cart.find(item => item.id === itemId);
  if (!item) return;
  
  item.quantity = Math.max(1, item.quantity + delta);
  updateCartCount();
  loadCartPage();
}

window.removeFromCart = function(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  updateCartCount();
  loadCartPage();
}

function addToCart(productId, quantity = 1, options = {}) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;
  
  const cartItem = {
    id: Date.now(),
    productId: productId,
    product: product,
    quantity: quantity,
    options: options
  };
  
  cart.push(cartItem);
  updateCartCount();
  
  // Show confirmation
  alert(`${product.name} added to cart!`);
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
  }
}

function loadCartPage() {
  const container = document.getElementById('cart-items');
  const subtotalElement = document.getElementById('cart-subtotal');
  const totalElement = document.getElementById('cart-total');
  
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Your cart is empty</h3>
        <p>Add some products to get started.</p>
        <button class="btn btn--primary" data-page="catalog">Shop Now</button>
      </div>
    `;
    if (subtotalElement) subtotalElement.textContent = '$0.00';
    if (totalElement) totalElement.textContent = '$15.00';
    return;
  }
  
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">Image</div>
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.product.name}</h4>
        <p class="cart-item-details">
          ${item.options.size ? `Size: ${item.options.size}` : ''} 
          ${item.options.color ? `| Color: ${item.options.color}` : ''}
        </p>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-selector">
          <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, -1)">-</button>
          <span class="quantity-display">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, 1)">+</button>
        </div>
        <p class="cart-item-price">$${(item.product.price * item.quantity).toFixed(2)}</p>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
      </div>
    </div>
  `).join('');
  
  // Update totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 15.00;
  const total = subtotal + shipping;
  
  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

function loadAccountPage() {
  loadAccountContent('profile');
}

function loadAccountContent(section) {
  const container = document.getElementById('account-content');
  if (!container) return;
  
  switch(section) {
    case 'profile':
      container.innerHTML = `
        <div class="card">
          <div class="card__body">
            <h2>Profile Information</h2>
            <form>
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input type="text" class="form-control" value="John">
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input type="text" class="form-control" value="Doe">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" value="john.doe@example.com">
              </div>
              <button type="submit" class="btn btn--primary">Update Profile</button>
            </form>
          </div>
        </div>
      `;
      break;
    case 'orders':
      container.innerHTML = `
        <div class="card">
          <div class="card__body">
            <h2>Order History</h2>
            <div class="empty-state">
              <h3>No orders yet</h3>
              <p>When you place your first order, it will appear here.</p>
            </div>
          </div>
        </div>
      `;
      break;
    case 'wishlist':
      container.innerHTML = `
        <div class="card">
          <div class="card__body">
            <h2>Wishlist</h2>
            <div class="empty-state">
              <h3>Your wishlist is empty</h3>
              <p>Save items you love for later.</p>
            </div>
          </div>
        </div>
      `;
      break;
    case 'settings':
      container.innerHTML = `
        <div class="card">
          <div class="card__body">
            <h2>Account Settings</h2>
            <form>
              <div class="form-group">
                <label class="form-label">Notifications</label>
                <label class="filter-option">
                  <input type="checkbox" checked>
                  <span>Email notifications</span>
                </label>
                <label class="filter-option">
                  <input type="checkbox">
                  <span>SMS notifications</span>
                </label>
              </div>
              <button type="submit" class="btn btn--primary">Save Settings</button>
            </form>
          </div>
        </div>
      `;
      break;
  }
}

function loadCheckoutPage() {
  const container = document.getElementById('checkout-items');
  const totalElement = document.getElementById('checkout-total');
  
  if (!container || !totalElement) return;
  
  // Load cart items
  container.innerHTML = cart.map(item => `
    <div class="summary-line">
      <span>${item.product.name} × ${item.quantity}</span>
      <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');
  
  // Calculate total
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 15.00;
  const total = subtotal + shipping;
  
  totalElement.textContent = `$${total.toFixed(2)}`;
}

function handlePlaceOrder() {
  // Simple order confirmation for demo
  alert('Order placed successfully! Thank you for your purchase.');
  cart = [];
  updateCartCount();
  navigateToPage('home');
}

// Filter and search functions
function handleSearch() {
  if (searchInput) {
    filters.search = searchInput.value.toLowerCase();
    if (currentPage === 'catalog') {
      loadProducts();
    } else {
      // Navigate to catalog page with search results
      navigateToPage('catalog');
    }
  }
}

function handleSort() {
  if (sortSelect) {
    sortBy = sortSelect.value;
    if (currentPage === 'catalog') {
      loadProducts();
    }
  }
}

function handleCategoryFilter(e) {
  const category = e.target.value;
  if (e.target.checked) {
    filters.category.push(category);
  } else {
    filters.category = filters.category.filter(c => c !== category);
  }
  loadProducts();
}

function handleColorFilter(e) {
  const color = e.target.value;
  if (e.target.checked) {
    filters.color.push(color);
  } else {
    filters.color = filters.color.filter(c => c !== color);
  }
  loadProducts();
}

function handlePriceFilter() {
  if (priceRange && priceValue) {
    filters.priceMax = parseInt(priceRange.value);
    priceValue.textContent = filters.priceMax;
    if (currentPage === 'catalog') {
      loadProducts();
    }
  }
}

function setupPriceRange() {
  if (priceRange && priceValue) {
    priceValue.textContent = priceRange.value;
  }
}

function clearAllFilters() {
  filters = {
    category: [],
    color: [],
    priceMax: 1000,
    search: ''
  };
  
  // Reset UI
  const categoryCheckboxes = document.querySelectorAll('#category-filters input[type="checkbox"]');
  categoryCheckboxes.forEach(cb => cb.checked = false);
  
  const colorCheckboxes = document.querySelectorAll('#color-filters input[type="checkbox"]');
  colorCheckboxes.forEach(cb => cb.checked = false);
  
  if (priceRange && priceValue) {
    priceRange.value = 1000;
    priceValue.textContent = '1000';
  }
  
  if (searchInput) {
    searchInput.value = '';
  }
  
  loadProducts();
}

function filterProducts(products) {
  return products.filter(product => {
    // Category filter
    if (filters.category.length > 0 && !filters.category.includes(product.category)) {
      return false;
    }
    
    // Color filter
    if (filters.color.length > 0 && !product.colors.some(color => filters.color.includes(color))) {
      return false;
    }
    
    // Price filter
    if (product.price > filters.priceMax) {
      return false;
    }
    
    // Search filter
    if (filters.search && !product.name.toLowerCase().includes(filters.search) && 
        !product.category.toLowerCase().includes(filters.search)) {
      return false;
    }
    
    return true;
  });
}

function sortProducts(products) {
  switch(sortBy) {
    case 'price-low':
      return products.sort((a, b) => a.price - b.price);
    case 'price-high':
      return products.sort((a, b) => b.price - a.price);
    case 'featured':
      return products.sort((a, b) => b.featured - a.featured);
    case 'name':
    default:
      return products.sort((a, b) => a.name.localeCompare(b.name));
  }
}

function getRecommendations(product) {
  return productsData
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 2);
}

// Modal functions
function showSizeGuide() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeModal() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.add('hidden');
  });
}

// Utility functions
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}