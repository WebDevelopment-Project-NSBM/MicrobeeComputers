document.addEventListener("DOMContentLoaded", function () {
    const userProfileContainer = document.getElementById('userProfileContainer');
    const logoutButton = document.getElementById('logoutButton');
    const authToken = localStorage.getItem('authToken');
    const loadingBar = document.getElementById('loadingBar');
    const userListContainer = document.getElementById('userListContainer');
    const userPaginationContainer = document.getElementById('userPaginationContainer');
    const editUserModal = document.getElementById('editUserModal');
    const addUserModal = document.getElementById('addUserModal');
    const adminContent = document.getElementById('adminContent');
    const searchInput = document.querySelector('.ser-col');
    const searchButton = document.querySelector('.fa-search');
    const searchDropdown = document.getElementById('searchDropdown');

    const itemsPerPageUser = 9;
    let currentPage = 1;
    let users = [];

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
            window.location.href = '../auth/login.html';
        }, 1000);
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

    function handleTokenExpiration() {
        localStorage.removeItem('authToken');
        showLogoutMessage('Your session has expired. Please log in again.');
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
                            <a href="../home.html" class="btn btn-primary">Home</a>
                        </div>
                    `;
                        return;
                    }
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

    function fetchAllUsers() {
        fetch('http://localhost:3000/api/users', {
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
                users = data;
                renderUserList();
                renderPagination(users.length, currentPage, 'user');
            })
            .catch(error => {
                console.error('Error fetching user list:', error);
                userListContainer.innerHTML = '<p>Error fetching user list.</p>';
            });
    }

    function renderUserList() {
        userListContainer.innerHTML = '';

        const start = (currentPage - 1) * itemsPerPageUser;
        const end = start + itemsPerPageUser;
        const paginatedUsers = users.slice(start, end);

        paginatedUsers.forEach(user => {
            const userHTML = `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="text-center text-2xl font-bold mb-6">${user.email || 'User Profile'}</h5>
                    <p class="card-text"><strong>Email:</strong> ${user.email}</p>
                    <p class="card-text"><strong>Admin:</strong> ${user.admin ? 'Yes' : 'No'}</p>
                    <p class="card-text"><strong>Member since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                    <button class="btn btn-primary" onclick="editUser('${user._id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteUser('${user._id}')">Delete</button>
                </div>
            </div>
        `;
            userListContainer.insertAdjacentHTML('beforeend', userHTML);
        });
    }

    function renderPagination(totalItems, currentPage, type) {
        const container = userPaginationContainer;
        container.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPageUser);

        const prevButton = document.createElement('button');
        prevButton.classList.add('btn', 'btn-secondary', 'mr-2');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => changePage(currentPage - 1, type));

        const nextButton = document.createElement('button');
        nextButton.classList.add('btn', 'btn-secondary', 'ml-2');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => changePage(currentPage + 1, type));

        container.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.classList.add('btn', 'btn-light', 'mx-1');
            pageButton.textContent = i;
            pageButton.disabled = i === currentPage;
            pageButton.addEventListener('click', () => changePage(i, type));
            container.appendChild(pageButton);
        }

        container.appendChild(nextButton);
    }

    function changePage(page, type) {
        currentPage = page;
        renderUserList();
        renderPagination(users.length, currentPage, 'user');
    }

    async function deleteUser(userId) {
        try {
            const requestingUser = await fetch(`http://localhost:3000/api/user/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error('User not found');
                }
                return response.json();
            });

            if (!requestingUser.admin) {
                showAlert('Only admin users can delete users');
                return;
            }

            const response = await fetch(`http://localhost:3000/api/user/delete/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                showAlert(`User ${userId} deleted successfully`);
                fetchAllUsers();
            } else {
                const result = await response.json();
                throw new Error(result.message || 'Error deleting user');
            }
        } catch (error) {
            showAlert('Error: ' + error.message);
            console.error('Error deleting user:', error);
        }
    }

    async function editUser(userId) {
        try {
            const user = users.find(user => user._id === userId);
            if (user) {
                document.getElementById('editUserId').value = user._id;
                document.getElementById('editUserEmail').value = user.email;
                document.getElementById('editUserAdmin').checked = user.admin;
                editUserModal.showModal();
            }
        } catch (error) {
            showAlert('Error: ' + error.message);
            console.error('Error editing user:', error);
        }
    }

    async function handleAddUser(event) {
        event.preventDefault();

        try {
            const requestingUser = await fetch(`http://localhost:3000/api/user/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error('User not found');
                }
                return response.json();
            });

            if (!requestingUser.admin) {
                showAlert('Only admin users can register new users');
                return;
            }

            const formData = new FormData(document.getElementById('addUserForm'));
            const user = {
                email: formData.get('email'),
                password: formData.get('password'),
                admin: formData.get('admin') === 'on'
            };

            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(user)
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('User added successfully!');
                document.getElementById('addUserForm').reset();
                addUserModal.close();
                fetchAllUsers();
            } else {
                showAlert('Error adding user: ' + result.message);
            }
        } catch (error) {
            showAlert('Error: ' + error.message);
        }
    }

    async function handleEditUser(event) {
        event.preventDefault();

        try {
            const requestingUser = await fetch(`http://localhost:3000/api/user/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error('User not found');
                }
                return response.json();
            });

            if (!requestingUser.admin) {
                showAlert('Only admin users can edit users');
                return;
            }

            const formData = new FormData(document.getElementById('editUserForm'));
            const userId = formData.get('userId');
            const user = {
                email: formData.get('email'),
                admin: formData.get('admin') === 'on'
            };

            const response = await fetch(`http://localhost:3000/api/user/edit/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(user)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('User updated successfully!');
                editUserModal.close();
                fetchAllUsers();
            } else {
                showAlert('Error updating user: ' + result.message);
            }
        } catch (error) {
            showAlert('Error: ' + error.message);
        }
    }

    fetchUserProfile();
    fetchAllUsers();

    if (authToken) {
        document.querySelectorAll('.auth a[href*="login"], .auth a[href*="register"]').forEach(button => {
            button.style.display = 'none';
        });

        fetch(`http://localhost:3000/api/user/details`, {
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

    window.deleteUser = deleteUser;
    window.editUser = editUser;

    logoutButton.addEventListener('click', handleLogout);
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('editUserForm').addEventListener('submit', handleEditUser);

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
});

function redirectToProductPage(productId) {
    window.location.href = `../products/products_info/product-info.html?pro_id=${productId}`;
}