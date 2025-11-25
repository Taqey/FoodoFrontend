const MERCHANT_API_URL = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://foodo.runasp.net/api') + '/Merchants';


const MerchantService = {
    // --- Products ---

    getAllProducts: async (pageNumber = 1, pageSize = 10) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/get-all-products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify({ PageNumber: pageNumber, PageSize: pageSize })
            });

            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { items: [], totalItems: 0 }; // Return empty structure on error
        } finally {
            Authentication.hideLoading();
        }
    },

    getProductById: async (id) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/get-product-by-id/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${Authentication.getToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch product');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            Authentication.hideLoading();
        }
    },

    createProduct: async (productData) => {
        // productData: { productName, productDescription, price, attributes: [] }
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/create-product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create product');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    updateProduct: async (id, productData) => {
        // productData: { productName, productDescription, price, attributes: [] }
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/update-product/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to update product');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    deleteProduct: async (id) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/delete-product/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Authentication.getToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete product');
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    addAttribute: async (productId, attributesList) => {
        // attributesList: [{ name, value, measurementUnit }]
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/add-attribute?id=${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify({ Attributes: attributesList })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add attribute');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    removeAttribute: async (productId, attributeIds) => {
        // attributeIds: [int, int]
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/remove-attribute?id=${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify({ Attributes: attributeIds })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to remove attribute');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    // --- Orders ---

    getAllOrders: async (pageNumber = 1, pageSize = 10) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/get-all-orders`, {
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
            return { items: [], totalItems: 0 }; // Return empty structure on error like getAllProducts
        } finally {
            Authentication.hideLoading();
        }
    },

    getOrderById: async (id) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/get-order-by-id/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${Authentication.getToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch order');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            Authentication.hideLoading();
        }
    },

    updateOrderStatus: async (id, status) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/update-order-status/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify({ Status: status })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to update order status');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    getPurchasedCustomers: async (pageNumber = 1, pageSize = 10) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/get-purchased-customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify({ PageNumber: pageNumber, PageSize: pageSize })
            });

            if (!response.ok) throw new Error('Failed to fetch customers');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { items: [], totalItems: 0 };
        } finally {
            Authentication.hideLoading();
        }
    },

    addProductCategories: async (productId, categories) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/add-categories/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify({ Categories: categories })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add categories');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    removeProductCategories: async (productId, categories) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/remove-categories/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Authentication.getToken()}`
                },
                body: JSON.stringify({ Categories: categories })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to remove categories');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    }
};
