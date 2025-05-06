document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const pendingUsersTableBody = document.getElementById('pendingUsersTableBody');
    const recentlyApprovedTableBody = document.getElementById('recentlyApprovedTableBody');
    const pendingCountBadge = document.getElementById('pendingCount');
    const approvalAlert = document.getElementById('approvalAlert');
    const modal = document.getElementById('userDetailsModal');
    
    // Modal elements
    const modalFullName = document.getElementById('modalFullName');
    const modalUsername = document.getElementById('modalUsername');
    const modalEmail = document.getElementById('modalEmail');
    const modalRegDate = document.getElementById('modalRegDate');
    const approveUserBtn = document.getElementById('approveUserBtn');
    const rejectUserBtn = document.getElementById('rejectUserBtn');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Current user being viewed in modal
    let currentUserId = null;
    
    // Load pending users
    loadPendingUsers();
    
    // Load recently approved users
    loadRecentlyApprovedUsers();
    
    // Set up event listeners for modal buttons
    approveUserBtn.addEventListener('click', function() {
        if (currentUserId) {
            approveUser(currentUserId);
        }
    });
    
    rejectUserBtn.addEventListener('click', function() {
        if (currentUserId) {
            rejectUser(currentUserId);
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
    
    // Function to load pending users
    function loadPendingUsers() {
        const pendingUsers = JSON.parse(localStorage.getItem('kaalamVRPendingUsers')) || [];
        
        // Update pending count badge
        pendingCountBadge.textContent = pendingUsers.length;
        
        // Clear table body
        pendingUsersTableBody.innerHTML = '';
        
        if (pendingUsers.length === 0) {
            pendingUsersTableBody.innerHTML = '<tr class="empty-state"><td colspan="5">No pending registrations found.</td></tr>';
            return;
        }
        
        // Sort users by registration date (newest first)
        pendingUsers.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
        
        // Add users to table
        pendingUsers.forEach(user => {
            const row = document.createElement('tr');
            
            // Format date
            const regDate = new Date(user.registrationDate);
            const formattedDate = `${regDate.toLocaleDateString()} ${regDate.toLocaleTimeString()}`;
            
            row.innerHTML = `
                <td>${user.fullName}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn btn-small btn-success approve-user" data-userid="${user.id}">Approve</button>
                    <button class="btn btn-small btn-danger reject-user" data-userid="${user.id}">Reject</button>
                </td>
            `;
            
            pendingUsersTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-user').forEach(button => {
            button.addEventListener('click', function() {
                showUserDetails(this.getAttribute('data-userid'));
            });
        });
        
        document.querySelectorAll('.approve-user').forEach(button => {
            button.addEventListener('click', function() {
                approveUser(this.getAttribute('data-userid'));
            });
        });
        
        document.querySelectorAll('.reject-user').forEach(button => {
            button.addEventListener('click', function() {
                rejectUser(this.getAttribute('data-userid'));
            });
        });
    }
    
    // Function to load recently approved users
    function loadRecentlyApprovedUsers() {
        const approvedUsers = JSON.parse(localStorage.getItem('kaalamVRUsers')) || [];
        
        // Clear table body
        recentlyApprovedTableBody.innerHTML = '';
        
        if (approvedUsers.length === 0) {
            recentlyApprovedTableBody.innerHTML = '<tr class="empty-state"><td colspan="4">No approved users found.</td></tr>';
            return;
        }
        
        // Sort users by approval date (newest first) if exists, otherwise by registration date
        approvedUsers.sort((a, b) => {
            const dateA = a.approvalDate ? new Date(a.approvalDate) : new Date(a.registrationDate);
            const dateB = b.approvalDate ? new Date(b.approvalDate) : new Date(b.registrationDate);
            return dateB - dateA;
        });
        
        // Take only the 10 most recent approved users
        const recentUsers = approvedUsers.slice(0, 10);
        
        // Add users to table
        recentUsers.forEach(user => {
            const row = document.createElement('tr');
            
            // Format date
            const approvalDate = user.approvalDate ? new Date(user.approvalDate) : new Date(user.registrationDate);
            const formattedDate = `${approvalDate.toLocaleDateString()} ${approvalDate.toLocaleTimeString()}`;
            
            row.innerHTML = `
                <td>${user.fullName}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${formattedDate}</td>
            `;
            
            recentlyApprovedTableBody.appendChild(row);
        });
    }
    
    // Function to show user details in modal
    function showUserDetails(userId) {
        const pendingUsers = JSON.parse(localStorage.getItem('kaalamVRPendingUsers')) || [];
        const user = pendingUsers.find(u => u.id === userId);
        
        if (user) {
            // Set modal content
            modalFullName.textContent = user.fullName;
            modalUsername.textContent = user.username;
            modalEmail.textContent = user.email;
            
            // Format date
            const regDate = new Date(user.registrationDate);
            modalRegDate.textContent = `${regDate.toLocaleDateString()} ${regDate.toLocaleTimeString()}`;
            
            // Set current user ID
            currentUserId = userId;
            
            // Show modal
            modal.style.display = 'block';
        }
    }
    
    // Function to approve user
    function approveUser(userId) {
        const pendingUsers = JSON.parse(localStorage.getItem('kaalamVRPendingUsers')) || [];
        const approvedUsers = JSON.parse(localStorage.getItem('kaalamVRUsers')) || [];
        
        // Find user index
        const userIndex = pendingUsers.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            // Get user
            const user = pendingUsers[userIndex];
            
            // Add approval info
            user.approved = true;
            user.approvalDate = new Date().toISOString();
            
            // Add to approved users
            approvedUsers.push(user);
            
            // Remove from pending users
            pendingUsers.splice(userIndex, 1);
            
            // Save to localStorage
            localStorage.setItem('kaalamVRPendingUsers', JSON.stringify(pendingUsers));
            localStorage.setItem('kaalamVRUsers', JSON.stringify(approvedUsers));
            
            // Show success message
            showAlert('success', `User ${user.username} has been approved successfully.`);
            
            // Reload tables
            loadPendingUsers();
            loadRecentlyApprovedUsers();
            
            // Close modal if open
            if (currentUserId === userId) {
                modal.style.display = 'none';
            }
        }
    }
    
    // Function to reject user
    function rejectUser(userId) {
        const pendingUsers = JSON.parse(localStorage.getItem('kaalamVRPendingUsers')) || [];
        
        // Find user index
        const userIndex = pendingUsers.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            // Get user info for message
            const username = pendingUsers[userIndex].username;
            
            // Remove from pending users
            pendingUsers.splice(userIndex, 1);
            
            // Save to localStorage
            localStorage.setItem('kaalamVRPendingUsers', JSON.stringify(pendingUsers));
            
            // Show success message
            showAlert('warning', `User ${username} has been rejected.`);
            
            // Reload tables
            loadPendingUsers();
            
            // Close modal if open
            if (currentUserId === userId) {
                modal.style.display = 'none';
            }
        }
    }
    
    // Function to show alert
    function showAlert(type, message) {
        approvalAlert.textContent = message;
        approvalAlert.className = `alert alert-${type}`;
        approvalAlert.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            approvalAlert.style.display = 'none';
        }, 5000);
    }
});