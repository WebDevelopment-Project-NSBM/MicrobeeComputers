document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.has('login') ? 'login' : urlParams.has('register') ? 'register' : null;

    if (tab) {
        $(`#${tab}-tab`).tab('show');
        $(`#${tab}`).addClass('show active');
    } else {
        $('#login-tab').tab('show');
        $('#login').addClass('show active');
    }

    function showSuccessMessage(message) {
        document.getElementById('successMessage').textContent = message;
        $('#successModal').modal('show');
        setTimeout(() => {
            $('#successModal').modal('hide');
            window.location.href = '../structures/index.html';
        }, 2000);
    }

    function showErrorMessage(message) {
        alert(message);
    }

    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault();
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
                        window.location.href = '../admin/admin-profile.html';
                    } else {
                        window.location.href = '../user/user-profile.html';
                    }
                } else {
                    alert('Login failed: ' + data.message);
                }
            })
            .catch(error => {
                alert('Error during login. Please try again later.');
            });
    });

    document.getElementById('registerForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        fetch(`http://localhost:3000/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
            .then(response => {
                if (response.ok) {
                    showSuccessMessage('Registration successful');
                } else if (response.status === 400) {
                    showErrorMessage('Account already exists');
                } else {
                    throw new Error('Registration failed');
                }
            })
            .catch(error => {
                showErrorMessage('Registration failed due to an error');
            });
    });

    const userId = localStorage.getItem('userId');
    const logoutButton = document.createElement('a');
    logoutButton.href = '#';
    logoutButton.classList.add('btn', 'btn-warning', 'mr-2');
    logoutButton.id = 'logoutButton';
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', function (event) {
        event.preventDefault();
        localStorage.removeItem('userId');
        window.location.href = '../auth/auth.html?login';
    });

    if (userId) {
        document.querySelectorAll('.auth a[href*="login"], .auth a[href*="register"]').forEach(button => {
            button.style.display = 'none';
        });
        document.querySelector('.auth').appendChild(logoutButton);
    }
});
