const API_BASE = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://foodo.runasp.net/api');
const CUSTOMER_API_URL = `${API_BASE}/Customers`;

// ------------------------------------------------------------
//                Global Fetch Helper (No Repetition)
// ------------------------------------------------------------

async function apiRequest(url, method = 'GET', body = null, useAuth = false) {
    Authentication.showLoading();
    try {
        const headers = { 'Content-Type': 'application/json' };

        if (useAuth) {
            const token = Authentication.getToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        // Handle Unauthorized (token expired)
        if (response.status === 401) {
            Authentication.logout();
            window.location.href = '/login.html';
            return null;
        }

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Request failed');
        }

        const text = await response.text();
        return text ? JSON.parse(text) : {};

    } catch (error) {
        console.error("API Error:", error);
        return null;
    } finally {
        Authentication.hideLoading();
    }
}

// ------------------------------------------------------------
//                        Customer Service
// ------------------------------------------------------------

const CustomerService = {

    // --------------------------------------------------------
    //                        SHOPS
    // --------------------------------------------------------

    getAllShops: (page = 1, pageSize = 10) =>
        apiRequest(`${CUSTOMER_API_URL}/get-all-shops`, 'POST', {
            Page: page,
            PageSize: pageSize
        }),

    getAllShopsByCategory: (category, page = 1, pageSize = 10) =>
        apiRequest(`${CUSTOMER_API_URL}/get-all-shops-by-category`, 'POST', {
            Category: category,
            Page: page,
            PageSize: pageSize
        }),

    getShopById: (id) =>
        apiRequest(`${CUSTOMER_API_URL}/get-shop-by-id/${id}`, 'GET'),


    // --------------------------------------------------------
    //                        PRODUCTS
    // --------------------------------------------------------

    getAllProducts: (page = 1, pageSize = 10) =>
        apiRequest(`${CUSTOMER_API_URL}/get-all-products`, 'POST', {
            Page: page,
            PageSize: pageSize
        }),

    getAllProductsByCategory: (category, page = 1, pageSize = 10) =>
        apiRequest(`${CUSTOMER_API_URL}/get-all-products-by-category`, 'POST', {
            Category: category,
            Page: page,
            PageSize: pageSize
        }),

    getAllProductsByRestaurant: (restaurantId, page = 1, pageSize = 10) =>
        apiRequest(`${CUSTOMER_API_URL}/get-all-products-by-restaurant`, 'POST', {
            MerchantId: restaurantId,
            Page: page,
            PageSize: pageSize
        }),

    getProductById: (id) =>
        apiRequest(`${CUSTOMER_API_URL}/get-product-by-id/${id}`, 'GET'),


    // --------------------------------------------------------
    //                        ORDERS
    // --------------------------------------------------------

    placeOrder: (orderData) =>
        apiRequest(`${CUSTOMER_API_URL}/place-order`, 'POST', orderData, true),

    getAllOrders: (page = 1, pageSize = 10) =>
        apiRequest(`${CUSTOMER_API_URL}/get-all-orders`, 'POST', {
            Page: page,
            PageSize: pageSize
        }, true),

    getOrderById: (id) =>
        apiRequest(`${CUSTOMER_API_URL}/get-order-by-id/${id}`, 'GET', null, true),

    cancelOrder: (orderId) =>
        apiRequest(`${CUSTOMER_API_URL}/cancel-order/${orderId}`, 'DELETE', null, true)
};
