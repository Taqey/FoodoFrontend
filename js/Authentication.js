const API_BASE_URL = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://foodo.runasp.net/api') + '/Authentication';

const Authentication = {
    // --- State Management ---
    getToken: () => localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'),
    
    setToken: (token, rememberMe) => {
        if (rememberMe) {
            localStorage.setItem('accessToken', token);
        } else {
            sessionStorage.setItem('accessToken', token);
        }
    },

    clearToken: () => {
        // Clear access token from both storage locations
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        
        // Note: HttpOnly refresh token cookie cannot be cleared from JavaScript.
        // It will be cleared by the backend or expire naturally.
    },

    isAuthenticated: () => !!Authentication.getToken(),

    getUserRole: () => {
        const token = Authentication.getToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role;
        } catch (e) {
            return null;
        }
    },

    getUserId: () => {
        const token = Authentication.getToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.nameid || payload.sub;
        } catch (e) {
            return null;
        }
    },

    getTokenExpiration: (token) => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000; // Convert to ms
        } catch (e) {
            return null;
        }
    },

    requireRole: (requiredRole) => {
        if (!Authentication.isAuthenticated()) {
            window.location.href = 'Login.html';
            return;
        }

        const role = Authentication.getUserRole();
        if (role !== requiredRole) {
            alert('Access Denied – Only merchants are allowed to view this page.');
            window.location.href = 'index.html';
        }
    },

    // --- Spinner Logic ---
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

    // --- Core API Wrapper ---
    
    /**
     * A wrapper for fetch that handles authentication automatically.
     * - Adds Authorization header
     * - Checks token expiration before request
     * - Handles 401 by refreshing and retrying
     * - Manages loading state if requested
     */
    fetchWithAuth: async (url, options = {}) => {
        const { showSpinner = false, ...fetchOptions } = options;
        
        if (showSpinner) Authentication.showLoading();

        try {
            // 1. Check if token is expired before making the request
            await Authentication.ensureValidToken();

            // 2. Prepare headers
            const headers = new Headers(fetchOptions.headers || {});
            const token = Authentication.getToken();
            
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            
            // Ensure credentials are included for cookies
            fetchOptions.credentials = 'include';
            fetchOptions.headers = headers;

            // 3. Make the initial request
            let response = await fetch(url, fetchOptions);

            // 4. Handle 401 Unauthorized (Token might have expired during flight or check failed)
            if (response.status === 401) {
                console.warn('[AUTH] 401 received, attempting refresh and retry...');
                
                const refreshSuccess = await Authentication.refreshToken();
                
                if (refreshSuccess) {
                    // Update header with new token
                    headers.set('Authorization', `Bearer ${Authentication.getToken()}`);
                    fetchOptions.headers = headers;
                    
                    // Retry request
                    response = await fetch(url, fetchOptions);
                } else {
                    console.error('[AUTH] Refresh failed after 401, logging out.');
                    Authentication.logout();
                    throw new Error('Session expired. Please login again.');
                }
            }

            return response;
        } catch (error) {
            throw error;
        } finally {
            if (showSpinner) Authentication.hideLoading();
        }
    },

    ensureValidToken: async () => {
        const token = Authentication.getToken();
        if (!token) return;

        const exp = Authentication.getTokenExpiration(token);
        if (!exp) return;

        const now = Date.now();
        
        // If token is expired, refresh immediately
        if (now >= exp) {
            console.log('[AUTH] Token expired, refreshing before request...');
            const success = await Authentication.refreshToken();
            if (!success) {
                console.error('[AUTH] Failed to refresh expired token, logging out.');
                Authentication.logout();
                throw new Error('Session expired');
            }
        }
    },

    // --- API Calls ---

    login: async (email, password, rememberMe) => {
        Authentication.showLoading();
        const formData = new FormData();
        formData.append('Email', email);
        formData.append('Password', password);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                body: formData,
                credentials: 'include' // Required to receive HttpOnly refresh token cookie
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Login failed');
            }

            const data = await response.json();
            
            // Store access token based on Remember Me setting
            // Refresh token is automatically set as HttpOnly cookie by backend
            if (data.token) {
                Authentication.setToken(data.token, rememberMe);
            }

            return { success: true, role: Authentication.getUserRole() };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    registerCustomer: async (customerData) => {
        Authentication.showLoading();
        const formData = new FormData();
        for (const key in customerData) formData.append(key, customerData[key]);

        try {
            const response = await fetch(`${API_BASE_URL}/register-customer`, {
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
            const response = await fetch(`${API_BASE_URL}/register-merchant`, {
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
            const response = await fetch(`${API_BASE_URL}/add-category`, {
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

    refreshToken: async () => {
        // Don't show global loading for background refresh to avoid interrupting user
        try {
            console.log('[AUTH] Attempting token refresh...');
            const response = await fetch(`${API_BASE_URL}/refresh-token`, {
                method: 'POST',
                credentials: 'include' // Ensure cookies are sent with the request
            });

            // Only return true if response is 200 OK
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AUTH] Refresh token failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                return false;
            }

            const data = await response.json();
            if (data.token) {
                // Preserve storage type (localStorage or sessionStorage)
                const isLocal = !!localStorage.getItem('accessToken');
                Authentication.setToken(data.token, isLocal);
                console.log('[AUTH] ✓ Token refreshed successfully');
                return true;
            }
            console.error('[AUTH] Refresh response missing token:', data);
            return false;
        } catch (error) {
            console.error('[AUTH] Token refresh failed (network error):', error);
            return false;
        }
    },

    tryAutoLogin: async () => {
        // Try to auto-login using refresh token on page load
        // This enables persistent login even after browser restart
        const token = Authentication.getToken();
        
        // If no token at all, user is not logged in
        if (!token) {
            console.log('[AUTH] No token found - user not logged in');
            return false;
        }
        
        // Check if token is expired
        const exp = Authentication.getTokenExpiration(token);
        if (!exp) {
            console.log('[AUTH] Invalid token expiration');
            return false;
        }
        
        const now = Date.now();
        
        // If token is expired, try to refresh it immediately
        if (now >= exp) {
            console.log('[AUTH] Token expired on load, attempting auto-refresh...');
            const refreshSuccess = await Authentication.refreshToken();
            
            if (!refreshSuccess) {
                // Refresh failed - log user out silently
                console.log('[AUTH] ✗ Auto-refresh failed, logging out');
                Authentication.clearToken();
                return false;
            }
            console.log('[AUTH] ✓ Auto-login successful via refresh token');
            return true;
        }
        
        // Token is valid
        console.log('[AUTH] ✓ Token valid on load');
        return true;
    },

    submitForgetPasswordRequest: async (email) => {
        Authentication.showLoading();
        const formData = new FormData();
        formData.append('Email', email);

        try {
            const response = await fetch(`${API_BASE_URL}/submit-forget-password-request`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to send request');
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    resetPassword: async (code, newPassword) => {
        Authentication.showLoading();
        const formData = new FormData();
        formData.append('Code', code);
        formData.append('NewPassword', newPassword);

        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to reset password');
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            Authentication.hideLoading();
        }
    },

    verifyEmailRequest: async () => {
        try {
            const response = await Authentication.fetchWithAuth(`${API_BASE_URL}/verify-email-request`, {
                method: 'POST',
                showSpinner: true
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to send verification email');
            }

            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    verifyEmail: async (code) => {
        const formData = new FormData();
        formData.append('Code', code);

        try {
            const response = await Authentication.fetchWithAuth(`${API_BASE_URL}/verify-email`, {
                method: 'POST',
                body: formData,
                showSpinner: true
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to verify email');
            }

            return { success: true, message: await response.text() };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    logout: () => {
        Authentication.clearToken();
        window.location.href = 'Login.html';
    },

    // --- UI Helpers ---
    updateHeader: () => {
        const isLoggedIn = Authentication.isAuthenticated();
        const loginBtn = document.querySelector('a[href*="Login"]');
        const registerBtn = document.querySelector('a[href*="Register"]');
        const profileDropdown = document.getElementById('drop');

        if (isLoggedIn) {
            if (loginBtn) loginBtn.classList.add('d-none');
            if (registerBtn) registerBtn.classList.add('d-none');
            if (profileDropdown) profileDropdown.classList.remove('d-none');
        } else {
            if (loginBtn) loginBtn.classList.remove('d-none');
            if (registerBtn) registerBtn.classList.remove('d-none');
            if (profileDropdown) profileDropdown.classList.add('d-none');
        }

        const logoutLink = document.getElementById('logout');
        if (logoutLink) {
            logoutLink.onclick = (e) => {
                e.preventDefault();
                Authentication.logout();
            };
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Try auto-login first (handles expired tokens via refresh)
    await Authentication.tryAutoLogin();
    
    // Update header based on authentication state
    Authentication.updateHeader();
});
