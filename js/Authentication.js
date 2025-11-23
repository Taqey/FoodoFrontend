const API_BASE_URL = 'https://localhost:7098/api/authentication';

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
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        document.cookie = "RefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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

    requireRole: (requiredRole) => {
        if (!Authentication.isAuthenticated()) {
            window.location.href = 'Login.html';
            return;
        }

        const role = Authentication.getUserRole();
        if (role !== requiredRole) {
            alert('Access Denied – Only merchants are allowed to view this page.');
            window.location.href = 'Main.html';
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

    // --- API Calls ---

    login: async (email, password, rememberMe) => {
        Authentication.showLoading();
        const formData = new FormData();
        formData.append('Email', email);
        formData.append('Password', password);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Login failed');
            }

            const data = await response.json();
            
            if (data.token) Authentication.setToken(data.token, rememberMe);
            if (data.refreshToken) document.cookie = `RefreshToken=${data.refreshToken}; path=/; secure; samesite=strict`;

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
                body: formData
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
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Registration failed');
            }

            const data = await response.json();

            // --- Merchant flow ---
            // Save tempUserId for categories selection
            sessionStorage.setItem('tempUserId', data.userId);
            // Redirect to categories page first
            window.location.href = 'Categories.html';

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
                body: JSON.stringify({ userId: userId, restaurantCategories: categories })
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
        Authentication.showLoading();
        try {
            const response = await fetch(`${API_BASE_URL}/refresh-token`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${Authentication.getToken()}` }
            });

            if (!response.ok) throw new Error('Refresh failed');

            const data = await response.json();
            if (data.token) {
                const isLocal = !!localStorage.getItem('accessToken');
                Authentication.setToken(data.token, isLocal);
                return true;
            }
            return false;
        } catch (error) {
            Authentication.logout();
            return false;
        } finally {
            Authentication.hideLoading();
        }
    },

    submitForgetPasswordRequest: async (email) => {
        Authentication.showLoading();
        const formData = new FormData();
        formData.append('Email', email);

        try {
            const response = await fetch(`${API_BASE_URL}/submit-forget-password-request`, {
                method: 'POST',
                body: formData
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
                body: formData
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

document.addEventListener('DOMContentLoaded', () => {
    Authentication.updateHeader();
});
