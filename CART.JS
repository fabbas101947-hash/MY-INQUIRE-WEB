// ===== Cart Page Functionality =====

// Render cart items on page load
document.addEventListener('DOMContentLoaded', function() {
    renderCartItems();
    setupEventListeners();
    updatePaymentForm();
});

// ===== Render Cart Items =====
function renderCartItems() {
    const cart = StorageManager.getCart();
    const container = document.getElementById('cartItemsContainer');
    const emptyMessage = document.getElementById('emptyCartMessage');
    
    if (cart.length === 0) {
        container.style.display = 'none';
        emptyMessage.style.display = 'block';
        updateCartSummary();
        return;
    }
    
    container.style.display = 'flex';
    emptyMessage.style.display = 'none';
    
    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='inquire.png'">
            </div>
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-category">${item.category}</div>
                <div class="item-price">$${item.price.toFixed(2)}</div>
                <div class="item-controls">
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)">
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <div class="item-subtotal">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
    
    updateCartSummary();
}

// ===== Update Quantity =====
function updateQuantity(productId, newQuantity) {
    const quantity = parseInt(newQuantity);
    
    if (isNaN(quantity) || quantity < 1) {
        return;
    }
    
    StorageManager.updateCartQuantity(productId, quantity);
    renderCartItems();
    showNotification('Quantity updated', 'success');
}

// ===== Remove from Cart =====
function removeFromCart(productId) {
    StorageManager.removeFromCart(productId);
    renderCartItems();
    showNotification('Item removed from cart', 'success');
}

