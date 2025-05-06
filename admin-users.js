document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const usersTableBody = document.getElementById('usersTableBody');
    const totalUserCountBadge = document.getElementById('totalUserCount');
    const userManagementAlert = document.getElementById('userManagementAlert');
    const userSearchInput = document.getElementById('userSearchInput');
    const modal = document.getElementById('userDetailsModal');
    
    // Modal elements
    const modalFullName = document.getElementById('modalFullName');
    const modalUsername = document.getElementById('modalUsername');
    const modalEmail = document.getElementById('modalEmail');
    const modalRegDate = document.getElementById('modalRegDate');
    const modalApprovalDate = document.getElementById('modalApprovalDate');
    const modalStatus = document.getElementById('modalStatus');
    const suspendUserBtn = document.getElementById('suspendUserBtn');
    const activateUserBtn = document.getElementById('activateUserBtn');
    const deleteUserBtn = document.getElementById('deleteUserBtn');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Current user being viewed in modal
    let currentUserId = null;
    
    // Store all users for filtering
    let allUsers = [];
    
    // Load users
    loadUsers();
    
    // Set up search functionality
    userSearchInput.addEventListener('input', filterUsers);
    
    // Set up modal button event listeners
    suspendUserBtn.addEventListener('click', function() {
        if (currentUserId) {
            updateUserStatus(currentUserId, 'suspended');
        }
    });
    
    activateUserBtn.addEventListener('click', function() {
        if (currentUserId) {
            updateUserStatus(currentUserId, 'active');
        }
    });
    
    deleteUserBtn.addEventListener('click', function() {
        if (currentUserId) {
            deleteUser(currentUserId);
        }
    });
    
    // Close modal when clicking close buttons
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Function to load users
    function loadUsers() {
        const users = JSON.parse(localStorage.getItem('kaalamVRUsers')) || [];
        allUsers = users; // Store for filtering
        
        // Update total count badge
        totalUserCountBadge.textContent = users.length;
        
        displayUsers(users);
    }
    
    // Function to display users in table
    function displayUsers(users) {
        // Clear table body
        usersTableBody.innerHTML = '';
        
        if (users.length === 0) {
            usersTableBody.innerHTML = '<tr class="empty-state"><td colspan="6">No users found.</td></tr>';
            return;
        }
        
        // Sort users by approval date (newest first)
        users.sort((a, b) => {
            const dateA = a.approvalDate ? new Date(a.approvalDate) : new Date(a.registrationDate);
            const dateB = b.approvalDate ? new Date(b.approvalDate) : new Date(b.registrationDate);
            return dateB - dateA;
        });
        
        // Add users to table
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // Format approval date
            const approvalDate = user.approvalDate ? new Date(user.approvalDate) : null;
            const formattedApprovalDate = approvalDate ? 
                `${approvalDate.toLocaleDateString()} ${approvalDate.toLocaleTimeString()}` : 
                'N/A';
            
            // Determine status
            const status = user.status || 'active';
            const statusClass = status === 'active' ? 'status-active' : 'status-suspended';
            
            row.innerHTML = `
                <td>${user.fullName}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${formattedApprovalDate}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    ${status === 'active' ? 
                        `<button class="btn btn-small btn-warning suspend-user" data-userid="${user.id}">Suspend</button>` : 
                        `<button class="btn btn-small btn-success activate-user" data-userid="${user.id}">Activate</button>`
                    }
                    <button class="btn btn-small btn-danger delete-user" data-userid="${user.id}">Delete</button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-user').forEach(button => {
            button.addEventListener('click', function() {
                showUserDetails(this.getAttribute('data-userid'));
            });
        });
        
        document.querySelectorAll('.suspend-user').forEach(button => {
            button.addEventListener('click', function() {
                updateUserStatus(this.getAttribute('data-userid'), 'suspended');
            });
        });
        
        document.querySelectorAll('.activate-user').forEach(button => {
            button.addEventListener('click', function() {
                updateUserStatus(this.getAttribute('data-userid'), 'active');
            });
        });
        
        document.querySelectorAll('.delete-user').forEach(button => {
            button.addEventListener('click', function() {
                deleteUser(this.getAttribute('data-userid'));
            });
        });
    }
    
    // Function to filter users
    function filterUsers() {
        const searchTerm = userSearchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            displayUsers(allUsers);
            return;
        }
        
        const filteredUsers = allUsers.filter(user => {
            return user.fullName.toLowerCase().includes(searchTerm) ||
                   user.username.toLowerCase().includes(searchTerm) ||
                   user.email.toLowerCase().includes(searchTerm);
        });
        
        displayUsers(filteredUsers);
    }
    
    // Function to show user details in modal
    function showUserDetails(userId) {
        const user = allUsers.find(u => u.id === userId);
        
        if (user) {
            // Set modal content
            modalFullName.textContent = user.fullName;
            modalUsername.textContent = user.username;
            modalEmail.textContent = user.email;
            
            // Format registration date
            const regDate = new Date(user.registrationDate);
            modalRegDate.textContent = `${regDate.toLocaleDateString()} ${regDate.toLocaleTimeString()}`;
            
            // Format approval date
            const approvalDate = user.approvalDate ? new Date(user.approvalDate) : null;
            modalApprovalDate.textContent = approvalDate ? 
                `${approvalDate.toLocaleDateString()} ${approvalDate.toLocaleTimeString()}` : 
                'N/A';
            
            // Set status
            const status = user.status || 'active';
            modalStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            modalStatus.className = status === 'active' ? 'status-active' : 'status-suspended';
            
            // Toggle button visibility
            if (status === 'active') {
                suspendUserBtn.style.display = 'inline-block';
                activateUserBtn.style.display = 'none';
            } else {
                suspendUserBtn.style.display = 'none';
                activateUserBtn.style.display = 'inline-block';
            }
            
            // Set current user ID
            currentUserId = userId;
            
            // Show modal
            modal.style.display = 'block';
        }
    }
    
    // Function to update user status
    function updateUserStatus(userId, status) {
        const users = JSON.parse(localStorage.getItem('kaalamVRUsers')) || [];
        
        // Find user index
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            // Update user status
            users[userIndex].status = status;
            
            // Save to localStorage
            localStorage.setItem('kaalamVRUsers', JSON.stringify(users));
            
            // Update allUsers array
            allUsers = users;
            
            // Show success message
            const username = users[userIndex].username;
            const action = status === 'active' ? 'activated' : 'suspended';
            showAlert('success', `User ${username} has been ${action} successfully.`);
            
            // Reload users table
            loadUsers();
            
            // Close modal if open
            if (currentUserId === userId) {
                modal.style.display = 'none';
            }
        }
    }
    
    // Function to delete user
    function deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('kaalamVRUsers')) || [];
        
        // Find user index
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            // Get user info for message
            const username = users[userIndex].username;
            
            // Remove user
            users.splice(userIndex, 1);
            
            // Save to localStorage
            localStorage.setItem('kaalamVRUsers', JSON.stringify(users));
            
            // Update allUsers array
            allUsers = users;
            
            // Show success message
            showAlert('warning', `User ${username} has been deleted.`);
            
            // Reload users table
            loadUsers();
            
            // Close modal if open
            if (currentUserId === userId) {
                modal.style.display = 'none';
            }
        }
    }
    
    // Function to show alert
    function showAlert(type, message) {
        userManagementAlert.textContent = message;
        userManagementAlert.className = `alert alert-${type}`;
        userManagementAlert.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            userManagementAlert.style.display = 'none';
        }, 5000);
    }
});