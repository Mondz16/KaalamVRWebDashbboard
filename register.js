document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('userRegistrationForm');
    const registrationMessage = document.getElementById('registrationMessage');
    
    // Registration form submission handler
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate input
        if (!fullName || !email || !username || !password || !confirmPassword) {
            showMessage('error', 'Please fill in all fields');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('error', 'Please enter a valid email address');
            return;
        }
        
        // Validate password strength (at least 8 characters, one uppercase, one lowercase, one number)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            showMessage('error', 'Password must be at least 8 characters long and include uppercase, lowercase, and numbers');
            return;
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            showMessage('error', 'Passwords do not match');
            return;
        }
        
        // Process registration
        registerUser(fullName, email, username, password);
    });
    
    // Function to register user
    function registerUser(fullName, email, username, password) {
        // Clear previous messages
        registrationMessage.className = 'form-message';
        registrationMessage.style.display = 'none';
        
        // Check if username already exists
        const existingUsers = JSON.parse(localStorage.getItem('kaalamVRUsers')) || [];
        const pendingUsers = JSON.parse(localStorage.getItem('kaalamVRPendingUsers')) || [];
        
        // Check if username or email already exists in either approved or pending users
        const usernameExists = existingUsers.some(user => user.username === username) || 
                              pendingUsers.some(user => user.username === username);
        
        const emailExists = existingUsers.some(user => user.email === email) || 
                           pendingUsers.some(user => user.email === email);
        
        if (usernameExists) {
            showMessage('error', 'Username already taken. Please choose another.');
            return;
        }
        
        if (emailExists) {
            showMessage('error', 'Email already registered. Please use another email or login.');
            return;
        }
        
        // Create new user object
        const newUser = {
            id: Date.now().toString(),
            fullName: fullName,
            email: email,
            username: username,
            password: password, // In a real app, this would be hashed
            registrationDate: new Date().toISOString(),
            approved: false,
            status: 'active'
        };
        
        // Add to pending users
        pendingUsers.push(newUser);
        localStorage.setItem('kaalamVRPendingUsers', JSON.stringify(pendingUsers));
        
        // Show success message
        showMessage('success', 'Registration successful! Your account is pending admin approval. You will be redirected to the login page.');
        
        // Redirect to login page after delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
    }
    
    // Function to display form messages
    function showMessage(type, message) {
        registrationMessage.textContent = message;
        registrationMessage.className = 'form-message ' + type;
        registrationMessage.style.display = 'block';
    }
});