// ===== Update Cart Summary =====
function updateCartSummary() {
    const cart = StorageManager.getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Get selected shipping
    const shippingSelect = document.querySelector('input[name="shipping"]:checked');
    const shipping = shippingSelect ? parseFloat(shippingSelect.value) : 0;
    
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    
    // Update summary
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Update review summary
    document.getElementById('reviewSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('reviewShipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('reviewTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('reviewTotal').textContent = `$${total.toFixed(2)}`;
    
    updateReviewItems();
}

// ===== Update Review Items =====
function updateReviewItems() {
    const cart = StorageManager.getCart();
    const reviewContainer = document.getElementById('reviewItems');
    
    reviewContainer.innerHTML = cart.map(item => `
        <div class="review-item">
            <div>
                <div class="review-item-name">${item.name} x${item.quantity}</div>
            </div>
            <div class="review-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
}

// ===== Setup Event Listeners =====
function setupEventListeners() {
    // Shipping option change
    document.querySelectorAll('input[name="shipping"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateCartSummary();
        });
    });
    
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        const cart = StorageManager.getCart();
        if (cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }
        openPaymentModal();
    });
    
    // Modal close
    document.getElementById('closeModal').addEventListener('click', closePaymentModal);
    
    // Tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Next/Back buttons
    document.getElementById('nextBtn').addEventListener('click', handleNextStep);
    document.getElementById('backBtn').addEventListener('click', handleBackStep);
    document.getElementById('completeBtn').addEventListener('click', completeOrder);
    
    // Payment method selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', updatePaymentForm);
    });
}

// ===== Payment Modal Functions =====
let currentTab = 'payment-method';

function openPaymentModal() {
    document.getElementById('paymentModal').style.display = 'flex';
    currentTab = 'payment-method';
    updateTabUI();
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function switchTab(tabName) {
    currentTab = tabName;
    updateTabUI();
}

function updateTabUI() {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show current tab
    document.getElementById(currentTab).classList.add('active');
    document.querySelector(`[data-tab="${currentTab}"]`).classList.add('active');
    
    // Update button visibility
    const nextBtn = document.getElementById('nextBtn');
    const completeBtn = document.getElementById('completeBtn');
    
    if (currentTab === 'review') {
        nextBtn.style.display = 'none';
        completeBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        completeBtn.style.display = 'none';
    }
}

// ===== Update Payment Form =====
function updatePaymentForm() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Hide all payment forms
    document.querySelectorAll('.payment-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show selected payment form
    if (selectedMethod === 'credit-card') {
        document.getElementById('creditCardForm')?.classList.add('active');
    }
}

// ===== Handle Tab Navigation =====
function handleNextStep() {
    const tabs = ['payment-method', 'billing', 'review'];
    const currentIndex = tabs.indexOf(currentTab);
    
    if (currentIndex < tabs.length - 1) {
        // Validate current tab
        if (validateCurrentTab()) {
            switchTab(tabs[currentIndex + 1]);
        }
    }
}

function handleBackStep() {
    const tabs = ['payment-method', 'billing', 'review'];
    const currentIndex = tabs.indexOf(currentTab);
    
    if (currentIndex > 0) {
        switchTab(tabs[currentIndex - 1]);
    }
}

// ===== Validate Current Tab =====
function validateCurrentTab() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    
    if (currentTab === 'payment-method') {
        if (!selectedMethod) {
            showNotification('Please select a payment method', 'error');
            return false;
        }
        
        if (selectedMethod === 'credit-card') {
            const cardInputs = document.querySelectorAll('#creditCardForm .form-input');
            let isValid = true;
            
            cardInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                showNotification('Please fill in all card details', 'error');
                return false;
            }
        }
    }
    
    if (currentTab === 'billing') {
        const billingInputs = document.querySelectorAll('#billing .form-input');
        let isValid = true;
        
        billingInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showNotification('Please fill in all billing address fields', 'error');
            return false;
        }
    }
    
    return true;
}

// ===== Complete Order =====
function completeOrder() {
    const cart = StorageManager.getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingSelect = document.querySelector('input[name="shipping"]:checked');
    const shipping = shippingSelect ? parseFloat(shippingSelect.value) : 0;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    
    // Simulate payment processing
    const completeBtn = document.getElementById('completeBtn');
    const originalText = completeBtn.textContent;
    completeBtn.textContent = 'Processing Payment...';
    completeBtn.disabled = true;
    
    setTimeout(() => {
        // Generate order ID
        const orderId = `ORD-${Date.now()}`;
        
        // Save order to local storage
        const orders = JSON.parse(localStorage.getItem('inquire_orders') || '[]');
        orders.push({
            orderId,
            date: new Date().toLocaleString(),
            items: cart,
            subtotal,
            shipping,
            tax,
            total,
            paymentMethod: selectedMethod,
            status: 'Confirmed'
        });
        localStorage.setItem('inquire_orders', JSON.stringify(orders));
        
        // Clear cart
        StorageManager.clearCart();
        
        // Show success message
        showOrderConfirmation(orderId, total);
        
        // Reset button
        completeBtn.textContent = originalText;
        completeBtn.disabled = false;
    }, 2000);
}

// ===== Show Order Confirmation =====
function showOrderConfirmation(orderId, total) {
    closePaymentModal();
    
    const confirmation = document.createElement('div');
    confirmation.className = 'order-confirmation';
    confirmation.innerHTML = `
        <div class="confirmation-content" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            z-index: 3000;
            max-width: 500px;
            text-align: center;
            animation: slideUp 0.3s ease;
        ">
            <div style="font-size: 3rem; margin-bottom: 20px;">✅</div>
            <h2 style="color: #10b981; margin-bottom: 15px;">Order Confirmed!</h2>
            <p style="color: #6b7280; margin-bottom: 20px; font-size: 1.1rem;">
                Thank you for your purchase. Your order has been successfully placed.
            </p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #6b7280; margin: 0 0 10px 0;">Order ID:</p>
                <p style="color: #1f2937; font-weight: 700; font-size: 1.1rem; margin: 0 0 20px 0;">${orderId}</p>
                <p style="color: #6b7280; margin: 0 0 10px 0;">Total Amount:</p>
                <p style="color: #6366f1; font-weight: 700; font-size: 1.3rem; margin: 0;">$${total.toFixed(2)}</p>
            </div>
            <p style="color: #6b7280; margin-bottom: 30px;">
                A confirmation email has been sent to your registered email address.
            </p>
            <button onclick="this.closest('.order-confirmation').remove(); window.location.href='INDEX.HTML';" style="
                background: linear-gradient(135deg, #6366f1, #ec4899);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">Continue Shopping</button>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 2999;
        " onclick="this.parentElement.remove()"></div>
    `;
    
    document.body.appendChild(confirmation);
    
    // Show notification
    showNotification(`Order ${orderId} confirmed!`, 'success');
}

// ===== Format Card Number =====
document.addEventListener('DOMContentLoaded', function() {
    const cardInput = document.querySelector('.card-number');
    if (cardInput) {
        cardInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
});

console.log('Shopping Cart Functionality Initialized');
