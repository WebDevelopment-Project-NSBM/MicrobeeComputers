document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 15;
    let currentPage = 1;
    let cartItems = [];

    const cartItemsContainer = document.getElementById('cartItems');
    const paginationContainer = document.getElementById('paginationContainer');
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

    function fetchCartItems() {
        showLoading();
        fetch(`http://localhost:3000/api/cart/items`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                cartItems = data;
                renderCartItems();
                renderPagination(cartItems.length, currentPage);
            })
            .catch(error => {
                console.error('Error fetching cart items:', error);
                cartItemsContainer.innerHTML = '<p>Error fetching cart items.</p>';
            })
            .finally(() => {
                hideLoading();
            });
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = cartItems.slice(start, end);

        paginatedItems.forEach(item => {
            const isLongName = item.name.length > 25;
            let displayName;
            if (item.name.length > 75) {
                displayName = `${item.name.substring(0, 25)}<br>${item.name.substring(25, 50)}<br>${item.name.substring(50, 75)}`;
            } else if (item.name.length > 50) {
                displayName = `${item.name.substring(0, 25)}<br>${item.name.substring(25, 50)}<br>${item.name.substring(50, 75)}`;
            } else if (item.name.length > 25) {
                displayName = `${item.name.substring(0, 25)}<br>${item.name.substring(25, 50)}`;
            } else {
                displayName = item.name;
            }

            const itemHTML = `
            <div class="w-full md:w-1/5 p-2 product-item">
                <div class="card bg-base-100 shadow-xl">
                    <figure><img src="${item.imageUrl}" alt="${item.name}" class="object-cover w-full h-48"></figure>
                    <div class="card-body text-center">
                        <h2 class="card-title ${isLongName ? 'long' : ''}">${displayName}</h2>
                        <p class="card-text">Price: Rs ${item.price.toLocaleString()}</p>
                        <p class="card-text">Quantity: ${item.quantity}</p>
                        <div class="flex justify-between w-full">
                            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.pro_id})">Remove</button>
                            <div class="flex">
                                <button class="btn btn-primary btn-sm mr-1" onclick="increaseQuantity(${item.pro_id})">+</button>
                                <button class="btn btn-primary btn-sm" onclick="decreaseQuantity(${item.pro_id})">-</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });

        if (cartItems.length > 0) {
            const checkoutButton = `
            <div class="w-full mt-4">
                <button class="btn btn-home btn-block text-white">Checkout</button>
            </div>
        `;
            cartItemsContainer.insertAdjacentHTML('beforeend', checkoutButton);
        }
        attachButtonPrimaryResetHandlers();
    }

    function renderPagination(totalItems, currentPage) {
        paginationContainer.innerHTML = '';

        if (totalItems === 0) {
            return;
        }

        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const prevButton = document.createElement('button');
        prevButton.classList.add('btn', 'btn-secondary', 'mr-2');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPage === 1 || totalItems === 0;
        prevButton.addEventListener('click', () => changePage(currentPage - 1));

        const nextButton = document.createElement('button');
        nextButton.classList.add('btn', 'btn-secondary', 'ml-2');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPage === totalPages || totalItems === 0;
        nextButton.addEventListener('click', () => changePage(currentPage + 1));

        paginationContainer.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.classList.add('btn', 'btn-light', 'mx-1');
            pageButton.textContent = i;
            pageButton.disabled = i === currentPage;
            pageButton.addEventListener('click', () => changePage(i));
            paginationContainer.appendChild(pageButton);
        }

        paginationContainer.appendChild(nextButton);
    }

    function changePage(page) {
        currentPage = page;
        renderCartItems();
        renderPagination(cartItems.length, currentPage);
    }

    fetchCartItems();

    window.removeFromCart = function (productId) {
        fetch(`http://localhost:3000/api/cart/remove/${productId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(`Product ${productId} removed from cart`);
                fetchCartItems();
            })
            .catch(error => {
                console.error('Error removing product from cart:', error);
            });
    };

    window.increaseQuantity = function (productId) {
        fetch(`http://localhost:3000/api/cart/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ operation: 'increase' }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(`Product ${productId} quantity increased`);
                fetchCartItems();
            })
            .catch(error => {
                console.error('Error increasing product quantity:', error);
            });
    };

    window.decreaseQuantity = function (productId) {
        fetch(`http://localhost:3000/api/cart/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ operation: 'decrease' }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(`Product ${productId} quantity decreased`);
                fetchCartItems();
            })
            .catch(error => {
                console.error('Error decreasing product quantity:', error);
            });
    };

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
        if (logoutAlert) {
            logoutAlert.classList.remove('hidden');
            setTimeout(() => {
                logoutAlert.classList.add('hidden');
            }, 3000);
        }
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
        userProfileDropdown.style.display = 'none';
        adminProfileDropdown.style.display = 'none';
    }

    attachButtonPrimaryResetHandlers();
    attachButtonDangerResetHandlers();

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

    function attachButtonDangerResetHandlers() {
        document.querySelectorAll('.btn-primary').forEach(button => {
            button.addEventListener('mousedown', function () {
                this.style.backgroundColor = '#A0A0A0';
                this.style.color = '#000000';
            });
            button.addEventListener('mouseup', function () {
                this.style.backgroundColor = '#ff5d48';
                this.style.color = '#000000';
            });
            button.addEventListener('mouseleave', function () {
                this.style.backgroundColor = '#ff5d48';
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
                    this.style.backgroundColor = '#ff5d48';
                    this.style.color = '#000000';
                }
            });
        });
    }
});
