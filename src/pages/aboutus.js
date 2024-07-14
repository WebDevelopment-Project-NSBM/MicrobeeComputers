document.addEventListener("DOMContentLoaded", function () {
    const loadingBar = document.getElementById('loadingBar');
    const content = document.getElementById('content');
    const logoutAlert = document.getElementById('logoutAlert');

    function showLoading() {
        loadingBar.style.width = '100%';
        loadingBar.style.display = 'block';
    }

    function hideLoading() {
        loadingBar.style.width = '0';
        content.classList.add('show');
    }
    showLoading();
    setTimeout(hideLoading, 180);

    const userId = localStorage.getItem('userId');

    const loginButton = document.querySelector('.auth a[href*="login"]');
    const registerButton = document.querySelector('.auth a[href*="register"]');
    const userProfileDropdown = document.getElementById('user-profile-dropdown');
    const adminProfileDropdown = document.getElementById('admin-profile-dropdown');
    const logoutButton = document.getElementById('logoutButton');
    const avatar = document.querySelector('.avatar.placeholder');

    function handleLogout() {
        fetch(`http://localhost:3000/api/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.removeItem('userId');
                    showLogoutAlert();
                    setTimeout(() => {
                        window.location.href = '../auth/login.html';
                    }, 3000);
                } else {
                    console.error('Error logging out:', data.message);
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
            });
    }

    function showLogoutAlert() {
        logoutAlert.classList.remove('hidden');
        setTimeout(() => {
            logoutAlert.classList.add('hidden');
        }, 3000);
    }

    if (userId) {
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';

        fetch(`http://localhost:3000/api/user/details?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                const { email, admin } = data;

                if (email) {
                    const firstLetter = email.charAt(0).toUpperCase();
                    avatar.querySelector('span').textContent = firstLetter;
                }

                if (admin) {
                    userProfileDropdown.style.display = 'block';
                    adminProfileDropdown.style.display = 'block';
                } else {
                    userProfileDropdown.style.display = 'block';
                    adminProfileDropdown.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
            });

        logoutButton.addEventListener('click', handleLogout);
    } else {
        avatar.style.display = 'none';
    }
});
