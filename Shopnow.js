// ===== Local Storage Manager =====
const StorageManager = {
    CART_KEY: 'inquire_cart',
    CONTACT_KEY: 'inquire_contact_form',
    
    // Cart operations
    getCart() {
        const cart = localStorage.getItem(this.CART_KEY);
        return cart ? JSON.parse(cart) : [];
    },
    
    saveCart(cart) {
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
        updateCartUI();
    },
    
    addToCart(product) {
        const cart = this.getCart();
        const existingProduct = cart.find(item => item.id === product.id);
        
        if (existingProduct) {
            existingProduct.quantity += product.quantity || 1;
        } else {
            cart.push({
                ...product,
                quantity: product.quantity || 1
            });
        }
        
        this.saveCart(cart);
        return true;
    },
    
    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== productId);
        this.saveCart(cart);
    },
    
    updateCartQuantity(productId, quantity) {
        const cart = this.getCart();
        const product = cart.find(item => item.id === productId);
        
        if (product) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                product.quantity = quantity;
                this.saveCart(cart);
            }
        }
    },
    
    clearCart() {
        localStorage.removeItem(this.CART_KEY);
        updateCartUI();
    },
    
    // Contact form operations
    saveContactForm(data) {
        localStorage.setItem(this.CONTACT_KEY, JSON.stringify(data));
        showAutoSaveNotice();
    },
    
    getContactForm() {
        const data = localStorage.getItem(this.CONTACT_KEY);
        return data ? JSON.parse(data) : null;
    },
    
    clearContactForm() {
        localStorage.removeItem(this.CONTACT_KEY);
    }
};

let apiCsrfToken = null;
async function apiCsrf() {
    if (apiCsrfToken) return apiCsrfToken;
    const response = await fetch('api/index.php?action=csrf', { credentials: 'same-origin' });
    const data = await response.json();
    if (!response.ok || !data.csrf) throw new Error('Unable to start a secure request.');
    apiCsrfToken = data.csrf;
    return apiCsrfToken;
}

// ===== Update Cart UI =====
function updateCartUI() {
    const cart = StorageManager.getCart();
    const cartCount = document.getElementById('cartCount');
    
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// ===== Mobile Navigation Toggle =====
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    // Initialize cart UI
    updateCartUI();

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Animate hamburger
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translate(8px, 8px)' : '';
            spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translate(8px, -8px)' : '';
        });

        // Close menu when link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            });
        });
    }
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Contact Form Local Storage =====
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Load saved data on page load
        const savedData = StorageManager.getContactForm();
        if (savedData) {
            Object.keys(savedData).forEach(key => {
                const element = contactForm.querySelector(`[name="${key}"]`);
                if (element) {
                    element.value = savedData[key];
                }
            });
        }
        
        // Auto-save form data as user types
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                saveContactFormData();
            });
        });
        
        // Load Saved Data button
        const loadFormBtn = document.getElementById('loadFormBtn');
        if (loadFormBtn) {
            loadFormBtn.addEventListener('click', function() {
                const savedData = StorageManager.getContactForm();
                if (savedData) {
                    Object.keys(savedData).forEach(key => {
                        const element = contactForm.querySelector(`[name="${key}"]`);
                        if (element) {
                            element.value = savedData[key];
                        }
                    });
                    showNotification('Form data loaded successfully!', 'success');
                } else {
                    showNotification('No saved form data found', 'error');
                }
            });
        }
        
        // Clear Saved Data button
        const clearFormBtn = document.getElementById('clearFormBtn');
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', function() {
                StorageManager.clearContactForm();
                contactForm.reset();
                showNotification('Saved form data cleared', 'success');
            });
        }
        
        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('[name="name"]').value;
            const email = this.querySelector('[name="email"]').value;
            const message = this.querySelector('[name="message"]').value;
            
            // Basic validation
            if (!name || !email || !message) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission
            const button = this.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.textContent = 'Sending...';
            button.disabled = true;
            
            setTimeout(() => {
                showNotification('Message sent successfully!', 'success');
                StorageManager.saveContactForm({
                    name, email, phone: this.querySelector('[name="phone"]').value, 
                    subject: this.querySelector('[name="subject"]').value, 
                    message
                });
                this.reset();
                button.textContent = originalText;
                button.disabled = false;
            }, 1500);
        });
    }
});

