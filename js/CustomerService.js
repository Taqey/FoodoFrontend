// Customer Service JavaScript

const CustomerService = {
    // --- Shops/Restaurants ---
    getAllShops: async (pageNumber = 1, pageSize = 10) => {
        try {
            // Public endpoint - no auth required
            // Backend: GET /Restaurants?pageNumber={}&pageSize={}
            const response = await fetch(`${CONFIG.API_BASE_URL}/Restaurants?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
                method: 'GET'
            });
            if (!response.ok) throw new Error('Failed to fetch restaurants');
            
            // Backend returns: {message, traceId, data: {items, ...}}
            const result = await response.json();
            return result.data || { items: [], totalItems: 0 };
        } catch (error) {
            console.error(error);
            return { items: [], totalItems: 0 };
        }
    },

    getAllShopsByCategory: async (category, pageNumber = 1, pageSize = 10) => {
        try {
            // Public endpoint - no auth required
            // Backend: GET /Restaurants?pageNumber={}&pageSize={}&categoryId={}
            const response = await fetch(`${CONFIG.API_BASE_URL}/Restaurants?pageNumber=${pageNumber}&pageSize=${pageSize}&categoryId=${category}`, {
                method: 'GET'
            });
            if (!response.ok) throw new Error('Failed to fetch restaurants by category');
            
            // Backend returns: {message, traceId, data: {items, ...}}
            const result = await response.json();
            return result.data || { items: [], totalItems: 0 };
        } catch (error) {
            console.error(error);
            return { items: [], totalItems: 0 };
        }
    },

    getShopById: async (id) => {
        try {
            // Public endpoint - no auth required
            // Backend: GET /Restaurants/{id}
            const response = await fetch(`${CONFIG.API_BASE_URL}/Restaurants/${id}`, {
                method: 'GET'
            });
            if (!response.ok) throw new Error('Failed to fetch restaurant details');
            
            // Backend returns: {message, traceId, data: {...}}
            const result = await response.json();
            return result.data || null;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    // --- Products ---
    
    /**
     * UNIFIED PRODUCT FETCHING METHOD
     * Fetches products with flexible filtering using query parameters.
     * Supports pagination, category, restaurant filtering, and sorting.
     * 
     * @param {Object} options - Filter and pagination options
     * @param {number} options.pageNumber - Page number (default: 1)
     * @param {number} options.pageSize - Page size (default: 10)
     * @param {number} options.categoryId - Optional category filter (FoodCategory enum value)
     * @param {string} options.restaurantId - Optional restaurant filter
     * @param {string} options.orderBy - Optional sort field (e.g., 'price', 'name')
     * @param {string} options.direction - Optional sort direction ('asc' or 'desc')
     * @returns {Promise<{items: Array, totalItems: number, totalPages: number, currentPage: number, pageSize: number}>}
     */
    getProducts: async (options = {}) => {
        const {
            pageNumber = 1,
            pageSize = 10,
            categoryId = null,
            restaurantId = null,
            orderBy = null,
            direction = null
        } = options;
        
        try {
            // Build query parameters dynamically
            const params = new URLSearchParams({
                pageNumber: pageNumber.toString(),
                pageSize: pageSize.toString()
            });
            
            // Add optional filters
            if (categoryId) params.append('categoryId', categoryId.toString());
            if (restaurantId) params.append('restaurantId', restaurantId.toString());
            
            // Add sorting parameters
            if (orderBy) params.append('orderBy', orderBy);
            
            // Map 'asc'/'desc' to Backend Enum 'Ascending'/'Descending'
            if (direction) {
                const map = { 'asc': 'Ascending', 'desc': 'Descending' };
                const backendValue = map[direction.toLowerCase()] || direction; // Fallback to as-is if not mapped
                params.append('orderingDirection', backendValue);
            }
            
            // Single unified endpoint call
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/Products?${params.toString()}`,
                { method: 'GET' }
            );
            
            if (!response.ok) throw new Error('Failed to fetch products');
            
            // Backend returns: {message, traceId, data: {items, totalPages, currentPage, pageSize, totalItems}}
            const result = await response.json();
            return result.data || { items: [], totalItems: 0, totalPages: 0, currentPage: pageNumber, pageSize: pageSize };
        } catch (error) {
            console.error('[CustomerService] getProducts error:', error);
            return { items: [], totalItems: 0, totalPages: 0, currentPage: pageNumber, pageSize: pageSize };
        }
    },

    getProductById: async (id) => {
        try {
            // Public endpoint - no auth required
            // Backend: GET /Products/{id}
            const response = await fetch(`${CONFIG.API_BASE_URL}/Products/${id}`, {
                method: 'GET'
            });
            if (!response.ok) throw new Error('Failed to fetch product details');
            
            // Backend returns: raw product data (not wrapped in {message, traceId, data})
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    // --- Orders ---
    placeOrder: async (orderData) => {
        try {
            // Backend: POST /Orders with JSON body {items: [...]}
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData),
                showSpinner: true
            });

            if (!response.ok) {
                // Backend returns JSON error: {message, traceId}
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to place order');
                } catch (parseError) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to place order');
                }
            }
            
            // Backend returns: {message, traceId} (no data returned for create)
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getAllOrders: async (pageNumber = 1, pageSize = 10) => {
        try {
            // Backend: GET /Orders?pageNumber={}&pageSize={} (with customer auth)
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

    cancelOrder: async (id) => {
        try {
            // Backend: DELETE /Orders/{id}
            const response = await Authentication.fetchWithAuth(`${CONFIG.API_BASE_URL}/Orders/${id}`, {
                method: 'DELETE',
                showSpinner: true
            });

            if (!response.ok) {
                // Backend returns JSON error: {message, traceId}
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to cancel order');
                } catch (parseError) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to cancel order');
                }
            }
            
            // Backend returns: {message, traceId}
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};
