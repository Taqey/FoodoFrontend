// Authentication.js - Simple Token Management System
// This implements the SIMPLEST mechanism: check token expiration before ANY API call

const Authentication = {
    // ==================== TOKEN STORAGE ====================
    
    getToken() {
        // Try localStorage first (Remember Me = true), then sessionStorage
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    },

    getTokenExpiration() {
        return localStorage.getItem('tokenExpiration') || sessionStorage.getItem('tokenExpiration');
    },

    setToken(token, expiresOn, rememberMe = false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('accessToken', token);
        storage.setItem('tokenExpiration', expiresOn);
    },

    removeToken() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenExpiration');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('tokenExpiration');
    },

    getRole() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
        } catch (e) {
            return null;
        }
    },

    // ==================== TOKEN EXPIRATION CHECK ====================

    isTokenExpired() {
        const expiresOn = this.getTokenExpiration();
        if (!expiresOn) return true;
        
        // Parse the expiration date and add a 30-second buffer
        const expirationTime = new Date(expiresOn).getTime();
        const currentTime = Date.now();
        const bufferTime = 30 * 1000; // 30 seconds
        
        return currentTime >= (expirationTime - bufferTime);
    },

    // ==================== SIMPLE PRE-API-CALL CHECK ====================
    // This is the CORE mechanism: check and refresh BEFORE any API call

    async checkAndRefreshToken() {
        const token = this.getToken();
        
        // If no token exists, return false (user is not logged in)
        if (!token) {
            return false;
        }
        
        // If token exists but is expired, refresh it
        if (this.isTokenExpired()) {
            const refreshed = await this.refreshAccessToken();
            return refreshed;
        }
        
        // Token exists and is not expired
        return true;
    },

    // ==================== REFRESH TOKEN ====================

    async refreshAccessToken() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/Authentication/refresh-token`, {
                method: 'POST',
                credentials: 'include', // CRITICAL: Send HttpOnly cookie
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Store the new token (use localStorage if old token was there, else sessionStorage)
                const rememberMe = !!localStorage.getItem('accessToken');
                this.setToken(data.token, data.expiresOn, rememberMe);
                
                return true;
            } else {
                // Refresh failed - clear tokens
                this.removeToken();
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.removeToken();
            return false;
        }
    },

    // ==================== FETCH WITH AUTH ====================
    // Simple: check token before request, add auth header, make request

    async fetchWithAuth(url, options = {}) {
        // STEP 1: Check if token is valid (refresh if expired)
        const tokenValid = await this.checkAndRefreshToken();
        if (!tokenValid) {
            // No token or refresh failed - logout
            this.logout();
            throw new Error('Authentication failed');
        }

        // STEP 2: Add Authorization header
        const token = this.getToken();
        options.headers = options.headers || {};
        options.headers['Authorization'] = `Bearer ${token}`;
        options.credentials = 'include'; // Always include cookies

        // STEP 3: Make the request
        const response = await fetch(url, options);

        // STEP 4: If 401, token is invalid - logout
        if (response.status === 401) {
            this.logout();
            throw new Error('Session expired');
        }

        return response;
    },

    // ==================== LOGIN ====================

    async login(email, password, rememberMe = false) {
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            const response = await fetch(`${CONFIG.API_BASE_URL}/Authentication/login`, {
                method: 'POST',
                body: formData,
                credentials: 'include' // CRITICAL: Receive HttpOnly cookie
            });

            if (response.ok) {
                const data = await response.json();
                
                // Store access token
                this.setToken(data.token, data.expiresOn, rememberMe);
                
                // Get role from token
                const role = this.getRole();
                
                return {
                    success: true,
                    role: role
                };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    message: errorText || 'Login failed'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Network error'
            };
        }
    },

    // ==================== LOGOUT ====================

    logout() {
        this.removeToken();
        window.location.href = 'Login.html';
    },

    // ==================== ROLE PROTECTION ====================

    requireRole(requiredRole) {
        const role = this.getRole();
        if (!role || role !== requiredRole) {
            this.logout();
        }
    },

    // ==================== UI HELPERS ====================

    updateHeader() {
        const token = this.getToken();
        const authButtons = document.getElementById('authButtons');
        const dropdown = document.getElementById('drop');

        if (token) {
            // User is logged in
            if (authButtons) authButtons.classList.add('d-none');
            if (dropdown) dropdown.classList.remove('d-none');
            
            // Set up logout button
            const logoutBtn = document.getElementById('logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        } else {
            // User is not logged in
            if (authButtons) authButtons.classList.remove('d-none');
            if (dropdown) dropdown.classList.add('d-none');
        }
    },

    // ==================== CHANGE PASSWORD ====================

    async changePassword(currentPassword, newPassword) {
        try {
            const formData = new FormData();
            formData.append('currentPassword', currentPassword);
            formData.append('newPassword', newPassword);

            const response = await this.fetchWithAuth(`${CONFIG.API_BASE_URL}/Authentication/change-password`, {
                method: 'POST',
                body: formData
            });

            if (response.ok || response.status === 204) {
                return { success: true };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    message: errorText || 'Failed to change password'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Network error'
            };
        }
    },

    // ==================== EMAIL VERIFICATION ====================

    /**
     * Sends a verification code to the authenticated user's email
     * @returns {Promise<Object>} Success status and message
     */
    async verifyEmailRequest() {
        try {
            const response = await this.fetchWithAuth(`${CONFIG.API_BASE_URL}/Authentication/verify-email-request`, {
                method: 'POST'
            });

            if (response.ok) {
                const message = await response.text();
                return { success: true, message: message || 'Verification code sent' };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    message: errorText || 'Failed to send verification code'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Network error'
            };
        }
    },  
      showLoading: () => {
        let spinner = document.getElementById('global-spinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'global-spinner';
            spinner.innerHTML = `
                <div class="spinner-overlay">
                    <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
                <style>
                    .spinner-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255, 255, 255, 0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 9999;
                        backdrop-filter: blur(2px);
                    }
                </style>
            `;
            document.body.appendChild(spinner);
        }
        spinner.style.display = 'block';
        document.body.style.pointerEvents = 'none';
    },

    hideLoading: () => {
        const spinner = document.getElementById('global-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
        document.body.style.pointerEvents = 'auto';
    },
    
    registerCustomer: async (customerData) => {
        Authentication.showLoading();
        const formData = new FormData();
        for (const key in customerData) formData.append(key, customerData[key]);

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/Authentication/register-customer`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Registration failed');
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    registerMerchant: async (merchantData) => {
        Authentication.showLoading();
        const formData = new FormData();
        for (const key in merchantData) formData.append(key, merchantData[key]);

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/Authentication/register-merchant`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Registration failed');
            }

            const data = await response.json();

            // --- Merchant flow ---
            // Return data so caller can handle redirection
            return { success: true, data: data };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    addCategory: async (userId, categories) => {
        Authentication.showLoading();
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/Authentication/add-category`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, restaurantCategories: categories }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to add categories');
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    /**
     * Verifies the user's email using the provided code
     * @param {string} code - Verification code from email
     * @returns {Promise<Object>} Success status and message
     */
    async verifyEmail(code) {
        try {
            const formData = new FormData();
            formData.append('Code', code);

            const response = await this.fetchWithAuth(`${CONFIG.API_BASE_URL}/Authentication/verify-email`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const message = await response.text();
                return { success: true, message: message || 'Email verified successfully' };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    message: errorText || 'Invalid or expired verification code'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Network error'
            };
        }
    }
};

// Make it globally available
window.Authentication = Authentication;
