// --- Tab Logic ---
function showTab(tabId, linkElement) {
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
    linkElement.classList.add('active');
    
    // Load profile data when profile tab is opened
    if (tabId === 'profile' && !currentProfile) {
        loadProfile();
    }
}

// --- Profile State ---
let currentProfile = null;

// --- State Management ---
const paginationState = {
    products: { page: 1, size: 10, total: 0 },
    orders: { page: 1, size: 10, total: 0 },
    customers: { page: 1, size: 10, total: 0 }
};

// FoodCategory enum mapping (matches backend enum exactly)
const FOOD_CATEGORIES = {
    "Burger": 1,
    "Pizza": 2,
    "Pasta": 3,
    "Sandwich": 4,
    "Grill": 5,
    "FriedChicken": 6,
    "Seafood": 7,
    "Salad": 8,
    "Soup": 9,
    "Dessert": 10,
    "IceCream": 11,
    "Juice": 12,
    "Coffee": 13,
    "Beverage": 14,
    "Appetizer": 15,
    "MainCourse": 16,
    "SideDish": 17,
    "Shawarma": 18,
    "Kebab": 19,
    "Sushi": 20,
    "Tacos": 21,
    "Noodles": 22,
    "RiceDishes": 23,
    "Pastry": 24,
    "Breakfast": 25
};

// Wizard State for Product Creation
const wizardState = {
    currentStep: 1,
    totalSteps: 5,
    productData: {
        name: '',
        price: '',
        description: '',
        selectedCategories: [],  // Array of category names (strings)
        selectedCategoryIds: [], // Array of FoodCategory enum integers
        selectedAttributes: [],  // Array of {name, value, measurementUnit}
        uploadedImages: [],      // Array of File objects
        mainImageIndex: 0        // Index of main image in uploadedImages array
    }
};


// --- Product Management Logic ---
let currentProducts = [];
let productModal;
let editProductModal;
let deleteModal;
let productToDeleteId = null;
let addAddressModal;

// --- Order Management Logic ---
let currentOrders = [];
let orderModalInstance;

document.addEventListener('DOMContentLoaded', () => {
    Authentication.requireRole('Merchant');
    Authentication.updateHeader();

    // Initialize Bootstrap modals
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    orderModalInstance = new bootstrap.Modal(document.getElementById('orderModal'));
    addAddressModal = new bootstrap.Modal(document.getElementById('addAddressModal'));

    // Attach event listener for delete confirmation button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (productToDeleteId) {
                const result = await MerchantService.deleteProduct(productToDeleteId);
                if (result.success) {
                    deleteModal.hide();
                    loadProducts();
                } else {
                    alert(result.message || 'Delete failed');
                }
                productToDeleteId = null;
            }
        });
    }

    // Attach event listener for change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const current = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmNewPassword').value;

            if (newPass !== confirmPass) {
                alert('New passwords do not match.');
                return;
            }

            const result = await Authentication.changePassword(current, newPass);
            if (result.success) {
                alert('Password updated successfully.');
                changePasswordForm.reset();
            } else {
                alert(result.message || 'Failed to update password.');
            }
        });
    }

    loadProducts();
});

// --- Pagination Logic ---
function changePage(type, delta) {
    const state = paginationState[type];
    const newPage = state.page + delta;
    if (newPage > 0) { // Ideally check against total pages
        state.page = newPage;
        if (type === 'products') loadProducts();
        else if (type === 'orders') loadOrders();
        else if (type === 'customers') loadCustomers();
    }
}

function updatePaginationUI(type) {
    const state = paginationState[type];
    const el = document.getElementById(`${type}PageInfo`);
    if(el) el.textContent = `Page ${state.page}`;
}

// --- Product Functions ---

async function loadProducts() {
    const { page, size } = paginationState.products;
    const result = await MerchantService.getAllProducts(page, size);
    
    const products = result.items || [];
    paginationState.products.total = result.totalItems || 0;
    
    currentProducts = products;
    renderProducts(products);
    updatePaginationUI('products');
}

function renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found.</td></tr>';
        return;
    }

    products.forEach(p => {
        // Backend returns productCategories as array of category names (strings)
        const categoriesHtml = p.productCategories && p.productCategories.length > 0
            ? p.productCategories.map(cat => `<span class="badge bg-warning text-dark me-1">${cat}</span>`).join('')
            : '<span class="text-muted">None</span>';

        // Backend returns productDetailAttributes (with Id field) in list view
        const attributesHtml = p.productDetailAttributes && p.productDetailAttributes.length > 0
            ? p.productDetailAttributes.map(a =>
                `<span class="badge bg-info text-dark badge-attribute me-1">
                    ${a.attributeName}: ${a.attributeValue} ${a.measurementUnit || ''}
                    <button class="btn-close btn-close-white ms-1" style="font-size: 0.6rem;" 
                        onclick="deleteAttribute(${p.productId}, ${a.id}, event)" 
                        title="Remove attribute"></button>
                </span>`
            ).join('')
            : '<span class="text-muted">None</span>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.productName}</td>
            <td>$${p.price}</td>
            <td>${p.productDescription || '-'}</td>
            <td>${categoriesHtml}</td>
            <td>${attributesHtml}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct('${p.productId}')"><i class="ion-ios-create"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete('${p.productId}')"><i class="ion-ios-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterProducts() {
    const term = document.getElementById('productSearch').value.toLowerCase();
    const filtered = currentProducts.filter(p => p.productName.toLowerCase().includes(term));
    renderProducts(filtered);
}

// openProductModal is now defined in WizardFunctions.js

async function editProduct(id) {
    const product = await MerchantService.getProductById(id);
    if (!product) return;

    // Populate edit modal fields
    document.getElementById('editProductId').value = product.productId;
    document.getElementById('editProductName').value = product.productName;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductDescription').value = product.productDescription;

    // Render attributes (read-only display)
    renderEditAttributesList(product.attributes);
    
    // Render categories with current selections
    // Backend returns productCategories as array of category names (strings)
    const currentCategoryNames = product.productCategories || [];
    renderEditCategoryCheckboxes(currentCategoryNames);

    editProductModal.show();
}

function renderEditCategoryCheckboxes(selectedCategoryNames = []) {
    const container = document.getElementById('editProductCategories');
    if (!container) return;
    container.innerHTML = '';
    
    Object.keys(FOOD_CATEGORIES).sort().forEach(cat => {
        const isChecked = selectedCategoryNames.includes(cat);
        const div = document.createElement('div');
        div.className = 'form-check form-check-inline';
        div.innerHTML = `
            <input class="form-check-input edit-category-checkbox" type="checkbox" value="${cat}" id="edit_cat_${cat}" ${isChecked ? 'checked' : ''}>
            <label class="form-check-label" for="edit_cat_${cat}">${cat}</label>
        `;
        container.appendChild(div);
    });
}

function renderEditAttributesList(attributes) {
    const container = document.getElementById('editAttributesList');
    container.innerHTML = '';
    if (attributes && attributes.length > 0) {
        attributes.forEach(a => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary me-2 mb-2 p-2';
            badge.innerHTML = `${a.name}: ${a.value} ${a.measurementUnit || ''}`;
            container.appendChild(badge);
        });
    } else {
        container.innerHTML = '<span class="text-muted">No attributes</span>';
    }
}

async function saveEditedProduct() {
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('editProductName').value.trim();
    const price = document.getElementById('editProductPrice').value;
    const description = document.getElementById('editProductDescription').value.trim();

    if (!name || !price) {
        alert('Please fill in Product Name and Price.');
        return;
    }

    // Get selected categories
    const selectedCategories = [];
    document.querySelectorAll('.edit-category-checkbox:checked').forEach(cb => {
        selectedCategories.push(FOOD_CATEGORIES[cb.value]);
    });

    if (selectedCategories.length === 0) {
        alert('Please select at least one category.');
        return;
    }

    const payload = {
        ProductName: name,
        ProductDescription: description,
        Price: price.toString()
    };

    const result = await MerchantService.updateProduct(id, payload);

    if (result.success) {
        alert('Product updated successfully!');
        editProductModal.hide();
        loadProducts();
    } else {
        alert(result.message || 'Failed to update product');
    }
}

