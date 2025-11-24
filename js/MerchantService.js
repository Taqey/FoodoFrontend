const MERCHANT_API_URL =
    (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://foodo.runasp.net/api')
    + '/Merchants';


// ---------- Shared API Request Handler ----------
async function apiRequest(endpoint, method = 'GET', body = null) {
    Authentication.showLoading();
    try {
        const response = await fetch(`${MERCHANT_API_URL}/${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Authentication.getToken()}`
            },
            body: body ? JSON.stringify(body) : null
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || `Request failed: ${endpoint}`);
        }

        // Try parse JSON – if fails return plain text
        try {
            return { success: true, data: JSON.parse(text) };
        } catch {
            return { success: true, data: text };
        }
    } catch (error) {
        return { success: false, message: error.message };
    } finally {
        Authentication.hideLoading();
    }
}



// ===================== Merchant Service =====================

const MerchantService = {

    // ---------- Products ----------
    getAllProducts: (page = 1, size = 10) =>
        apiRequest('get-all-products', 'POST', { PageNumber: page, PageSize: size }),

    getProductById: (id) =>
        apiRequest(`get-product-by-id/${id}`, 'GET'),

    createProduct: (data) =>
        apiRequest('create-product', 'POST', data),

    updateProduct: (id, data) =>
        apiRequest(`update-product/${id}`, 'PUT', data),

    deleteProduct: (id) =>
        apiRequest(`delete-product/${id}`, 'DELETE'),

    addAttribute: (productId, attributesList) =>
        apiRequest(`add-attribute?id=${productId}`, 'PUT', { attributes: attributesList }),

    removeAttribute: (productId, attributeIds) =>
        apiRequest(`remove-attribute?id=${productId}`, 'PUT', { attributes: attributeIds }),



    // ---------- Orders ----------
    getAllOrders: (page = 1, size = 10) =>
        apiRequest('get-all-orders', 'POST', { PageNumber: page, PageSize: size }),

    getOrderById: (id) =>
        apiRequest(`get-order-by-id/${id}`, 'GET'),

    updateOrderStatus: (id, status) =>
        apiRequest(`update-order-status/${id}`, 'PUT', { Status: status }),



    // ---------- Customers ----------
    getPurchasedCustomers: (page = 1, size = 10) =>
        apiRequest('get-purchased-customers', 'POST', { PageNumber: page, PageSize: size }),



    // ---------- Categories ----------
    addProductCategories: (productId, categories) =>
        apiRequest(`add-categories/${productId}`, 'PUT', { Categories: categories }),

    removeProductCategories: (productId, categories) =>
        apiRequest(`remove-categories/${productId}`, 'PUT', { Categories: categories }),
};
