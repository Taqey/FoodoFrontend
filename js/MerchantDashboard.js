// --- Tab Logic ---
function showTab(tabId, linkElement) {
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
    linkElement.classList.add('active');
}

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

async function loadProducts() {
    const products = await MerchantService.getAllProducts();
    currentProducts = products;
    renderProducts(products);
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

    productModal.show();
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

    if (!name || !price) {
        alert('Name and Price are required.');
        return;
    }

    const productData = {
        productName: name,
        productDescription: description,
        price: price.toString(), // Backend expects string
        attributes: [] // Attributes handled separately in edit mode
    };

    let result;
    if (id) {
        result = await MerchantService.updateProduct(id, productData);
    } else {
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
        // Refresh attributes list
        const product = await MerchantService.getProductById(productId);
        renderAttributesList(product.attributes, productId);
        document.getElementById('newAttributeName').value = '';
        document.getElementById('newAttributeValue').value = '';
        document.getElementById('newAttributeUnit').value = '';
        loadProducts(); // Update main table too
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
    // Fetching first page with large size for simplicity
    const response = await MerchantService.getAllOrders(1, 50);
    // Handle potential pagination wrapper
    const orders = response && response.items ? response.items : (Array.isArray(response) ? response : []);
    currentOrders = orders;
    renderOrders(currentOrders);
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
        // Adjust field names based on actual DTO
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

    // Render Items
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

    // Store current order ID for update
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
    const customers = await MerchantService.getPurchasedCustomers();
    renderCustomers(customers);
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