function renderCategoryCheckboxes(selectedCategories = []) {
    const container = document.getElementById('productCategories');
    if(!container) return;
    container.innerHTML = '';
    
    // Convert selected category integers to category names for comparison
    const selectedCategoryNames = selectedCategories.map(catId => {
        return Object.keys(FOOD_CATEGORIES).find(key => FOOD_CATEGORIES[key] === catId);
    }).filter(Boolean);
    
    Object.keys(FOOD_CATEGORIES).sort().forEach(cat => {
        const isChecked = selectedCategoryNames.includes(cat);
        const div = document.createElement('div');
        div.className = 'form-check form-check-inline';
        div.innerHTML = `
            <input class="form-check-input product-category-checkbox" type="checkbox" value="${cat}" id="cat_${cat}" ${isChecked ? 'checked' : ''}>
            <label class="form-check-label" for="cat_${cat}">${cat}</label>
        `;
        container.appendChild(div);
    });
}

function getSelectedCategories() {
    const checkboxes = document.querySelectorAll('.product-category-checkbox:checked');
    // Return enum integer values, not strings
    return Array.from(checkboxes).map(cb => FOOD_CATEGORIES[cb.value]);
}

function renderAttributesList(attributes, productId) {
    const container = document.getElementById('attributesList');
    container.innerHTML = '';
    if (attributes && attributes.length > 0) {
        attributes.forEach(a => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary me-2 mb-2 p-2';
            // Detail view uses AttributeDto which doesn't include Id - display only
            badge.innerHTML = `${a.name}: ${a.value} ${a.measurementUnit || ''}`;
            container.appendChild(badge);
        });
    } else {
        container.innerHTML = '<span class="text-muted">No attributes</span>';
    }
}

async function saveProduct() {
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value;
    const selectedCategories = getSelectedCategories();

    if (!name || !price) {
        alert('Name and Price are required.');
        return;
    }

    const productData = {
        ProductName: name,
        ProductDescription: description,
        Price: price.toString(),
        Attributes: [],
        Categories: []  // Will be set later for create, or managed separately for update
    };

    let result;
    if (id) {
        result = await MerchantService.updateProduct(id, productData);
        if (result.success) {
            // Update Categories - backend returns productCategories as category names
            const currentProduct = await MerchantService.getProductById(id);
            
            // Convert current category names to integers
            const currentCats = currentProduct.productCategories ? currentProduct.productCategories.map(catName => {
                return Object.keys(FOOD_CATEGORIES).find(key => key === catName)
                    ? FOOD_CATEGORIES[catName]
                    : null;
            }).filter(Boolean) : [];
            
            const toAdd = selectedCategories.filter(c => !currentCats.includes(c));
            const toRemove = currentCats.filter(c => !selectedCategories.includes(c));

            if (toAdd.length > 0) await MerchantService.addProductCategories(id, toAdd);
            if (toRemove.length > 0) await MerchantService.removeProductCategories(id, toRemove);
        }
    } else {
        // For create, send integer category values
        productData.Categories = selectedCategories;
        result = await MerchantService.createProduct(productData);
    }

    if (result.success) {
        productModal.hide();
        loadProducts();
    } else {
        alert(result.message || 'Operation failed');
    }
}

function confirmDelete(id) {
    productToDeleteId = id;
    deleteModal.show();
}

async function addAttribute() {
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('newAttributeName').value;
    const value = document.getElementById('newAttributeValue').value;
    const unit = document.getElementById('newAttributeUnit').value;

    if (!name || !value) return;

    const attributesList = [{
        Name: name,
        Value: value,
        MeasurementUnit: unit || ''
    }];

    const result = await MerchantService.addAttribute(productId, attributesList);
    if (result.success) {
        const product = await MerchantService.getProductById(productId);
        renderAttributesList(product.attributes, productId);
        document.getElementById('newAttributeName').value = '';
        document.getElementById('newAttributeValue').value = '';
        document.getElementById('newAttributeUnit').value = '';
        loadProducts();
    } else {
        alert(result.message || 'Failed to add attribute');
    }
}

async function deleteAttribute(productId, attributeId, event) {
    // Prevent triggering any parent click handlers
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    if (!confirm('Are you sure you want to delete this attribute?')) return;
    
    const result = await MerchantService.removeAttribute(productId, [attributeId]);
    if (result.success) {
        loadProducts(); // Reload the products list
    } else {
        alert(result.message || 'Failed to delete attribute');
    }
}

