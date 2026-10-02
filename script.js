/**
 * EMBER & BEAN - Client Interactions & Enhancements
 * Pure Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // Global Toast Notification Helper
  // --------------------------------------------------------------------------
  const toastContainer = document.getElementById('toast-container');

  const escapeHTML = (str) => {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  };

  const showToast = (title, message) => {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="toast-icon">✓</div>
      <div class="toast-message">
        <div class="toast-title">${escapeHTML(title)}</div>
        <div class="toast-sub">${escapeHTML(message)}</div>
      </div>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }, 3800);
  };

  // --------------------------------------------------------------------------
  // 1. Dark / Light Mode with Saved Preference
  // --------------------------------------------------------------------------
  const initTheme = () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const storageKey = 'ember_theme';

    const getPreferredTheme = () => {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (theme, notify = false) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(storageKey, theme);
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute(
          'aria-label',
          theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
        );
      }
      if (notify) {
        showToast(
          'Theme Updated',
          theme === 'dark' ? 'Dark roast mode enabled.' : 'Light crema mode enabled.'
        );
      }
    };

    // Initialize theme immediately
    applyTheme(getPreferredTheme(), false);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme, true);
      });
    }

    // Listen to OS theme changes if user has not set an explicit override
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(storageKey)) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  };

  initTheme();

  // --------------------------------------------------------------------------
  // 2. Navigation & Header Scroll State
  // --------------------------------------------------------------------------
  const header = document.getElementById('site-header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const handleHeaderScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  const toggleMobileMenu = () => {
    const isOpen = navMenu.classList.toggle('is-open');
    hamburgerBtn.classList.toggle('is-active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
  };

  const closeMobileMenu = () => {
    navMenu.classList.remove('is-open');
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  };

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', toggleMobileMenu);

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('is-open') &&
        !navMenu.contains(e.target) &&
        !hamburgerBtn.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. Active Navigation Highlighting on Scroll
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');

  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
  }

  // --------------------------------------------------------------------------
  // 4. Functional Menu Search & Category Filtering
  // --------------------------------------------------------------------------
  const searchInput = document.getElementById('menu-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');
  const noResultsBox = document.getElementById('menu-no-results');
  const resetSearchBtn = document.getElementById('reset-search-btn');

  let activeCategory = 'all';
  let searchQuery = '';

  const filterMenu = () => {
    let visibleCount = 0;

    menuCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardTitle = card.querySelector('.card-title')?.textContent || '';
      const cardDesc = card.querySelector('.card-desc')?.textContent || '';
      const cardMeta = card.querySelector('.card-meta')?.textContent || '';
      const cardText = `${cardTitle} ${cardDesc} ${cardMeta}`.toLowerCase();

      const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
      const matchesSearch = !searchQuery || cardText.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.classList.remove('is-hidden');
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        visibleCount++;
      } else {
        card.classList.add('is-hidden');
      }
    });

    if (noResultsBox) {
      noResultsBox.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  // Search input listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (searchClearBtn) {
        searchClearBtn.style.display = searchQuery ? 'block' : 'none';
      }
      filterMenu();
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClearBtn.style.display = 'none';
        searchInput.focus();
        filterMenu();
      });
    }

    if (resetSearchBtn) {
      resetSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        if (searchClearBtn) searchClearBtn.style.display = 'none';

        activeCategory = 'all';
        filterBtns.forEach(b => {
          const isAll = b.getAttribute('data-filter') === 'all';
          b.classList.toggle('active', isAll);
          b.setAttribute('aria-selected', isAll.toString());
        });

        filterMenu();
      });
    }
  }

  // Filter tabs click listener
  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        activeCategory = btn.getAttribute('data-filter') || 'all';
        filterMenu();
      });
    });
  }

  // --------------------------------------------------------------------------
  // 5. Shopping Cart with Add/Remove, Quantity Controls & Totals Calculation
  // --------------------------------------------------------------------------
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartBadge = document.getElementById('cart-badge');
  const cartCountLabel = document.getElementById('cart-count-label');
  const cartBody = document.getElementById('cart-body');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTaxEl = document.getElementById('cart-tax');
  const cartGrandTotalEl = document.getElementById('cart-grand-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutBtnTotal = document.getElementById('checkout-btn-total');

  const cartStorageKey = 'ember_cart';

  // Load initial cart state
  let cart = [];
  try {
    const saved = localStorage.getItem(cartStorageKey);
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (err) {
    cart = [];
  }

  const saveCart = () => {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  };

  // Open & Close Cart Drawer
  const openCart = () => {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('is-open');
      cartOverlay.classList.add('is-open');
      cartDrawer.setAttribute('aria-hidden', 'false');
      cartOverlay.setAttribute('aria-hidden', 'false');
      if (cartToggleBtn) cartToggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeCart = () => {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('is-open');
      cartOverlay.classList.remove('is-open');
      cartDrawer.setAttribute('aria-hidden', 'true');
      cartOverlay.setAttribute('aria-hidden', 'true');
      if (cartToggleBtn) cartToggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('is-open')) {
      closeCart();
    }
  });

  // Calculate Cart Totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.08; // 8% estimated local sales tax
    const grandTotal = subtotal + tax;
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      totalItems
    };
  };

  // Render Cart Contents
  const renderCart = () => {
    const totals = calculateTotals();

    // Update Badges & Labels
    if (cartBadge) {
      cartBadge.textContent = totals.totalItems.toString();
      cartBadge.setAttribute('aria-label', `${totals.totalItems} items in cart`);
    }

    if (cartCountLabel) {
      cartCountLabel.textContent = `(${totals.totalItems} item${totals.totalItems === 1 ? '' : 's'})`;
    }

    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${totals.subtotal}`;
    if (cartTaxEl) cartTaxEl.textContent = `$${totals.tax}`;
    if (cartGrandTotalEl) cartGrandTotalEl.textContent = `$${totals.grandTotal}`;
    if (checkoutBtnTotal) checkoutBtnTotal.textContent = `• $${totals.grandTotal}`;

    if (!cartBody) return;

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">☕</div>
          <h4 class="cart-empty-title">Your Order is Empty</h4>
          <p class="cart-empty-text">Select your favorite single-origin roasts, signature espresso drinks, or freshly baked pastries.</p>
          <a href="#menu" class="btn btn-outline btn-sm" id="cart-browse-btn">Explore Menu</a>
        </div>
      `;

      const browseBtn = document.getElementById('cart-browse-btn');
      if (browseBtn) {
        browseBtn.addEventListener('click', () => {
          closeCart();
        });
      }

      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    // Render Items List
    let itemsHTML = '<div class="cart-items-list">';
    cart.forEach(item => {
      const itemTotal = (item.price * item.qty).toFixed(2);
      itemsHTML += `
        <div class="cart-item" data-id="${escapeHTML(item.id)}">
          <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.name)}" class="cart-item-img">
          <div class="cart-item-info">
            <span class="cart-item-title">${escapeHTML(item.name)}</span>
            <span class="cart-item-price">$${escapeHTML(item.price.toFixed(2))}</span>
            <div class="cart-item-actions">
              <div class="cart-qty-group">
                <button type="button" class="qty-btn qty-minus" data-id="${escapeHTML(item.id)}" aria-label="Decrease quantity for ${escapeHTML(item.name)}">−</button>
                <span class="qty-display">${item.qty}</span>
                <button type="button" class="qty-btn qty-plus" data-id="${escapeHTML(item.id)}" aria-label="Increase quantity for ${escapeHTML(item.name)}">+</button>
              </div>
              <button type="button" class="cart-remove-btn" data-id="${escapeHTML(item.id)}" aria-label="Remove ${escapeHTML(item.name)} from cart">Remove</button>
            </div>
          </div>
        </div>
      `;
    });
    itemsHTML += '</div>';

    cartBody.innerHTML = itemsHTML;
  };

  // Add Item to Cart
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        img: product.img,
        qty: 1
      });
    }

    saveCart();
    renderCart();

    // Pulse animation on cart badge
    if (cartBadge) {
      cartBadge.classList.add('pulse');
      setTimeout(() => cartBadge.classList.remove('pulse'), 400);
    }

    showToast('Added to Order', `"${product.name}" added to your order.`);
  };

  // Quantity modification
  const updateQuantity = (id, delta) => {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      const newQty = cart[itemIndex].qty + delta;
      if (newQty <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].qty = newQty;
      }
      saveCart();
      renderCart();
    }
  };

  // Remove Item
  const removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
  };

  // Delegated Event Listeners for Cart Actions
  document.addEventListener('click', (e) => {
    // 1. Add to Cart button on cards
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
      const product = {
        id: addBtn.getAttribute('data-id'),
        name: addBtn.getAttribute('data-name'),
        price: addBtn.getAttribute('data-price'),
        img: addBtn.getAttribute('data-img')
      };
      addToCart(product);

      // Micro-animation button confirmation
      addBtn.classList.add('added');
      const textEl = addBtn.querySelector('.add-text');
      const prevText = textEl ? textEl.textContent : 'Add to Order';
      if (textEl) textEl.textContent = 'Added! ✓';

      setTimeout(() => {
        addBtn.classList.remove('added');
        if (textEl) textEl.textContent = prevText;
      }, 1200);
      return;
    }

    // 2. Quantity decrement
    const minusBtn = e.target.closest('.qty-minus');
    if (minusBtn) {
      const id = minusBtn.getAttribute('data-id');
      updateQuantity(id, -1);
      return;
    }

    // 3. Quantity increment
    const plusBtn = e.target.closest('.qty-plus');
    if (plusBtn) {
      const id = plusBtn.getAttribute('data-id');
      updateQuantity(id, 1);
      return;
    }

    // 4. Remove item button
    const removeBtn = e.target.closest('.cart-remove-btn');
    if (removeBtn) {
      const id = removeBtn.getAttribute('data-id');
      removeFromCart(id);
      return;
    }
  });

  // Checkout handling
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Cart is Empty', 'Please add items before checking out.');
        return;
      }

      checkoutBtn.disabled = true;
      checkoutBtn.querySelector('.checkout-btn-text').textContent = 'Processing Order...';

      setTimeout(() => {
        const orderCount = cart.reduce((acc, i) => acc + i.qty, 0);
        cart = [];
        saveCart();
        renderCart();
        closeCart();

        checkoutBtn.disabled = false;
        checkoutBtn.querySelector('.checkout-btn-text').textContent = 'Proceed to Checkout';

        showToast(
          'Order Confirmed! ✓',
          `Your order of ${orderCount} item(s) will be freshly crafted for pickup in 15 minutes.`
        );
      }, 800);
    });
  }

  // Initial cart render
  renderCart();

  // --------------------------------------------------------------------------
  // 6. Contact Form Validation & Submission
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('submit-btn');

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const validateField = (input, isValid) => {
    if (isValid) {
      input.classList.remove('has-error');
      return true;
    } else {
      input.classList.add('has-error');
      return false;
    }
  };

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim().length >= 2) {
        validateField(nameInput, true);
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      if (isValidEmail(emailInput.value)) {
        validateField(emailInput, true);
      }
    });
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => {
      if (messageInput.value.trim().length >= 10) {
        validateField(messageInput, true);
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = nameInput.value.trim();
      const emailVal = emailInput.value.trim();
      const messageVal = messageInput.value.trim();

      const isNameValid = validateField(nameInput, nameVal.length >= 2);
      const isEmailValid = validateField(emailInput, isValidEmail(emailVal));
      const isMessageValid = validateField(messageInput, messageVal.length >= 10);

      if (!isNameValid || !isEmailValid || !isMessageValid) {
        if (!isNameValid) nameInput.focus();
        else if (!isEmailValid) emailInput.focus();
        else if (!isMessageValid) messageInput.focus();
        return;
      }

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      const originalText = btnText ? btnText.textContent : 'Send Message';
      if (btnText) btnText.textContent = 'Sending...';

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = originalText;

        showToast(
          'Message Delivered!',
          `Thank you, ${nameVal}. Our team will contact you at ${emailVal} shortly.`
        );

        contactForm.reset();
        validateField(nameInput, true);
        validateField(emailInput, true);
        validateField(messageInput, true);
      }, 1000);
    });
  }

  // --------------------------------------------------------------------------
  // 7. Footer Dynamic Year
  // --------------------------------------------------------------------------
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // --------------------------------------------------------------------------
  // 8. Premium Smooth Scroll Reveal Animations
  // --------------------------------------------------------------------------
  const initScrollReveal = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const revealSelectors = [
      '.hero-content',
      '.hero-visual',
      '.section-header',
      '.menu-card',
      '.about-images',
      '.about-content',
      '.value-item',
      '.contact-info-card',
      '.contact-form-card'
    ];

    const elementsToReveal = document.querySelectorAll(revealSelectors.join(', '));
    if (elementsToReveal.length === 0 || !('IntersectionObserver' in window)) {
      return;
    }

    elementsToReveal.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      if (el.classList.contains('menu-card') || el.classList.contains('value-item')) {
        const staggerIndex = index % 4;
        el.style.transitionDelay = `${staggerIndex * 0.08}s`;
      }
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    elementsToReveal.forEach(el => revealObserver.observe(el));
  };

  initScrollReveal();

  // --------------------------------------------------------------------------
  // 9. Interactive Custom Cursor
  // --------------------------------------------------------------------------
  const initCustomCursor = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const hasNoHover = window.matchMedia('(hover: none)').matches;

    if (prefersReducedMotion || isCoarsePointer || hasNoHover) {
      return;
    }

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');

    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.setAttribute('aria-hidden', 'true');

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let isHovering = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      if (!isVisible) {
        isVisible = true;
        document.body.classList.add('cursor-active');
        ringX = mouseX;
        ringY = mouseY;
      }
    }, { passive: true });

    const renderLoop = () => {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      document.body.classList.remove('cursor-active', 'cursor-hovering', 'cursor-clicking');
    });

    document.addEventListener('mouseenter', () => {
      isVisible = true;
      document.body.classList.add('cursor-active');
    });

    // Expanded interactive query covering new buttons & controls
    const interactiveQuery = 'a, button, input, textarea, select, .menu-card, .filter-btn, .header-icon-btn, .add-to-cart-btn, .qty-btn, .cart-remove-btn, .cart-close-btn, .search-clear-btn, label, [role="button"], [role="tab"]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveQuery)) {
        if (!isHovering) {
          isHovering = true;
          document.body.classList.add('cursor-hovering');
        }
      } else {
        if (isHovering) {
          isHovering = false;
          document.body.classList.remove('cursor-hovering');
        }
      }
    }, { passive: true });

    document.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-clicking');
    });

    document.addEventListener('mouseup', () => {
      document.body.classList.remove('cursor-clicking');
    });
  };

  initCustomCursor();
});
