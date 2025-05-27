document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
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
        
        // Authenticate user - will automatically determine if admin or regular user
        authenticateUser(username, password);
    });
    
    // Function to authenticate user (detects admin vs regular user)
    function authenticateUser(username, password) {
        // Clear previous messages
        loginMessage.className = 'form-message';
        loginMessage.style.display = 'none';
        
        // First, check if this is an admin account
        const admin = adminUsers.find(u => u.username === username && u.password === password);
        
        if (admin) {
            // Successful admin login
            showMessage('success', 'Admin login successful! Redirecting...');
            
            // Store auth token in localStorage
            localStorage.setItem('adminAuth', JSON.stringify({
                username: username,
                token: 'admin-token-' + Math.random().toString(36).substring(2),
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
            }));
            
            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            return;
        }
        
        // If not admin, check regular users
        const approvedUsers = JSON.parse(localStorage.getItem('kaalamVRUsers')) || [];
        const user = approvedUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
            
            if(user.status === 'active'){
                // Successful user login
                showMessage('success', 'Login successful! Redirecting...');
                
                // Store user auth in localStorage
                localStorage.setItem('userAuth', JSON.stringify({
                    userId: user.id,
                    username: username,
                    fullName: user.fullName,
                    email: user.email,
                    token: 'user-token-' + Math.random().toString(36).substring(2),
                    expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
                }));
                
                // Redirect to user dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                return;
            }
            else if(user.status === 'suspended'){
                showMessage('error', 'Your account is suspended. Please contact support.');
                return;
            }
        }
        
        // Check if the user exists but is pending approval
        const pendingUsers = JSON.parse(localStorage.getItem('kaalamVRPendingUsers')) || [];
        const isPending = pendingUsers.some(u => u.username === username);
        
        if (isPending) {
            showMessage('error', 'Your account is pending admin approval');
        } else {
            showMessage('error', 'Invalid username or password');
        }
        
        // Clear password field
        document.getElementById('password').value = '';
    }
    
    // Function to display form messages
    function showMessage(type, message) {
        loginMessage.textContent = message;
        loginMessage.className = 'form-message ' + type;
        loginMessage.style.display = 'block';
    }
    
    // Function to check if user is already authenticated
    function checkAuthStatus() {
        // Check for admin auth
        const adminAuth = JSON.parse(localStorage.getItem('adminAuth'));
        if (adminAuth && adminAuth.expires > Date.now()) {
            window.location.href = 'index.html'; // Redirect to admin dashboard
            return;
        }
        
        // Check for user auth
        const userAuth = JSON.parse(localStorage.getItem('userAuth'));
        if (userAuth && userAuth.expires > Date.now()) {
            window.location.href = 'index.html'; // Redirect to user dashboard
            return;
        }
        
        // Clear any expired tokens
        if (adminAuth && adminAuth.expires <= Date.now()) {
            localStorage.removeItem('adminAuth');
        }
        
        if (userAuth && userAuth.expires <= Date.now()) {
            localStorage.removeItem('userAuth');
        }
    }
});