// --- Order Functions ---

async function loadOrders() {
    const { page, size } = paginationState.orders;
    const result = await MerchantService.getAllOrders(page, size);
    
    const orders = result.items || [];
    paginationState.orders.total = result.totalItems || 0;
    
    currentOrders = orders;
    renderOrders(currentOrders);
    updatePaginationUI('orders');
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found.</td></tr>';
        return;
    }

    orders.forEach(o => {
        const row = document.createElement('tr');
        // Backend returns MerchantOrderDto with orderId, customerName, orderDate, totalAmount, status
        const orderId = o.orderId;
        const customer = o.customerName || 'Unknown';
        const date = new Date(o.orderDate).toLocaleDateString();
        const total = o.totalAmount;
        const status = o.status;

        row.innerHTML = `
            <td>#${orderId}</td>
            <td>${customer}</td>
            <td>${date}</td>
            <td>$${total}</td>
            <td><span class="badge bg-${getStatusBadgeColor(status)}">${status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewOrder('${orderId}')">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusBadgeColor(status) {
    switch (status) {
        case 'Pending': return 'warning';
        case 'InProgress': return 'info';
        case 'OutForDelivery': return 'primary';
        case 'Completed': return 'success';
        case 'Cancelled': return 'danger';
        default: return 'secondary';
    }
}

async function viewOrder(id) {
    const order = await MerchantService.getOrderById(id);
    if (!order) return;

    // Backend returns MerchantOrderDto
    const orderId = order.orderId;
    const customer = order.customerName || 'Unknown';
    const date = new Date(order.orderDate).toLocaleString();
    const status = order.status;
    const total = order.totalAmount;

    document.getElementById('orderModalId').textContent = orderId;
    document.getElementById('orderCustomerName').textContent = customer;
    document.getElementById('orderDate').textContent = date;
    document.getElementById('orderStatusDisplay').textContent = status;
    document.getElementById('orderStatusSelect').value = status;
    document.getElementById('orderTotalAmount').textContent = '$' + total;

    const tbody = document.getElementById('orderItemsTableBody');
    tbody.innerHTML = '';
    if (order.orderItems) {
        order.orderItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.itemName}</td>
                <td>$${item.price}</td>
                <td>${item.quantity}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    document.getElementById('orderModal').dataset.orderId = orderId;
    orderModalInstance.show();
}

async function updateOrderStatus() {
    const id = document.getElementById('orderModal').dataset.orderId;
    const status = document.getElementById('orderStatusSelect').value;

    const result = await MerchantService.updateOrderStatus(id, status);

    if (result.success) {
        orderModalInstance.hide();
        loadOrders();
    } else {
        alert(result.message || 'Failed to update status');
    }
}

// --- Customer Functions ---

async function loadCustomers() {
    const { page, size } = paginationState.customers;
    const result = await MerchantService.getPurchasedCustomers(page, size);
    
    const customers = result.items || [];
    paginationState.customers.total = result.totalItems || 0;
    
    renderCustomers(customers);
    updatePaginationUI('customers');
}

function renderCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = '';

    if (!customers || customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No customers found.</td></tr>';
        return;
    }

    customers.forEach(c => {
        const row = document.createElement('tr');
        const lastPurchased = new Date(c.lastPurchased).toLocaleDateString();

        row.innerHTML = `
            <td>${c.fullName}</td>
            <td>${c.email}</td>
            <td>${c.phoneNumber}</td>
            <td>${lastPurchased}</td>
            <td>${c.totalOrders}</td>
            <td>$${c.totalSpent.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

// ==================== PROFILE MANAGEMENT ====================

async function loadProfile() {
    const result = await ProfileService.getMerchantProfile();
    
    if (result.success) {
        currentProfile = result.data;
        displayProfile(currentProfile);
    } else {
        alert('Failed to load profile: ' + result.message);
    }
}

function displayProfile(profile) {
    // Store Information
    document.getElementById('profileStoreName').textContent = profile.storeName || '-';
    document.getElementById('profileStoreDescription').textContent = profile.storeDescription || '-';
    
    // Contact Information
    document.getElementById('profileEmail').textContent = profile.email;
    document.getElementById('profileCategories').textContent = profile.categories && profile.categories.length > 0 
        ? profile.categories.join(', ') 
        : '-';
    
    // Email Verification Status
    if (profile.isEmailConfirmed) {
        document.getElementById('emailVerifiedBadge').innerHTML = '<span class="badge bg-success">✓ Verified</span>';
        document.getElementById('sendVerificationBtn').style.display = 'none';
    } else {
        document.getElementById('emailVerifiedBadge').innerHTML = '<span class="badge bg-warning">Not Verified</span>';
        document.getElementById('sendVerificationBtn').style.display = 'inline-block';
    }
    
    // Display Addresses
    displayAddresses(profile.adresses || []);
}

function displayAddresses(addresses) {
    const container = document.getElementById('addressesList');
    
    if (!addresses || addresses.length === 0) {
        container.innerHTML = '<p class="text-muted">No addresses added yet.</p>';
        return;
    }
    
    container.innerHTML = '';
    addresses.forEach(address => {
        const card = document.createElement('div');
        card.className = 'card mb-2 p-3';
        // Note: Merchants don't have "Set as Default" functionality
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <p class="mb-1"><strong>${address.streetAddress}</strong></p>
                    <p class="mb-1">${address.city}, ${address.state} ${address.postalCode}</p>
                    <p class="mb-0">${address.country}</p>
                </div>
                <div>
                    <button class="btn btn-outline-danger btn-sm" onclick="removeAddress(${address.id})">Remove</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==================== EMAIL VERIFICATION ====================

async function sendVerificationCode() {
    const result = await ProfileService.sendVerificationCode();
    
    if (result.success) {
        alert('Verification code sent to your email!');
        // Show the code input field
        document.getElementById('sendVerificationBtn').style.display = 'none';
        document.getElementById('verificationCodeInput').style.display = 'block';
    } else {
        alert('Failed to send verification code: ' + result.message);
    }
}

async function verifyEmailCode() {
    const code = document.getElementById('verificationCode').value.trim();
    const errorEl = document.getElementById('verificationError');
    
    if (!code) {
        errorEl.textContent = 'Please enter the verification code';
        errorEl.classList.remove('d-none');
        return;
    }
    
    const result = await ProfileService.verifyEmailCode(code);
    
    if (result.success) {
        alert('Email verified successfully!');
        // Update UI to show verified status
        document.getElementById('emailVerifiedBadge').innerHTML = '<span class="badge bg-success">✓ Verified</span>';
        document.getElementById('verificationCodeInput').style.display = 'none';
        errorEl.classList.add('d-none');
        
        // Update profile data
        if (currentProfile) {
            currentProfile.isEmailConfirmed = true;
        }
    } else {
        errorEl.textContent = result.message || 'Invalid verification code';
        errorEl.classList.remove('d-none');
    }
}

// ==================== ADDRESS MANAGEMENT ====================

function showAddAddressModal() {
    document.getElementById('addAddressForm').reset();
    addAddressModal.show();
}

async function addAddress() {
    const newAddress = {
        streetAddress: document.getElementById('newStreetAddress').value.trim(),
        city: document.getElementById('newCity').value.trim(),
        state: document.getElementById('newState').value.trim(),
        postalCode: document.getElementById('newPostalCode').value.trim(),
        country: document.getElementById('newCountry').value.trim()
    };
    
    // Validation
    if (!newAddress.streetAddress || !newAddress.city || !newAddress.state || 
        !newAddress.postalCode || !newAddress.country) {
        alert('Please fill in all address fields');
        return;
    }
    
    const result = await ProfileService.addMerchantAddress([newAddress]);
    
    if (result.success) {
        alert('Address added successfully!');
        addAddressModal.hide();
        // Reload profile to get updated addresses
        loadProfile();
    } else {
        alert('Failed to add address: ' + result.message);
    }
}

async function removeAddress(addressId) {
    if (!confirm('Are you sure you want to remove this address?')) {
        return;
    }
    
    const result = await ProfileService.deleteMerchantAddress(addressId);
    
    if (result.success) {
        alert('Address removed successfully!');
        // Reload profile to get updated addresses
        loadProfile();
    } else {
        alert('Failed to remove address: ' + result.message);
    }
}
