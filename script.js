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
      navLinks.classList.toggle('active-menu');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active-menu');
      });
    });
  }

  // Add to cart buttons
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productCard = e.target.closest('.product-card');
      const id = productCard.dataset.id;
      const title = productCard.dataset.title;
      const price = parseFloat(productCard.dataset.price);
      const img = productCard.dataset.img;
      
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
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
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
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero');
  if (hero) {
    let scrollPosition = window.pageYOffset;
    hero.style.backgroundPositionY = (scrollPosition * 0.4) + 'px';
  }
});
