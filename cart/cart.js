document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 15;
    let currentPage = 1;
    let cartItems = [];

    const cartItemsContainer = document.getElementById('cartItems');
    const paginationContainer = document.getElementById('paginationContainer');
    const loadingBar = document.getElementById('loadingBar');
    const content = document.getElementById('content');
    const logoutAlert = document.getElementById('logoutAlert');
    const authToken = localStorage.getItem('authToken');
    const searchInput = document.querySelector('.ser-col');
    const searchButton = document.querySelector('.fa-search');
    const searchDropdown = document.getElementById('searchDropdown');

    if (!authToken) {
        showLoginAlert();
        console.error('User not logged in');
        return;
    }

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

    function performSearch(query) {
        if (!query) {
            console.log('No query provided, hiding dropdown');
            searchDropdown.classList.add('hidden');
            return;
        }

        fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    searchDropdown.innerHTML = "<p class='px-4 py-2 text-gray-500'>No products found.</p>";
                } else {
                    renderSearchDropdown(data);
                }
                searchDropdown.classList.remove('hidden');
                console.log('Dropdown populated and displayed');
            })
            .catch(error => {
                console.error('Error during search:', error);
                searchDropdown.classList.add('hidden');
            });
    }

    function renderSearchDropdown(products) {
        searchDropdown.innerHTML = products.slice(0, 50).map(product => `
            <div class="px-4 py-2 cursor-pointer hover:bg-gray-100" onclick="redirectToProductPage(${product.pro_id})">
                <p class="text-black font-semibold">${product.name}</p>
                <p class="text-gray-500">Rs: ${product.price.toLocaleString()}</p>
            </div>
        `).join('');
        searchDropdown.classList.remove('hidden');
    }

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        performSearch(query);
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        performSearch(query);
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchDropdown.classList.add('hidden');
        }, 150);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            performSearch(query);
            searchDropdown.classList.add('hidden');
        }
    });

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

    function fetchCartItems() {
        showLoading();
        fetch(`http://localhost:3000/api/cart/items`, {
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
                if (Array.isArray(data)) {
                    cartItems = data;
                    renderCartItems();
                    renderPagination(cartItems.length, currentPage);
                } else {
                    throw new Error('Invalid data format');
                }
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
        if (!authToken) {
            showAlert('Please log in to remove items from your cart.');
            return;
        }

        fetch(`http://localhost:3000/api/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(async response => {
                if (response.status === 401 || response.status === 403) {
                    const data = await response.json();
                    if (data.error === 'TokenExpired' || response.status === 403) {
                        handleTokenExpiration();
                        return;
                    } else {
                        throw new Error('Unauthorized access');
                    }
                } else if (!response.ok) {
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
        if (!authToken) {
            showAlert('Please log in to update the quantity in your cart.');
            return;
        }

        fetch(`http://localhost:3000/api/cart/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ operation: 'increase' }),
        })
            .then(async response => {
                if (response.status === 401 || response.status === 403) {
                    const data = await response.json();
                    if (data.error === 'TokenExpired' || response.status === 403) {
                        handleTokenExpiration();
                        return;
                    } else {
                        throw new Error('Unauthorized access');
                    }
                } else if (!response.ok) {
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
        if (!authToken) {
            showAlert('Please log in to update the quantity in your cart.');
            return;
        }

        fetch(`http://localhost:3000/api/cart/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ operation: 'decrease' }),
        })
            .then(async response => {
                if (response.status === 401 || response.status === 403) {
                    const data = await response.json();
                    if (data.error === 'TokenExpired' || response.status === 403) {
                        handleTokenExpiration();
                        return;
                    } else {
                        throw new Error('Unauthorized access');
                    }
                } else if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(`Product ${productId} quantity decreased`);
                fetchCartItems();
            })
            .catch(error => {
                console.error('Error decreasing product quantity:', error);
            });
    };

    function handleCheckout() {
        if (!authToken) {
            showAlert('Please log in to proceed with checkout.');
            return;
        }

        fetch(`http://localhost:3000/api/user/details`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(async response => {
                if (response.status === 401 || response.status === 403) {
                    const data = await response.json();
                    if (data.error === 'TokenExpired' || response.status === 403) {
                        handleTokenExpiration();
                        return;
                    } else {
                        throw new Error('Unauthorized access');
                    }
                } else if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.orderStatus === 1) {
                    displayOrderConfirmation(data.userId);
                } else {
                    processCheckout();
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
            });
    }

    function displayOrderConfirmation(userId) {
        cartItemsContainer.innerHTML = `
        <div class="card mb-3 mx-auto max-w-md">
                <div class="card-body">
                    <h5 class="text-center text-xl font-bold mb-4">Order Information</h5>
                    <p class="card-text mb-4"><strong>Your Order ID:</strong> ${userId}</p>
                    <p class="card-text mb-4 text-yellow-600"><strong>Status:</strong> Your order is pending. Please complete your purchase by contacting us.</p>
                    <p class="card-text mb-2"><strong>Email:</strong> <a href="mailto:sales@microbeecomputers.lk" class="text-blue-600">sales@microbeecomputers.lk</a></p>
                    <p class="card-text mb-2"><strong>Address:</strong></p>
                    <ul class="list-disc pl-5 mb-4">
                        <li>Dehiwala Showroom: 110A, Galle Road, Dehiwala.</li>
                        <li>Colombo 3 Showroom: 37, School Lane (Facing Duplication Road), Colombo 03.</li>
                    </ul>
                    <p class="card-text"><strong>Phone:</strong> <a href="tel:07777292272" class="text-blue-600">07777 292 272</a></p>
                    <button class="btn btn-home btn-block text-white mt-4" onclick="window.location.href = '../home.html'">Continue Shopping</button>
                </div>
            </div>
    `;
    }

    function processCheckout() {
        fetch(`http://localhost:3000/api/cart/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
        })
            .then(async response => {
                if (response.status === 401 || response.status === 403) {
                    const data = await response.json();
                    if (data.error === 'TokenExpired' || response.status === 403) {
                        handleTokenExpiration();
                        return;
                    } else {
                        throw new Error('Unauthorized access');
                    }
                } else if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    displayOrderConfirmation(data.userId);
                } else {
                    showAlert('There was an issue processing your order. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error during checkout:', error);
            });
    }

    window.addEventListener('click', function (event) {
        if (event.target.matches('.btn-home')) {
            handleCheckout();
        }
    });

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
        if (logoutAlert) {
            logoutAlert.classList.remove('hidden');
            setTimeout(() => {
                logoutAlert.classList.add('hidden');
            }, 3000);
        }
    }

    function showLoginAlert() {
        const loginAlert = document.getElementById('loginAlert');
        loginAlert.classList.remove('hidden');
        loginAlert.classList.add('show');
        setTimeout(() => {
            loginAlert.classList.remove('show');
            loginAlert.classList.add('hidden');
            window.location.href = '../auth/login.html';
        }, 2000);
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
        document.querySelectorAll('.btn-danger').forEach(button => {
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

    const categories = ['casing', 'coolers', 'cpu', 'gpu', 'monitor', 'motherboards', 'powersupply', 'ram', 'storage', 'ups'];
    const sidePanel = document.getElementById('sidePanel');
    const menuToggle = document.getElementById('menuToggle');
    const closePanel = document.getElementById('closePanel');
    const categoryList = document.getElementById('categoryList');

    sidePanel.style.overflowY = 'auto';

    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = "side-panel-li";
        li.innerHTML = `<a href="../products/${category}.html" class="side-panel-a">${category}</a>`;
        categoryList.appendChild(li);
    });

    menuToggle.addEventListener('click', function () {
        sidePanel.classList.remove('-translate-x-full');
    });

    closePanel.addEventListener('click', function () {
        sidePanel.classList.add('-translate-x-full');
    });
});

function redirectToProductPage(productId) {
    window.location.href = `../products/products_info/product-info.html?pro_id=${productId}`;
}