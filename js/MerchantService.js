const MERCHANT_API_URL = 'https://localhost:7098/api/Merchants';

const MerchantService = {
    // --- Products ---

    getAllProducts: async () => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${MERCHANT_API_URL}/get-all-products`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${Authentication.getToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
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
                body: JSON.stringify({ attributes: attributesList })
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
                body: JSON.stringify({ attributes: attributeIds })
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
    }
};
