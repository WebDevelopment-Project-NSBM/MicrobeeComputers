document.addEventListener("DOMContentLoaded", function () {
    const userProfileContainer = document.getElementById('userProfileContainer');
    const logoutButton = document.getElementById('logoutButton');
    const authToken = localStorage.getItem('authToken');
    const loadingBar = document.getElementById('loadingBar');
    const userListContainer = document.getElementById('userListContainer');
    const userPaginationContainer = document.getElementById('userPaginationContainer');
    const adminContent = document.getElementById('adminContent');
    const searchInput = document.querySelector('.ser-col');
    const searchButton = document.querySelector('.fa-search');
    const searchDropdown = document.getElementById('searchDropdown');
    const searchUserButton = document.getElementById('searchUserButton');
    const searchUserIdInput = document.getElementById('searchUserId');

    const itemsPerPageUser = 9;
    let currentPage = 1;
    let users = [];

    if (!authToken) {
        window.location.href = '../auth/login.php';
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
            window.location.href = '../auth/login.php';
        }, 1000);
    }

    function handleTokenExpiration() {
        localStorage.removeItem('authToken');
        showLogoutMessage('Your session has expired. Please log in again.');
    }

    function performUserIdSearch(userId) {
        if (!userId) {
            console.log('No User ID provided, returning full list.');
            renderUserList(users);
            return;
        }

        const matchedUser = users.find(user => user.userId === parseInt(userId));

        if (matchedUser) {
            renderUserList([matchedUser]);
        } else {
            userListContainer.innerHTML = "<p class='px-4 py-2 text-gray-500'>No users found with the given User ID.</p>";
        }
    }

    function renderUserList(usersToRender) {
        userListContainer.innerHTML = '';

        usersToRender.forEach(user => {
            const userHTML = `
        <div class="card mb-3 mx-auto max-w-md w-full">
            <div class="card-body">
                <h5 class="text-center text-xl font-bold mb-4">${user.email}</h5>
                <p class="card-text mb-4"><strong>Email:</strong> ${user.email}</p>
                <p class="card-text mb-4"><strong>Admin:</strong> ${user.admin ? 'Yes' : 'No'}</p>
                <p class="card-text mb-4"><strong>Member since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                ${user.orderStatus === 1 ? `
                <p class="card-text mb-4 text-yellow-600"><strong>Status:</strong> Order pending</p>
                <button class="btn btn-primary mr-2" onclick="viewUserCart(${user.userId})">View Cart</button>
                <button class="btn btn-success" onclick="completeOrder(${user.userId})">Complete Order</button>
                ` : ''}
            </div>
        </div>
    `;
            userListContainer.insertAdjacentHTML('beforeend', userHTML);
        });
    }

    function performSearch(query) {
        if (!query) {
            console.log('No query provided, hiding dropdown');
            searchDropdown.classList.add('hidden');
            return;
        }

        fetch(`https://microbeecomputers.lk/api/search?query=${encodeURIComponent(query)}`)
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

    function handleLogout() {
        fetch(`https://microbeecomputers.lk/api/logout`, {
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

    function fetchUserProfile() {
        showLoadingBar();
        fetch(`https://microbeecomputers.lk/api/user/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(async response => {
                hideLoadingBar();
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
                if (data && data.email) {
                    if (!data.admin) {
                        showAlert('You are not an admin user');
                        adminContent.innerHTML = `
                <div class="container mx-auto text-center mt-5">
                    <h1 class="text-3xl font-bold mb-4">You are not an admin user</h1>
                    <a href="../home.php" class="btn btn-primary">Home</a>
                </div>
            `;
                        return;
                    }
                    renderUserProfile(data);
                } else if (userProfileContainer) {
                    userProfileContainer.innerHTML = '<p>Error fetching user profile.</p>';
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

    function renderUserProfile(user) {
        if (!userProfileContainer) return;

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

    function fetchAllUsers() {
        fetch('https://microbeecomputers.lk/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(async response => {
                if (response.status === 401 || response.status === 403) {
                    const data = await response.json();
                    if (data.error === 'TokenExpired' || response.status === 403) {
                        handleTokenExpiration();
                    } else {
                        throw new Error('Unauthorized access');
                    }
                } else if (!response.ok) {
                    throw new Error('Error fetching user list');
                }
                return response.json();
            })
            .then(data => {
                users = data.filter(user => user.orderStatus === 1) || [];
                renderUserList(users);
                renderPagination(users.length, currentPage);
            })
            .catch(error => {
                console.error('Error fetching user list:', error);
                userListContainer.innerHTML = '<p>Error fetching user list.</p>';
            });
    }

    function renderUserList(usersToRender = []) {
        userListContainer.innerHTML = '';

        if (usersToRender.length === 0) {
            userListContainer.innerHTML = "<p class='px-4 py-2 text-gray-500'>No Pending Orders found.</p>";
            return;
        }

        usersToRender.forEach(user => {
            const userHTML = `
        <div class="card mb-3 mx-auto max-w-md w-full">
            <div class="card-body">
                <h5 class="text-center text-xl font-bold mb-4">${user.email}</h5>
                <p class="card-text mb-4"><strong>Email:</strong> ${user.email}</p>
                <p class="card-text mb-4"><strong>Admin:</strong> ${user.admin ? 'Yes' : 'No'}</p>
                <p class="card-text mb-4"><strong>Member since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                ${user.orderStatus === 1 ? `
                <p class="card-text mb-4 text-yellow-600"><strong>Status:</strong> Order pending</p>
                <button class="btn btn-primary mr-2" onclick="viewUserCart(${user.userId})">View Cart</button>
                <button class="btn btn-danger mr-2" onclick="completeOrder(${user.userId})">Complete Order</button>
                ` : ''}
            </div>
        </div>
    `;
            userListContainer.insertAdjacentHTML('beforeend', userHTML);
        });
    }

    function completeOrder(userId) {
        fetch(`https://microbeecomputers.lk/api/order/complete/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Order completed successfully!');
                    renderUserList();
                } else {
                    showAlert('Error completing order: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error completing order:', error);
                showAlert('An error occurred while completing the order.');
            });
    }

    function viewUserCart(userId) {
        console.log("View Cart clicked for user:", userId);
        showLoadingBar();
        fetch(`https://microbeecomputers.lk/api/orderCart/items/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => response.json())
            .then(data => {
                hideLoadingBar();
                if (data.length > 0) {
                    renderCartItems(data);
                    openModal();
                } else {
                    console.error('Failed to load cart items.');
                }
            })
            .catch(error => {
                hideLoadingBar();
                console.error('Error fetching cart items:', error);
            });
    }

    function renderCartItems(cartItems) {
        console.log("Rendering cart items", cartItems);
        const cartItemsContainer = document.getElementById('cartItemsContainer');
        cartItemsContainer.innerHTML = '';

        cartItems.forEach(item => {
            const itemHTML = `
            <div class="cart-item">
                <p><strong>Name:</strong> ${item.name}</p>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Price:</strong> $${item.price.toFixed(2)}</p>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
            </div>
            <hr>
        `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    function openModal() {
        const modal = document.getElementById('cartCustomModal');
        modal.classList.remove('custom-hidden');
        console.log("Modal class list after opening:", modal.classList);
    }

    function closeModal() {
        const modal = document.getElementById('cartCustomModal');
        modal.classList.add('custom-hidden');
    }


    function renderPagination(totalItems, currentPage) {
        const container = userPaginationContainer;
        container.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPageUser);

        const prevButton = document.createElement('button');
        prevButton.classList.add('btn', 'btn-secondary', 'mr-2');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => changePage(currentPage - 1));

        const nextButton = document.createElement('button');
        nextButton.classList.add('btn', 'btn-secondary', 'ml-2');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => changePage(currentPage + 1));

        container.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.classList.add('btn', 'btn-light', 'mx-1');
            pageButton.textContent = i;
            pageButton.disabled = i === currentPage;
            pageButton.addEventListener('click', () => changePage(i));
            container.appendChild(pageButton);
        }

        container.appendChild(nextButton);
    }

    function changePage(page) {
        currentPage = page;
        renderUserList();
        renderPagination(users.length, currentPage);
    }

    logoutButton.addEventListener('click', handleLogout);
    fetchUserProfile();
    fetchAllUsers();

    if (authToken) {
        document.querySelectorAll('.auth a[href*="login"], .auth a[href*="register"]').forEach(button => {
            button.style.display = 'none';
        });

        fetch(`https://microbeecomputers.lk/api/user/details`, {
            method: 'GET',
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
            localStorage.removeItem('authToken');
            showLogoutMessage('Logout successful!');
        });
    } else {
        document.querySelector('.avatar.placeholder').style.display = 'none';
        document.getElementById('user-profile-dropdown').style.display = 'none';
        document.getElementById('admin-profile-dropdown').style.display = 'none';
    }

    function initializeSidePanel() {
        const categories = ['casing', 'coolers', 'cpu', 'gpu', 'monitor', 'motherboards', 'powersupply', 'ram', 'storage', 'ups'];
        const sidePanel = document.getElementById('sidePanel');
        const menuToggle = document.getElementById('menuToggle');
        const closePanel = document.getElementById('closePanel');
        const categoryList = document.getElementById('categoryList');

        sidePanel.style.overflowY = 'auto';

        categoryList.innerHTML = '';

        categories.forEach(category => {
            const li = document.createElement('li');
            li.className = "side-panel-li";
            li.innerHTML = `<a href="../products/${category}.php" class="side-panel-a">${category}</a>`;
            categoryList.appendChild(li);
        });

        menuToggle.addEventListener('click', function () {
            sidePanel.classList.remove('-translate-x-full');
        });

        closePanel.addEventListener('click', function () {
            sidePanel.classList.add('-translate-x-full');
        });
    }

    initializeSidePanel();
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

    window.viewUserCart = viewUserCart;
    window.completeOrder = completeOrder;

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

    document.getElementById('closeCustomModal').addEventListener('click', closeModal);

    window.addEventListener('click', function (event) {
        const modal = document.getElementById('cartCustomModal');
        if (event.target === modal) {
            modal.classList.add('custom-hidden');
        }
    });

    searchUserButton.addEventListener('click', () => {
        const userId = searchUserIdInput.value.trim();
        performUserIdSearch(userId);
    });

    searchUserIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const userId = searchUserIdInput.value.trim();
            performUserIdSearch(userId);
        }
    });
});

function redirectToProductPage(productId) {
    window.location.href = `../products/products_info/product-info.php?pro_id=${productId}`;
}

function viewUserProfile(userId) {
    window.location.href = `../admin/user-profile.php?userId=${userId}`;
}
