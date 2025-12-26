const PROFILE_API_BASE_URL = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://foodo.runasp.net/api');

const ProfileService = {
    // ==================== CUSTOMER PROFILE ====================
    
    /**
     * Fetches the authenticated customer's profile information
     * @returns {Promise<Object>} Profile data including addresses and email verification status
     */
    getCustomerProfile: async () => {
        try {
            // Backend: GET /Customers/profile
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/Customers/profile`,
                { 
                    method: 'GET',
                    showSpinner: true 
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to fetch customer profile');
            }

            // Backend returns raw profile data (not wrapped)
            return { success: true, data: await response.json() };
        } catch (error) {
            console.error('[ProfileService] getCustomerProfile error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Adds one or more addresses to customer profile
     * @param {Object} addressData - Address object with city, state, streetAddress, postalCode, country
     * @returns {Promise<Object>} Success status and message
     */
    addCustomerAddress: async (addressData) => {
        try {
            // Backend: POST /Adresses with JSON body (single address)
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/Adresses`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(addressData),
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add address');
            }

            // Backend returns plain text message
            const message = await response.text();
            return { success: true, message: message };
        } catch (error) {
            console.error('[ProfileService] addCustomerAddress error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Deletes a customer address by ID
     * @param {number} addressId - ID of the address to delete
     * @returns {Promise<Object>} Success status and message
     */
    deleteCustomerAddress: async (addressId) => {
        try {
            // Backend: DELETE /Adresses/{id}
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/Adresses/${addressId}`,
                {
                    method: 'DELETE',
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to delete address');
            }

            // Backend returns plain text message
            const message = await response.text();
            return { success: true, message: message };
        } catch (error) {
            console.error('[ProfileService] deleteCustomerAddress error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Sets a customer address as the default address
     * @param {number} addressId - ID of the address to set as default
     * @returns {Promise<Object>} Success status and message
     */
    setDefaultAddress: async (addressId) => {
        try {
            // Backend: PUT /Adresses/{id}/default (Customer only)
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/Adresses/${addressId}/default`,
                {
                    method: 'PUT',
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to set default address');
            }

            // Backend returns plain text message
            const message = await response.text();
            return { success: true, message: message };
        } catch (error) {
            console.error('[ProfileService] setDefaultAddress error:', error);
            return { success: false, message: error.message };
        }
    },

    // ==================== MERCHANT PROFILE ====================

    /**
     * Fetches the authenticated merchant's profile information
     * @returns {Promise<Object>} Profile data including addresses, store info, and email verification status
     */
    getMerchantProfile: async () => {
        try {
            // Backend: GET /Restaurants/profile
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/Restaurants/profile`,
                {
                    method: 'GET',
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to fetch merchant profile');
            }

            // Backend returns raw profile data (not wrapped)
            return { success: true, data: await response.json() };
        } catch (error) {
            console.error('[ProfileService] getMerchantProfile error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Adds one or more addresses to merchant profile
     * @param {Object} addressData - Address object with city, state, streetAddress, postalCode, country
     * @returns {Promise<Object>} Success status and message
     */
    addMerchantAddress: async (addressData) => {
        try {
            // Backend: POST /Adresses with JSON body (same as customer)
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/Adresses`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(addressData),
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add address');
            }

            // Backend returns plain text message
            const message = await response.text();
            return { success: true, message: message };
        } catch (error) {
            console.error('[ProfileService] addMerchantAddress error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Deletes a merchant address by ID
     * @param {number} addressId - ID of the address to delete
     * @returns {Promise<Object>} Success status and message
     */
    deleteMerchantAddress: async (addressId) => {
        try {
            // Backend: DELETE /Adresses/{id} (same as customer)
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/Adresses/${addressId}`,
                {
                    method: 'DELETE',
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to delete address');
            }

            // Backend returns plain text message
            const message = await response.text();
            return { success: true, message: message };
        } catch (error) {
            console.error('[ProfileService] deleteMerchantAddress error:', error);
            return { success: false, message: error.message };
        }
    },

    // ==================== EMAIL VERIFICATION ====================
    
    /**
     * Sends a verification code to the user's email
     * Uses existing Authentication.verifyEmailRequest()
     * @returns {Promise<Object>} Success status and message
     */
    sendVerificationCode: async () => {
        return await Authentication.verifyEmailRequest();
    },

    /**
     * Verifies the email using the provided code
     * Uses existing Authentication.verifyEmail()
     * @param {string} code - Verification code
     * @returns {Promise<Object>} Success status and message
     */
    verifyEmailCode: async (code) => {
        return await Authentication.verifyEmail(code);
    }
};
