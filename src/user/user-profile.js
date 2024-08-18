document.addEventListener("DOMContentLoaded", function () {
    const userProfileContainer = document.getElementById('userProfileContainer');
    const logoutButton = document.getElementById('logoutButton');
    const authToken = localStorage.getItem('authToken');
    const loadingBar = document.getElementById('loadingBar');
    const logoutAlert = document.getElementById('logoutAlert');

    if (!authToken) {
        window.location.href = '../auth/login.html';
        return;
    }

    function showLoadingBar() {
        if (loadingBar) {
            loadingBar.style.width = '100%';
            loadingBar.style.display = 'block';
            loadingBar.classList.remove('hidden');
        }
    }

    function hideLoadingBar() {
        if (loadingBar) {
            loadingBar.style.width = '0';
            setTimeout(() => {
                loadingBar.style.display = 'none';
            }, 500);
        }
    }

    function fetchUserProfile() {
        showLoadingBar();
        fetch(`http://localhost:3000/api/user/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => response.json())
            .then(data => {
                hideLoadingBar();
                if (data.email) {
                    renderUserProfile(data);
                } else {
                    userProfileContainer.innerHTML = '<p>Error fetching user profile.</p>';
                }
            })
            .catch(error => {
                hideLoadingBar();
                console.error('Error fetching user profile:', error);
                userProfileContainer.innerHTML = '<p>Error fetching user profile.</p>';
            });
    }

    function renderUserProfile(user) {
        const userHTML = `
            <div class="card mb-3 mx-auto max-w-md">
                <div class="card-body">
                    <h5 class="text-center text-2xl font-bold mb-6">${user.email || 'User Profile'}</h5>
                    <p class="card-text mb-4"><strong>Email:</strong> ${user.email}</p>
                    <p class="card-text mb-4"><strong>Admin:</strong> ${user.admin ? 'Yes' : 'No'}</p>
                    <p class="card-text mb-4"><strong>Member since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `;
        userProfileContainer.innerHTML = userHTML;
    }

    function showLogoutMessage(message) {
        logoutAlert.textContent = message;
        logoutAlert.classList.remove('hidden');
        setTimeout(() => {
            logoutAlert.classList.add('hidden');
            window.location.href = '../auth/login.html';
        }, 1000);
    }

    function handleLogout() {
        fetch(`http://localhost:3000/api/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.removeItem('authToken');
                    showLogoutMessage('Logout successful!');
                } else {
                    console.error('Error logging out:', data.message);
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
            });
    }

    if (authToken) {
        document.querySelectorAll('.auth a[href*="login"], .auth a[href*="register"]').forEach(button => {
            button.style.display = 'none';
        });

        fetch(`http://localhost:3000/api/user/details`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => response.json())
            .then(data => {
                const { email, admin } = data;
                if (email) {
                    const firstLetter = email.charAt(0).toUpperCase();
                    document.querySelector('.avatar.placeholder span').textContent = firstLetter;
                }

                if (admin) {
                    document.getElementById('user-profile-dropdown').style.display = 'block';
                    document.getElementById('admin-profile-dropdown').style.display = 'block';
                } else {
                    document.getElementById('user-profile-dropdown').style.display = 'block';
                    document.getElementById('admin-profile-dropdown').style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
            });

        logoutButton.addEventListener('click', function (event) {
            event.preventDefault();
            localStorage.removeItem('authToken');
            showLogoutMessage('Logout successful!');
        });
    } else {
        document.querySelector('.avatar.placeholder').style.display = 'none';
        document.getElementById('user-profile-dropdown').style.display = 'none';
        document.getElementById('admin-profile-dropdown').style.display = 'none';
    }

    fetchUserProfile();
});
