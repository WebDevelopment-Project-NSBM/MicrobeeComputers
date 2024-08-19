document.addEventListener("DOMContentLoaded", function () {
    const loadingBar = document.getElementById('loadingBar');
    const content = document.getElementById('content');
    const logoutAlert = document.getElementById('logoutAlert');

    function showLoading() {
        if (loadingBar) {
            loadingBar.style.width = '100%';
            loadingBar.style.display = 'block';
        }
    }

    function hideLoading() {
        if (loadingBar) {
            loadingBar.style.width = '0';
        }
        if (content) {
            content.classList.add('show');
        }
    }
    showLoading();
    setTimeout(hideLoading, 180);

    const authToken = localStorage.getItem('authToken');

    const loginButton = document.querySelector('.auth a[href*="login"]');
    const registerButton = document.querySelector('.auth a[href*="register"]');
    const userProfileDropdown = document.getElementById('user-profile-dropdown');
    const adminProfileDropdown = document.getElementById('admin-profile-dropdown');
    const logoutButton = document.getElementById('logoutButton');
    const avatar = document.querySelector('.avatar.placeholder');
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        fetch('http://localhost:3000/api/contactus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name, email, message })
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    showAlert('Message sent successfully');
                    contactForm.reset();
                } else {
                    showAlert(`Failed to send message: ${result.message}`);
                }
            })
            .catch(error => {
                console.error('Error sending message:', error);
                showAlert('An error occurred while sending the message.');
            });
    });

    function showAlert(message) {
        const loginAlert = document.getElementById('Alert');
        loginAlert.textContent = message;
        loginAlert.classList.remove('hidden');
        loginAlert.classList.add('show');
        setTimeout(() => {
            loginAlert.classList.remove('show');
            loginAlert.classList.add('hidden');
        }, 2000);
    }

    function showTokenExpireLogOutAlert(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.add('hidden');
            document.body.removeChild(alertDiv);
        }, 3000);
    }

    function showLogoutMessage(message) {
        showTokenExpireLogOutAlert(message);
        setTimeout(() => {
            window.location.href = '../auth/login.html';
        }, 1000);
    }

    function handleTokenExpiration() {
        localStorage.removeItem('authToken');
        showLogoutMessage('Your session has expired. Please log in again.');
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

    if (authToken) {
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';

        fetch(`http://localhost:3000/api/user/details`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(async response => {
                hideLoading();
                if (response.status === 401 || response.status === 403) {
                    const data = await response.json();
                    if (data.error === 'TokenExpired' || response.status === 403) {
                        handleTokenExpiration();
                    } else {
                        throw new Error('Unauthorized access');
                    }
                } else if (!response.ok) {
                    throw new Error('Error fetching user profile');
                } else {
                    return response.json();
                }
            })
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
        userProfileDropdown.style.display = 'none';
        adminProfileDropdown.style.display = 'none';
    }
});