// ===== Save Contact Form Data =====
function saveContactFormData() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        StorageManager.saveContactForm(data);
    }
}

// ===== Show Auto-Save Notice =====
function showAutoSaveNotice() {
    const notice = document.getElementById('autoSaveNotice');
    if (notice) {
        notice.style.display = 'block';
        setTimeout(() => {
            notice.style.display = 'none';
        }, 2000);
    }
}

// ===== Add to Cart Functionality =====
document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.btn-add, [data-add-to-cart]');
    
    addToCartButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product information from the card
            const card = this.closest('.product-card, .new-product-card');
            if (card) {
                const productName = card.querySelector('h3').textContent;
                const priceValues = card.querySelector('.price').textContent.match(/\d+(?:\.\d+)?/g);
                const imageUrl = card.querySelector('img').src;
                const badge = card.querySelector('.badge')?.textContent || 'Featured';
                
                const product = {
                    id: `${card.dataset.productId || `product-${Date.now()}`}-${card.dataset.size || ''}-${card.dataset.color || ''}`,
                    product_id: Number(card.dataset.productId) || null,
                    name: productName,
                    price: parseFloat(priceValues?.at(-1)) || 99.99,
                    image: imageUrl,
                    category: badge,
                    size: card.dataset.size || '',
                    color: card.dataset.color || '',
                    quantity: 1
                };
                
                StorageManager.addToCart(product);
                showNotification(`${productName} added to cart!`, 'success');
            }
        });
    });
});

// ===== Newsletter Form Submission =====
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            // Simple validation
            if (email.trim() === '') {
                showNotification('Please enter a valid email', 'error');
                return;
            }
            
            // Simulate form submission
            const button = this.querySelector('button');
            const originalText = button.textContent;
            button.textContent = 'Subscribing...';
            button.disabled = true;
            
            setTimeout(() => {
                showNotification('Thank you for subscribing!', 'success');
                this.reset();
                button.textContent = originalText;
                button.disabled = false;
            }, 1500);
        });
    }
});

// ===== Notification Function =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const styles = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #10b981; color: white;' : 'background: #ef4444; color: white;'}
    `;
    
    notification.setAttribute('style', styles);
    document.body.appendChild(notification);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    if (!document.querySelector('style[data-notification]')) {
        style.setAttribute('data-notification', 'true');
        document.head.appendChild(style);
    }
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== Intersection Observer for Fade-in Animation =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe product cards and feature cards
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.product-card, .feature-card, .testimonial-card, .category-card, .new-product-card');
    cards.forEach(card => observer.observe(card));
});

// ===== Active Navigation Link Update =====
window.addEventListener('scroll', function() {
    updateActiveNavLink();
});

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a:not(.cart-link)');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
}

// ===== Image Lazy Loading =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img').forEach(img => imageObserver.observe(img));
}

// ===== Product Detail Handler (Future Enhancement) =====
function handleProductClick(productName) {
    console.log('Product clicked:', productName);
    showNotification('Product details page - Coming soon!', 'success');
}

// ===== Search Functionality (Future Enhancement) =====
function searchProducts(query) {
    const products = document.querySelectorAll('.product-card, .new-product-card');
    const normalizedQuery = query.toLowerCase();
    
    products.forEach(product => {
        const productName = product.querySelector('h3').textContent.toLowerCase();
        const productDesc = product.querySelector('.product-desc')?.textContent.toLowerCase() || '';
        
        if (productName.includes(normalizedQuery) || productDesc.includes(normalizedQuery)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// ===== Smooth Page Transitions =====
function loadPage(url) {
    window.location.href = url;
}

// ===== Print Friendly Styles =====
window.addEventListener('beforeprint', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.style.display = 'none';
});

window.addEventListener('afterprint', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.style.display = 'block';
});

// ===== Accessibility: Set ARIA Labels =====
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((btn, index) => {
        if (!btn.hasAttribute('aria-label')) {
            btn.setAttribute('aria-label', `Button ${index + 1}`);
        }
    });
});

console.log('INQUIRE Inventory Website - Initialized Successfully with LocalStorage & Cart Management');
