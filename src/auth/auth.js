document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const modal = urlParams.get('modal');

    if (modal === 'login') {
        $('#loginModal').modal('show');
    } else if (modal === 'register') {
        $('#registerModal').modal('show');
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
                    showSuccessMessage('Login successful');
                    localStorage.setItem('userId', data.userId);
                    window.location.href = '../user/user-profile.html';
                } else if (data.message) {
                    showErrorMessage(data.message);
                } else {
                    throw new Error('Login failed');
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
                showErrorMessage('Login failed due to an error');
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
                console.error('Error during registration:', error);
                showErrorMessage('Registration failed due to an error');
            });
    });
});
