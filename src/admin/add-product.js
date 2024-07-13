document.addEventListener("DOMContentLoaded", function () {
    const addProductForm = document.getElementById('addProductForm');
    const loadingBar = document.getElementById('loadingBar');
    const logoutButton = document.getElementById('logoutButton');
    const userId = localStorage.getItem('userId');
    const adminContent = document.getElementById('adminContent');
    const userProfileContainer = document.getElementById('userProfileContainer');
    const productAddedAlert = document.getElementById('productAdded');

    showLoadingBar();

    function showLoadingBar() {
        if (loadingBar) {
            loadingBar.style.width = '100%';
            loadingBar.style.display = 'block';
        }
    }

    function hideLoadingBar() {
        if (loadingBar) {
            setTimeout(() => {
                loadingBar.classList.add('hidden');
                loadingBar.style.display = 'none';
            }, 100);
        }
    }

    function showAlert(message) {
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
        showAlert(message);
        setTimeout(() => {
            window.location.href = '../auth/login.html';
        }, 1000);
    }

    function showProductAddedAlert() {
        console.log("Showing product added alert");
        if (productAddedAlert) {
            productAddedAlert.classList.remove('hidden');
            setTimeout(() => {
                productAddedAlert.classList.add('hidden');
            }, 3000);
        }
    }

    async function handleAddProduct(event) {
        event.preventDefault();
        showLoadingBar();

        const requestingUserId = localStorage.getItem('userId');
        const requestingUser = await fetch(`http://localhost:3000/api/user/profile?userId=${requestingUserId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            if (!response.ok) {
                hideLoadingBar();
                showAlert('User not found');
                return;
            }
            return response.json();
        });

        if (!requestingUser.admin) {
            hideLoadingBar();
            showAlert('Only admin users can add new products');
            return;
        }

        const newProId = await fetch('http://localhost:3000/api/products/highest-pro-id')
            .then(response => response.json())
            .then(data => data.highestProId + 1)
            .catch(error => {
                hideLoadingBar();
                console.error('Error fetching highest pro_id:', error);
                return 1;
            });

        const formData = new FormData(addProductForm);
        formData.append('pro_id', newProId);
        const features = formData.get('features') || '';
        formData.set('features', features.split(',').map(feature => feature.trim()).join(','));

        const response = await fetch('http://localhost:3000/api/products/add', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        hideLoadingBar();

        alert(result);

        if (result.success) {
            showProductAddedAlert();
            addProductForm.reset();
        } else {
            showAlert('Error adding product: ' + result.message);
        }
    }

    addProductForm.addEventListener('submit', handleAddProduct);

    function attachButtonPrimaryResetHandlers() {
        document.querySelectorAll('.btn-primary').forEach(button => {
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

    function fetchUserProfile() {
        showLoadingBar();
        fetch(`http://localhost:3000/api/user/profile?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                hideLoadingBar();
                if (data.email) {
                    if (!data.admin) {
                        showAlert('You are not an admin user');
                        adminContent.innerHTML = `
                            <div class="container mx-auto text-center mt-5">
                                <h1 class="text-3xl font-bold mb-4">You are not an admin user</h1>
                                <a href="../structures/home.html" class="btn btn-primary">Home</a>
                            </div>
                        `;
                        return;
                    }
                } else {
                    if (userProfileContainer) {
                        userProfileContainer.innerHTML = '<p>Error fetching user profile.</p>';
                    }
                }
            })
            .catch(error => {
                hideLoadingBar();
                console.error('Error fetching user profile:', error);
                if (userProfileContainer) {
                    userProfileContainer.innerHTML = '<p>Error fetching user profile.</p>';
                }
            });
    }

    fetchUserProfile();

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

                    const currentPath = window.location.pathname.split('/').pop();
                    document.querySelectorAll('.auth a').forEach(button => {
                        const href = button.getAttribute('href').split('/').pop();
                        if (href === currentPath) {
                            button.style.display = 'none';
                        }
                    });
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

    attachButtonPrimaryResetHandlers();

    window.addEventListener('load', function () {
        hideLoadingBar();
    });
});
