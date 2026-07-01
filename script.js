// Cart State
let cart = JSON.parse(localStorage.getItem('caracal_cart')) || [];

// DOM Elements
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const whatsappNumber = '918854065069'; // User's requested number

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  setupEventListeners();
  setupAnimations();
  setupShopFilters();
  setupProductGallery();
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

// Parallax background scroll listener removed to improve page responsiveness and fix scroll stuttering.

// Shop Filtering & Sorting
function setupShopFilters() {
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const categoryBtns = document.querySelectorAll('.category-filters .filter-btn');
  const materialBtns = document.querySelectorAll('.material-filters .filter-btn');
  const productGrid = document.getElementById('productGrid');
  
  // Drawer elements
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  const filterDrawer = document.getElementById('filterDrawer');
  const filterDrawerOverlay = document.getElementById('filterDrawerOverlay');
  const closeFilterDrawerBtn = document.getElementById('closeFilterDrawerBtn');
  const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  const activeFiltersBadge = document.getElementById('activeFiltersBadge');
  
  if (!productGrid) return; // Exit if not on shop page
  
  const initialCards = Array.from(productGrid.querySelectorAll('.product-card'));
  // Cache original index and properties
  const cachedCards = initialCards.map((card, idx) => {
    const title = card.dataset.title ? card.dataset.title.toLowerCase() : card.querySelector('.product-title').textContent.toLowerCase();
    const category = card.dataset.category ? card.dataset.category.toLowerCase() : card.querySelector('.product-category').textContent.toLowerCase();
    const material = card.dataset.material ? card.dataset.material.toLowerCase() : '';
    const price = parseFloat(card.dataset.price || 0);
    return { card, idx, title, category, material, price };
  });
  
  let currentCategory = 'all';
  let currentMaterial = 'all';
  let searchQuery = '';
  let currentSort = 'default';
  
  // Toggle Drawer logic
  if (filterToggleBtn && filterDrawer && filterDrawerOverlay) {
    filterToggleBtn.addEventListener('click', () => {
      filterDrawer.classList.add('show');
      filterDrawerOverlay.classList.add('show');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
  }
  
  function closeDrawer() {
    if (filterDrawer && filterDrawerOverlay) {
      filterDrawer.classList.remove('show');
      filterDrawerOverlay.classList.remove('show');
      document.body.style.overflow = ''; // Restore scrolling
    }
  }
  
  if (closeFilterDrawerBtn) {
    closeFilterDrawerBtn.addEventListener('click', closeDrawer);
  }
  if (filterDrawerOverlay) {
    filterDrawerOverlay.addEventListener('click', closeDrawer);
  }
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', closeDrawer);
  }
  
  function updateBadge() {
    if (!activeFiltersBadge) return;
    let activeCount = 0;
    if (currentCategory !== 'all') activeCount++;
    if (currentMaterial !== 'all') activeCount++;
    
    if (activeCount > 0) {
      activeFiltersBadge.textContent = activeCount;
      activeFiltersBadge.style.display = 'inline-flex';
    } else {
      activeFiltersBadge.style.display = 'none';
    }
  }
  
  function applyFilters() {
    let matches = cachedCards.filter(item => {
      const matchesSearch = item.title.includes(searchQuery) || item.category.includes(searchQuery);
      const matchesCategory = currentCategory === 'all' || item.category.trim() === currentCategory;
      const productMaterials = item.material.split(',').map(m => m.trim());
      const matchesMaterial = currentMaterial === 'all' || productMaterials.includes(currentMaterial);
      const isVisible = matchesSearch && matchesCategory && matchesMaterial;
      
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
    
    // Update badge count
    updateBadge();
    
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
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category.toLowerCase().trim();
      applyFilters();
    });
  });

  // Material filter buttons listeners
  materialBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      materialBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMaterial = btn.dataset.material.toLowerCase().trim();
      applyFilters();
    });
  });

  // Clear all filters logic
  if (clearAllFiltersBtn) {
    clearAllFiltersBtn.addEventListener('click', () => {
      currentCategory = 'all';
      currentMaterial = 'all';
      
      categoryBtns.forEach(btn => {
        if (btn.dataset.category === 'all') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      materialBtns.forEach(btn => {
        if (btn.dataset.material === 'all') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      applyFilters();
    });
  }

  // Read category query parameter on load
  const urlParams = new URLSearchParams(window.location.search);
  const urlCategory = urlParams.get('category');
  if (urlCategory) {
    const cleanCategory = urlCategory.toLowerCase().trim();
    categoryBtns.forEach(btn => {
      if (btn.dataset.category.toLowerCase().trim() === cleanCategory) {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = cleanCategory;
      }
    });
    applyFilters();
  }
}

// Product Detail Image Gallery / Slider
function setupProductGallery() {
  const gallery = document.querySelector('.product-gallery');
  if (!gallery) return;

  const mainImage = gallery.querySelector('#mainProductImage');
  const prevBtn = gallery.querySelector('#prevSlideBtn');
  const nextBtn = gallery.querySelector('#nextSlideBtn');
  const thumbnails = Array.from(gallery.querySelectorAll('.thumbnail-img'));
  
  if (!mainImage) return;

  let activeIndex = 0;

  function getVisibleThumbnails() {
    return thumbnails.filter(thumb => !thumb.classList.contains('has-error'));
  }

  function updateGalleryUI() {
    const visibleThumbs = getVisibleThumbnails();
    
    // If only one image exists, hide slider buttons and thumbnail row
    if (visibleThumbs.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      const thumbnailContainer = gallery.querySelector('.product-thumbnails');
      if (thumbnailContainer) thumbnailContainer.style.display = 'none';
      return;
    }

    // Show slide buttons and thumbnail container if they were hidden
    if (prevBtn) prevBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = '';
    const thumbnailContainer = gallery.querySelector('.product-thumbnails');
    if (thumbnailContainer) thumbnailContainer.style.display = 'flex';

    // Update active state
    thumbnails.forEach((thumb, idx) => {
      if (idx === activeIndex) {
        thumb.classList.add('active');
        mainImage.src = thumb.src;
        mainImage.alt = thumb.alt;
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  // Handle image load error (for non-existent images)
  thumbnails.forEach((thumb) => {
    // If image has already failed before JS runs (due to inline onerror), hide it
    if (thumb.style.display === 'none') {
      thumb.classList.add('has-error');
    }
    
    // Attach error listener in case it loads later or triggers late
    thumb.addEventListener('error', () => {
      thumb.style.display = 'none';
      thumb.classList.add('has-error');
      // If the active thumbnail errored, default to index 0
      const visibleThumbs = getVisibleThumbnails();
      if (thumbnails.indexOf(thumb) === activeIndex && visibleThumbs.length > 0) {
        activeIndex = thumbnails.indexOf(visibleThumbs[0]);
      }
      updateGalleryUI();
    });

    // When clicked, make active
    thumb.addEventListener('click', () => {
      activeIndex = thumbnails.indexOf(thumb);
      updateGalleryUI();
    });
  });

  // Slide navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const visibleThumbs = getVisibleThumbnails();
      if (visibleThumbs.length <= 1) return;
      
      let currentSubIndex = visibleThumbs.findIndex(t => thumbnails.indexOf(t) === activeIndex);
      currentSubIndex = (currentSubIndex - 1 + visibleThumbs.length) % visibleThumbs.length;
      activeIndex = thumbnails.indexOf(visibleThumbs[currentSubIndex]);
      updateGalleryUI();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const visibleThumbs = getVisibleThumbnails();
      if (visibleThumbs.length <= 1) return;
      
      let currentSubIndex = visibleThumbs.findIndex(t => thumbnails.indexOf(t) === activeIndex);
      currentSubIndex = (currentSubIndex + 1) % visibleThumbs.length;
      activeIndex = thumbnails.indexOf(visibleThumbs[currentSubIndex]);
      updateGalleryUI();
    });
  }

  // Initial check after short delay to let inline onerror events run
  setTimeout(updateGalleryUI, 50);
}

