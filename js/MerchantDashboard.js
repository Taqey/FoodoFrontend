// --- Tab Logic ---
function showTab(tabId, linkElement) {
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
    linkElement.classList.add('active');
}

// --- State Management ---
const paginationState = {
    products: { page: 1, size: 10, total: 0 },
    orders: { page: 1, size: 10, total: 0 },
    customers: { page: 1, size: 10, total: 0 }
};

const RESTAURANT_CATEGORIES = [
    "Italian", "Chinese", "Indian", "Japanese", "Mexican", "American",
    "French", "Thai", "Greek", "Spanish", "Lebanese", "Turkish",
    "Vietnamese", "Korean", "Brazilian", "Vegetarian", "Vegan",
    "GlutenFree", "FastFood", "FineDining", "CasualDining", "Cafe",
    "Bakery", "Bar", "Pub", "FoodTruck", "StreetFood", "Seafood",
    "Steakhouse", "Pizza", "Burger", "Sushi", "Dessert", "IceCream",
    "JuiceBar", "Healthy", "Salad", "Sandwich", "Breakfast", "Brunch",
    "Dinner", "Lunch", "LateNight"
];

// --- Product Management Logic ---
let currentProducts = [];
let productModal;
let deleteModal;
let productToDeleteId = null;

// --- Order Management Logic ---
let currentOrders = [];
let orderModalInstance;

document.addEventListener('DOMContentLoaded', () => {
    Authentication.requireRole('Merchant');
    Authentication.updateHeader();

    // Initialize Bootstrap modals
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    orderModalInstance = new bootstrap.Modal(document.getElementById('orderModal'));

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
    paginationState.products.total = result.totalCount || 0;
    
    currentProducts = products;
    renderProducts(products);
    updatePaginationUI('products');
}

function renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No products found.</td></tr>';
        return;
    }

    products.forEach(p => {
        const attributesHtml = p.attributes ? p.attributes.map(a =>
            `<span class="badge bg-info text-dark badge-attribute">${a.name}: ${a.value} ${a.measurementUnit || ''}</span>`
        ).join('') : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.productName}</td>
            <td>$${p.price}</td>
            <td>${p.productDescription || '-'}</td>
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

function openProductModal() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModalLabel').textContent = 'Add New Product';
    document.getElementById('attributesSection').classList.add('d-none');
    renderCategoryCheckboxes([]);
    productModal.show();
}

async function editProduct(id) {
    const product = await MerchantService.getProductById(id);
    if (!product) return;

    document.getElementById('productId').value = product.productId;
    document.getElementById('productName').value = product.productName;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.productDescription;

    document.getElementById('productModalLabel').textContent = 'Edit Product';
    document.getElementById('attributesSection').classList.remove('d-none');

    renderAttributesList(product.attributes, product.productId);
    
    // Handle categories
    // Assuming product.categories is a list of strings or objects with name
    const currentCategories = product.categories ? product.categories.map(c => typeof c === 'string' ? c : c.name) : [];
    renderCategoryCheckboxes(currentCategories);

    productModal.show();
}

function renderCategoryCheckboxes(selectedCategories = []) {
    const container = document.getElementById('productCategories');
    if(!container) return;
    container.innerHTML = '';
    RESTAURANT_CATEGORIES.forEach(cat => {
        const isChecked = selectedCategories.includes(cat);
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
    return Array.from(checkboxes).map(cb => cb.value);
}

function renderAttributesList(attributes, productId) {
    const container = document.getElementById('attributesList');
    container.innerHTML = '';
    if (attributes) {
        attributes.forEach(a => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary d-flex align-items-center gap-2 p-2';
            badge.innerHTML = `
                ${a.name}: ${a.value} ${a.measurementUnit || ''}
                <i class="ion-ios-close-circle" style="cursor:pointer" onclick="removeAttribute('${productId}', ${a.productDetailAttributeId})"></i>
            `;
            container.appendChild(badge);
        });
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
        productName: name,
        productDescription: description,
        price: price.toString(),
        attributes: []
    };

    let result;
    if (id) {
        result = await MerchantService.updateProduct(id, productData);
        if (result.success) {
            // Update Categories
            const currentProduct = await MerchantService.getProductById(id);
            const currentCats = currentProduct.categories ? currentProduct.categories.map(c => typeof c === 'string' ? c : c.name) : [];
            
            const toAdd = selectedCategories.filter(c => !currentCats.includes(c));
            const toRemove = currentCats.filter(c => !selectedCategories.includes(c));

            if (toAdd.length > 0) await MerchantService.addProductCategories(id, toAdd);
            if (toRemove.length > 0) await MerchantService.removeProductCategories(id, toRemove);
        }
    } else {
        productData.categories = selectedCategories;
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

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (productToDeleteId) {
        const result = await MerchantService.deleteProduct(productToDeleteId);
        if (result.success) {
            deleteModal.hide();
            loadProducts();
        } else {
            alert(result.message || 'Delete failed');
        }
    }
});

async function addAttribute() {
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('newAttributeName').value;
    const value = document.getElementById('newAttributeValue').value;
    const unit = document.getElementById('newAttributeUnit').value;

    if (!name || !value) return;

    const attributesList = [{
        name: name,
        value: value,
        measurementUnit: unit || ''
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

async function removeAttribute(productId, attributeId) {
    if (!confirm(`Remove this attribute?`)) return;

    const result = await MerchantService.removeAttribute(productId, [attributeId]);
    if (result.success) {
        const product = await MerchantService.getProductById(productId);
        renderAttributesList(product.attributes, productId);
        loadProducts();
    } else {
        alert(result.message || 'Failed to remove attribute');
    }
}

// --- Order Functions ---

async function loadOrders() {
    const { page, size } = paginationState.orders;
    const result = await MerchantService.getAllOrders(page, size);
    
    const orders = result.items || [];
    paginationState.orders.total = result.totalCount || 0;
    
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
        const orderId = o.id || o.orderId;
        const customer = o.customerName || 'Customer';
        const date = new Date(o.orderDate || o.createdOn).toLocaleDateString();
        const total = o.totalAmount || o.totalPrice;
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

    const orderId = order.id || order.orderId;
    const customer = order.customerName || 'Unknown';
    const date = new Date(order.orderDate || order.createdOn).toLocaleString();
    const status = order.status;
    const total = order.totalAmount || order.totalPrice;

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
    paginationState.customers.total = result.totalCount || 0;
    
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
