document.addEventListener("DOMContentLoaded", function () {
    const loadingBar = document.getElementById('loadingBar');
    const content = document.getElementById('content');
    const loginAlert = document.getElementById('loginAlert');
    const logoutAlert = document.getElementById('logoutAlert');

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
                if (content) {
                    content.classList.add('show');
                }
            }, 500);
        }
    }

    showLoadingBar();
    setTimeout(hideLoadingBar, 180);

    function showSuccessMessageLogin(message, redirectUrl) {
        hideLoadingBar();
        loginAlert.textContent = message;
        loginAlert.classList.remove('hidden');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 2000);
    }

    function showErrorMessage(message) {
        hideLoadingBar();
        loginAlert.textContent = message;
        loginAlert.classList.remove('hidden');
        setTimeout(() => {
            loginAlert.classList.add('hidden');
        }, 3000);
    }

    function showLogoutMessage(message) {
        logoutAlert.textContent = message;
        logoutAlert.classList.remove('hidden');
        setTimeout(() => {
            logoutAlert.classList.add('hidden');
            window.location.href = 'login.html';
        }, 1000);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            showLoadingBar();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            fetch(`http://localhost:3000/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('userId', data.userId);
                        if (data.admin) {
                            showSuccessMessageLogin('Login successful! Redirecting to Admin Profile', '../admin/admin-profile.html');
                        } else {
                            showSuccessMessageLogin('Login successful! Redirecting to User Profile', '../user/user-profile.html');
                        }
                    } else {
                        showErrorMessage('Login failed: ' + data.message);
                    }
                })
                .catch(error => {
                    showErrorMessage('Error during login. Please try again later. ' + error);
                });
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();
            showLoadingBar();

            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

            if (password !== passwordConfirm) {
                showErrorMessage('Passwords do not match');
                return;
            }

            fetch(`http://localhost:3000/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showSuccessMessageLogin('Registration successful! Redirecting to Login', 'login.html');
                    } else if (data.message === 'User already exists') {
                        showErrorMessage('Account already exists');
                    } else {
                        showErrorMessage('Registration failed: ' + data.message);
                    }
                })
                .catch(error => {
                    showErrorMessage('Registration failed due to an error ' + error);
                });
        });
    }

    const userId = localStorage.getItem('userId');
    const logoutButton = document.getElementById('logoutButton');

    if (userId) {
        document.querySelectorAll('.auth a[href*="login"], .auth a[href*="register"]').forEach(button => {
            button.style.display = 'none';
        });

        fetch(`http://localhost:3000/api/user/details?userId=${userId}`)
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
            localStorage.removeItem('userId');
            showLogoutMessage('Logout successful!');
        });
    } else {
        document.querySelector('.avatar.placeholder').style.display = 'none';
        document.getElementById('user-profile-dropdown').style.display = 'none';
        document.getElementById('admin-profile-dropdown').style.display = 'none';
    }

    attachButtonResetHandlers();

    function attachButtonResetHandlers() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('mousedown', function () {
                this.style.backgroundColor = '#A0A0A0';
                this.style.color = '#000000';
            });
            button.addEventListener('mouseup', function () {
                this.style.backgroundColor = '#FFCC48';
                this.style.color = '#000000';
            });
            button.addEventListener('mouseleave', function () {
                this.style.backgroundColor = '#FFCC48';
                this.style.color = '#000000';
            });
            button.addEventListener('mouseover', function () {
                if (!this.classList.contains('active')) {
                    this.style.backgroundColor = '#A0A0A0';
                    this.style.color = '#000000';
                }
            });
            button.addEventListener('mouseout', function () {
                if (!this.classList.contains('active')) {
                    this.style.backgroundColor = '#FFCC48';
                    this.style.color = '#000000';
                }
            });
        });
    }
});
