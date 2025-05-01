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