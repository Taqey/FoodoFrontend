const MERCHANT_API_URL = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://foodo.runasp.net/api') + '/Merchants';


const MerchantService = {
    // --- Products ---

    getAllProducts: async (pageNumber = 1, pageSize = 10) => {
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/get-all-products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ PageNumber: pageNumber, PageSize: pageSize }),
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { items: [], totalItems: 0 }; // Return empty structure on error
        }
    },

    getProductById: async (id) => {
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/get-product-by-id/${id}`, {
                method: 'GET',
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to fetch product');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    createProduct: async (productData) => {
        // productData: { productName, productDescription, price, attributes: [] }
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/create-product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData),
                showSpinner: true
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create product');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateProduct: async (id, productData) => {
        // productData: { productName, productDescription, price, attributes: [] }
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/update-product/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData),
                showSpinner: true
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to update product');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/delete-product/${id}`, {
                method: 'DELETE',
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to delete product');
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    addAttribute: async (productId, attributesList) => {
        // attributesList: [{ name, value, measurementUnit }]
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/add-attribute?id=${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Attributes: attributesList }),
                showSpinner: true
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add attribute');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    removeAttribute: async (productId, attributeIds) => {
        // attributeIds: [int, int]
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/remove-attribute?id=${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Attributes: attributeIds }),
                showSpinner: true
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to remove attribute');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // --- Orders ---

    getAllOrders: async (pageNumber = 1, pageSize = 10) => {
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/get-all-orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ PageNumber: pageNumber, PageSize: pageSize }),
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to fetch orders');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { items: [], totalItems: 0 }; // Return empty structure on error like getAllProducts
        }
    },

    getOrderById: async (id) => {
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/get-order-by-id/${id}`, {
                method: 'GET',
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to fetch order');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    updateOrderStatus: async (id, status) => {
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/update-order-status/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Status: status }),
                showSpinner: true
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to update order status');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getPurchasedCustomers: async (pageNumber = 1, pageSize = 10) => {
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/get-purchased-customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ PageNumber: pageNumber, PageSize: pageSize }),
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to fetch customers');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { items: [], totalItems: 0 };
        }
    },

    addProductCategories: async (productId, categories) => {
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/add-categories/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Categories: categories }),
                showSpinner: true
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add categories');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    removeProductCategories: async (productId, categories) => {
        try {
            const response = await Authentication.fetchWithAuth(`${MERCHANT_API_URL}/remove-categories/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Categories: categories }),
                showSpinner: true
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to remove categories');
            }
            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};
