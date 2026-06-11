// Cart State
let cart = JSON.parse(localStorage.getItem('caracal_cart')) || [];

// DOM Elements
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const whatsappNumber = '918949192672'; // User's requested number

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  setupEventListeners();
  setupAnimations();
  setupShopFilters();
});

function setupEventListeners() {
  // Cart Toggles
  const cartToggleBtns = document.querySelectorAll('.cart-toggle');
  cartToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleCart();
    });
  });

  const closeCartBtn = document.getElementById('closeCart');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', toggleCart);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', toggleCart);
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active-menu');
      mobileMenuBtn.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active-menu');
        document.body.style.overflow = '';
        mobileMenuBtn.innerHTML = '<i data-lucide="menu"></i>';
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }
      });
    });
  }

  // Add to cart buttons
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('[data-id]');
      if (!container) return;
      const id = container.dataset.id;
      const title = container.dataset.title;
      const price = parseFloat(container.dataset.price);
      const img = container.dataset.img;
      
      addToCart({ id, title, price, img });
      
      // Animation feedback
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="lucide-check"></i> Added';
      btn.style.backgroundColor = 'var(--accent-primary-hover)';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
      }, 2000);
    });
  });

  // Checkout Button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let isScrollingNav = false;
    window.addEventListener('scroll', () => {
      if (!isScrollingNav) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          isScrollingNav = false;
        });
        isScrollingNav = true;
      }
    });
  }

  // Masterpieces carousel scroll track sync
  const categoryGrid = document.querySelector('.category-grid');
  const categoryScrollThumb = document.getElementById('categoryScrollThumb');
  if (categoryGrid && categoryScrollThumb) {
    let isScrollingCarousel = false;
    categoryGrid.addEventListener('scroll', () => {
      if (!isScrollingCarousel) {
        window.requestAnimationFrame(() => {
          const maxScroll = categoryGrid.scrollWidth - categoryGrid.clientWidth;
          if (maxScroll > 0) {
            const scrollPct = categoryGrid.scrollLeft / maxScroll;
            categoryScrollThumb.style.left = `${scrollPct * 60}px`;
          }
          isScrollingCarousel = false;
        });
        isScrollingCarousel = true;
      }
    });
  }
}

function toggleCart() {
  cartSidebar.classList.toggle('open');
  cartOverlay.classList.toggle('open');
  if (cartSidebar.classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartUI();
  toggleCart(); // Open cart to show user
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('caracal_cart', JSON.stringify(cart));
}

function updateCartUI() {
  if (!cartItemsContainer || !cartTotalElement || !cartBadge) return;

  // Update Badge
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
  cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';

  // Update Items List
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
    cartTotalElement.textContent = '₹0.00';
    return;
  }

  let html = '';
  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.title}</h4>
          <div class="cart-item-price">₹${item.price.toFixed(2)} x ${item.quantity}</div>
          <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = html;
  cartTotalElement.textContent = '₹' + total.toFixed(2);
}

function handleCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let message = "Hello Caracal Bharat, I would like to place an order for the following items:\n\n";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `${index + 1}. ${item.title} (x${item.quantity}) - ₹${itemTotal.toFixed(2)}\n`;
  });

  message += `\n*Total Amount: ₹${total.toFixed(2)}*\n\nPlease let me know the payment and delivery details.`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  
  // Clear cart after checkout initiation
  cart = [];
  saveCart();
  updateCartUI();
  toggleCart();
  
  window.open(whatsappUrl, '_blank');
}

// Intersection Observer for fade-in animations
function setupAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in, .reveal-up, .reveal-left, .reveal-right');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible', 'active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  fadeElements.forEach(el => observer.observe(el));
}

// Parallax Effect for Hero Section
const heroSection = document.querySelector('.hero');
if (heroSection) {
  let isScrollingHero = false;
  window.addEventListener('scroll', () => {
    if (!isScrollingHero) {
      window.requestAnimationFrame(() => {
        let scrollPosition = window.pageYOffset;
        heroSection.style.backgroundPositionY = (scrollPosition * 0.4) + 'px';
        isScrollingHero = false;
      });
      isScrollingHero = true;
    }
  });
}

// Shop Filtering & Sorting
function setupShopFilters() {
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productGrid = document.getElementById('productGrid');
  
  if (!productGrid) return; // Exit if not on shop page
  
  const initialCards = Array.from(productGrid.querySelectorAll('.product-card'));
  // Cache original index
  const cachedCards = initialCards.map((card, idx) => ({
    card,
    idx,
    title: card.dataset.title ? card.dataset.title.toLowerCase() : card.querySelector('.product-title').textContent.toLowerCase(),
    category: card.querySelector('.product-category').textContent.toLowerCase(),
    price: parseFloat(card.dataset.price || 0)
  }));
  
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSort = 'default';
  
  function applyFilters() {
    let matches = cachedCards.filter(item => {
      const matchesSearch = item.title.includes(searchQuery) || item.category.includes(searchQuery);
      const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
      const isVisible = matchesSearch && matchesCategory;
      
      item.card.style.display = isVisible ? '' : 'none';
      return isVisible;
    });
    
    // Sort matching ones
    if (currentSort === 'low-to-high') {
      matches.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'high-to-low') {
      matches.sort((a, b) => b.price - a.price);
    } else {
      matches.sort((a, b) => a.idx - b.idx);
    }
    
    // Re-append nodes in the sorted order
    matches.forEach(item => {
      productGrid.appendChild(item.card);
    });
    
    // Trigger scroll animations for remaining visible items
    if (typeof setupAnimations === 'function') {
      setupAnimations();
    }
  }
  
  // Search listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }
  
  // Sort selector listener
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFilters();
    });
  }
  
  // Category filter buttons listeners
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category.toLowerCase().trim();
      applyFilters();
    });
  });
}

