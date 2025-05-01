document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginMessage = document.getElementById('loginMessage');
    
    // Store admin users - in a real app, this would be server-side
    // IMPORTANT: This is just for demonstration - in production, NEVER store credentials in client-side code
    const adminUsers = [
        { username: 'admin', password: 'Admin@123' }
    ];
    
    // Check if user is already logged in
    checkAuthStatus();
    
    // Login form submission handler
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Validate input
        if (!username || !password) {
            showMessage('error', 'Please enter both username and password');
            return;
        }
        
        // Authenticate user
        authenticateUser(username, password);
    });
    
    // Function to authenticate user
    function authenticateUser(username, password) {
        // Clear previous messages
        loginMessage.className = 'form-message';
        loginMessage.style.display = 'none';
        
        // In a real app, this would be an API call to a secure backend
        // For demo purposes, we're checking against the local array
        const user = adminUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Successful login
            showMessage('success', 'Login successful! Redirecting...');
            
            // Store auth token in localStorage
            // In a real app, this would be a JWT or other secure token from the server
            localStorage.setItem('adminAuth', JSON.stringify({
                username: username,
                token: 'demo-token-' + Math.random().toString(36).substring(2),
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
            }));
            
            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // Failed login
            showMessage('error', 'Invalid username or password');
            
            // Clear password field
            document.getElementById('password').value = '';
        }
    }
    
    // Function to display form messages
    function showMessage(type, message) {
        loginMessage.textContent = message;
        loginMessage.className = 'form-message ' + type;
        loginMessage.style.display = 'block';
    }
    
    // Function to check if user is already authenticated
    function checkAuthStatus() {
        const auth = JSON.parse(localStorage.getItem('adminAuth'));
        
        if (auth && auth.expires > Date.now()) {
            // User is already logged in, redirect to dashboard
            window.location.href = 'index.html';
        }
    }
});

// Auth Guard - Protect admin pages

document.addEventListener('DOMContentLoaded', function() {
    // Check if the current page is the login page
    const isLoginPage = window.location.pathname.includes('login.html');
    
    // If not on login page, verify authentication
    if (!isLoginPage) {
        checkAuth();
    }
    
    // Add logout functionality if logout button exists
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    // Function to check authentication
    function checkAuth() {
        const auth = JSON.parse(localStorage.getItem('adminAuth'));
        
        // If no auth token or token is expired, redirect to login
        if (!auth || auth.expires <= Date.now()) {
            localStorage.removeItem('adminAuth'); // Clear expired token
            window.location.href = 'login.html';
            return;
        }
        
        // Optional: Update user info in the UI
        const usernameElement = document.getElementById('currentUsername');
        if (usernameElement && auth.username) {
            usernameElement.textContent = auth.username;
        }
    }
    
    // Function to handle logout
    function logout(e) {
        e.preventDefault();
        
        // Clear auth data
        localStorage.removeItem('adminAuth');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
});