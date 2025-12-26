const MERCHANT_API_URL = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://foodo.runasp.net/api') + '/Merchants';


const MerchantService = {
    // --- Products ---

    getAllProducts: async (pageNumber = 1, pageSize = 10) => {
        try {
            // Backend: GET /Products?pageNumber={}&pageSize={} (with merchant auth)
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Products?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
                method: 'GET',
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to fetch products');
            
            // Backend returns: {message, traceId, data: {items, ...}}
            const result = await response.json();
            return result.data || { items: [], totalItems: 0 };
        } catch (error) {
            console.error(error);
            return { items: [], totalItems: 0 };
        }
    },

    getProductById: async (id) => {
        try {
            // Backend: GET /Products/{id}
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Products/${id}`, {
                method: 'GET',
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to fetch product');
            // Backend returns raw product data
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    createProduct: async (productData) => {
        // productData: { productName, productDescription, price, attributes: [], categories: [] }
        try {
            // Backend: POST /Products with JSON body
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData),
                showSpinner: true
            });

            if (!response.ok) {
                // Backend returns JSON error: {message, traceId}
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to create product');
                } catch (parseError) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to create product');
                }
            }
            
            // Backend returns: {message, traceId} (no data returned for create)
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateProduct: async (id, productData) => {
        // productData: { productName, productDescription, price }
        try {
            // Backend: PUT /Products/{id} with JSON body
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData),
                showSpinner: true
            });

            if (!response.ok) {
                // Backend returns JSON error: {message, traceId}
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update product');
                } catch (parseError) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to update product');
                }
            }
            
            // Backend returns: {message, traceId}
            const result = await response.json();
            return { success: true, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteProduct: async (id) => {
        try {
            // Backend: DELETE /Products/{id}
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Products/${id}`, {
                method: 'DELETE',
                showSpinner: true
            });

            if (!response.ok) {
                // Backend returns JSON error: {message, traceId}
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete product');
                } catch (parseError) {
                    throw new Error('Failed to delete product');
                }
            }
            
            // Backend returns: {message, traceId}
            const result = await response.json();
            return { success: true, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    addAttribute: async (productId, attributesList) => {
        // attributesList: [{attributeName, attributeValue}]
        try {
            // Backend: PUT /Products/{id}/attributes with JSON body {attributes: [...]}
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Products/${productId}/attributes`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ attributes: attributesList }),
                showSpinner: true
            });

            if (!response.ok) {
                // Backend returns JSON error: {message, traceId}
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to add attribute');
                } catch (parseError) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to add attribute');
                }
            }
            
            // Backend returns: {message, traceId}
            const result = await response.json();
            return { success: true, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    removeAttribute: async (productId, attributesList) => {
        // attributesList: [{attributeName, attributeValue}] (same format as add)
        try {
            // Backend: DELETE /Products/{id}/attributes with JSON body {attributes: [...]}
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Products/${productId}/attributes`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ attributes: attributesList }),
                showSpinner: true
            });

            if (!response.ok) {
                // Backend returns JSON error: {message, traceId}
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to remove attribute');
                } catch (parseError) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to remove attribute');
                }
            }
            
            // Backend returns: {message, traceId}
            const result = await response.json();
            return { success: true, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // --- Orders ---

    getAllOrders: async (pageNumber = 1, pageSize = 10) => {
        try {
            // Backend: GET /Orders?pageNumber={}&pageSize={} (with merchant auth)
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Orders?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
                method: 'GET',
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to fetch orders');
            
            // Backend returns: {message, traceId, data: {items, ...}}
            const result = await response.json();
            return result.data || { items: [], totalItems: 0 };
        } catch (error) {
            console.error(error);
            return { items: [], totalItems: 0 };
        }
    },

    getOrderById: async (id) => {
        try {
            // Backend: GET /Orders/{id}
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Orders/${id}`, {
                method: 'GET',
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to fetch order');
            
            // Backend returns: {message, traceId, data: {...}}
            const result = await response.json();
            return result.data || null;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    updateOrderStatus: async (id, status) => {
        try {
            // Backend: PUT /Orders/{id}/status with JSON body {status: orderState}
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: status }),
                showSpinner: true
            });

            if (!response.ok) {
                // Backend returns JSON error: {message, traceId}
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update order status');
                } catch (parseError) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to update order status');
                }
            }
            
            // Backend returns: {message, traceId}
            const result = await response.json();
            return { success: true, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getPurchasedCustomers: async (pageNumber = 1, pageSize = 10) => {
        try {
            // Backend: GET /Customers?pageNumber={}&pageSize={} (merchant-only endpoint)
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Customers?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
                method: 'GET',
                showSpinner: true
            });

            if (!response.ok) throw new Error('Failed to fetch customers');
            
            // Backend returns: {message, traceId, data: {items, ...}}
            const result = await response.json();
            return result.data || { items: [], totalItems: 0 };
        } catch (error) {
            console.error(error);
            return { items: [], totalItems: 0 };
        }
    },

    addProductCategories: async (productId, categories) => {
        try {
            // Backend: PUT /Products/{id}/categories with JSON body {categories: [...]}
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Products/${productId}/categories`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ categories: categories }),
                showSpinner: true
            });

            if (!response.ok) {
                // Backend returns JSON error: {message, traceId}
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to add categories');
                } catch (parseError) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to add categories');
                }
            }
            
            // Backend returns: {message, traceId}
            const result = await response.json();
            return { success: true, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    removeProductCategories: async (productId, categories) => {
        try {
            // Backend: DELETE /Products/{id}/categories with JSON body {categories: [...]}
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Products/${productId}/categories`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ categories: categories }),
                showSpinner: true
            });

            if (!response.ok) {
                // Backend returns JSON error: {message, traceId}
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to remove categories');
                } catch (parseError) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to remove categories');
                }
            }
            
            // Backend returns: {message, traceId}
            const result = await response.json();
            return { success: true, message: result.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};
