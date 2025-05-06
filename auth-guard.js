// Auth Guard - Protect admin pages
document.addEventListener('DOMContentLoaded', function() {
    
    // If on an admin page, verify admin authentication
    checkAuth();
    
    // Add logout functionality if buttons exist
    const adminLogoutButton = document.getElementById('logoutButton');
    if (adminLogoutButton) {
        adminLogoutButton.addEventListener('click', logoutAdmin);
    }
    
    const userLogoutButton = document.getElementById('logoutButton');
    if (userLogoutButton) {
        userLogoutButton.addEventListener('click', logoutUser);
    }
    
    // Function to check admin authentication
    function checkAuth() {
        const auth = JSON.parse(localStorage.getItem('adminAuth'));
        const userAuth = JSON.parse(localStorage.getItem('userAuth'));
        
        if(auth){
            // Optional: Update admin info in the UI
            const usernameElement = document.getElementById('currentUsername');
            if (usernameElement && auth.username) {
                usernameElement.textContent = auth.username;
            }
            return;
        }
        else if(userAuth){
            // Optional: Update user info in the UI
            const usernameElement = document.getElementById('currentUsername');
            const fullNameElement = document.getElementById('currentFullName');
            
            if (usernameElement && userAuth.username) {
                usernameElement.textContent = userAuth.username;
            }
            
            if (fullNameElement && userAuth.fullName) {
                fullNameElement.textContent = userAuth.fullName;
            }
            return;
        }

        // If no auth token or token is expired, redirect to login
        if (!auth || auth.expires <= Date.now()) {
            localStorage.removeItem('adminAuth'); // Clear expired token
            window.location.href = 'login.html';
            return;
        }
        else if (!userAuth || userAuth.expires <= Date.now()) {
            localStorage.removeItem('userAuth'); // Clear expired token
            window.location.href = 'login.html';
            return;
        }
    }
    
    // Function to handle admin logout
    function logoutAdmin(e) {
        e.preventDefault();
        localStorage.removeItem('adminAuth');
        window.location.href = 'login.html';
    }
    
    // Function to handle user logout
    function logoutUser(e) {
        e.preventDefault();
        localStorage.removeItem('userAuth');
        window.location.href = 'login.html';
    }
});