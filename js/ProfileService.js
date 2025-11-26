const PROFILE_API_BASE_URL = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://foodo.runasp.net/api');

const ProfileService = {
    // ==================== CUSTOMER PROFILE ====================
    
    /**
     * Fetches the authenticated customer's profile information
     * @returns {Promise<Object>} Profile data including addresses and email verification status
     */
    getCustomerProfile: async () => {
        try {
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/CustomerProfile/get-customer-profile`,
                { 
                    method: 'GET',
                    showSpinner: true 
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to fetch customer profile');
            }

            return { success: true, data: await response.json() };
        } catch (error) {
            console.error('[ProfileService] getCustomerProfile error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Adds one or more addresses to customer profile
     * @param {Array} addresses - Array of address objects with city, state, streetAddress, postalCode, country
     * @returns {Promise<Object>} Success status and message
     */
    addCustomerAddress: async (addresses) => {
        try {
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/CustomerProfile/add-adress`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adresses: addresses }),
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add address');
            }

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
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/CustomerProfile/delete-adress/${addressId}`,
                {
                    method: 'DELETE',
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to delete address');
            }

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
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/CustomerProfile/set-adress-default/${addressId}`,
                {
                    method: 'PUT',
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to set default address');
            }

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
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/MerchantProfile/get-merchant-profile`,
                {
                    method: 'GET',
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to fetch merchant profile');
            }

            return { success: true, data: await response.json() };
        } catch (error) {
            console.error('[ProfileService] getMerchantProfile error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Adds one or more addresses to merchant profile
     * @param {Array} addresses - Array of address objects with city, state, streetAddress, postalCode, country
     * @returns {Promise<Object>} Success status and message
     */
    addMerchantAddress: async (addresses) => {
        try {
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/MerchantProfile/add-adress`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adresses: addresses }),
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add address');
            }

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
            const response = await Authentication.fetchWithAuth(
                `${PROFILE_API_BASE_URL}/MerchantProfile/delete-adress/${addressId}`,
                {
                    method: 'DELETE',
                    showSpinner: true
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to delete address');
            }

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
