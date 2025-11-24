const CUSTOMER_API_URL = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://foodo.runasp.net/api') + '/Customers';

const CustomerService = {
    // --- Shops ---
    getAllShops: async (pageNumber = 1, pageSize = 10) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/get-all-shops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ PageNumber: pageNumber, PageSize: pageSize })
            });
            if (!response.ok) throw new Error('Failed to fetch shops');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { Items: [], TotalItems: 0 };
        } finally {
            Authentication.hideLoading();
        }
    },

    getAllShopsByCategory: async (category, pageNumber = 1, pageSize = 10) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/get-all-shops-by-category`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Category: category, PageNumber: pageNumber, PageSize: pageSize })
            });
            if (!response.ok) throw new Error('Failed to fetch shops by category');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { Items: [], TotalItems: 0 };
        } finally {
            Authentication.hideLoading();
        }
    },

    getShopById: async (id) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/get-shop-by-id/${id}`);
            if (!response.ok) throw new Error('Failed to fetch shop details');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            Authentication.hideLoading();
        }
    },

    // --- Products ---
    getAllProducts: async (pageNumber = 1, pageSize = 10) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/get-all-products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ PageNumber: pageNumber, PageSize: pageSize })
            });
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { Items: [], TotalItems: 0 };
        } finally {
            Authentication.hideLoading();
        }
    },

    getAllProductsByCategory: async (category, pageNumber = 1, pageSize = 10) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/get-all-products-by-category`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Category: category, PageNumber: pageNumber, PageSize: pageSize })
            });
            if (!response.ok) throw new Error('Failed to fetch products by category');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { Items: [], TotalItems: 0 };
        } finally {
            Authentication.hideLoading();
        }
    },

    getAllProductsByRestaurant: async (restaurantId, pageNumber = 1, pageSize = 10) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/get-all-products-by-restaurant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ MerchantId: restaurantId, Page: pageNumber, PageSize: pageSize })
            });
            if (!response.ok) throw new Error('Failed to fetch products by restaurant');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { Items: [], TotalItems: 0 };
        } finally {
            Authentication.hideLoading();
        }
    },

    getProductById: async (id) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/get-product-by-id/${id}`);
            if (!response.ok) throw new Error('Failed to fetch product details');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            Authentication.hideLoading();
        }
    },

    // --- Orders ---
    placeOrder: async (orderData) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/place-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to place order');
            }
            return { success: true, data: await response.json() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    getAllOrders: async (pageNumber = 1, pageSize = 10) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/get-all-orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify({ PageNumber: pageNumber, PageSize: pageSize })
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { Items: [], TotalItems: 0 };
        } finally {
            Authentication.hideLoading();
        }
    },

    getOrderById: async (id) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/get-order-by-id/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${Authentication.getToken()}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch order details');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            Authentication.hideLoading();
        }
    },

    cancelOrder: async (orderId) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CUSTOMER_API_URL}/cancel-order/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Authentication.getToken()}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to cancel order');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    }
};
