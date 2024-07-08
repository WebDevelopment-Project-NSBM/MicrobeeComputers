document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPageUser = 9;
    const itemsPerPageProduct = 6;
    let currentPage = 1;
    let users = [];
    let products = [];
    let filteredProducts = [];
    let selectedCategory = '';

    const adminProfileContainer = document.getElementById('adminProfileContainer');
    const userListContainer = document.getElementById('userListContainer');
    const logoutButton = document.getElementById('logoutButton');
    const addProductForm = document.getElementById('addProductForm');
    const editProductForm = document.getElementById('editProductForm');
    const userPaginationContainer = document.getElementById('userPaginationContainer');
    const productPaginationContainer = document.getElementById('productPaginationContainer');
    const productListContainer = document.getElementById('productListContainer');
    const productCategoryFilter = document.getElementById('productCategoryFilter');
    const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    const addUserModal = new bootstrap.Modal(document.getElementById('addUserModal'));
    const userId = localStorage.getItem('userId');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const content = document.getElementById('content');

    if (!userId) {
        window.location.href = '../auth/auth.html?login';
        return;
    }

    function showLoading() {
        loadingSpinner.classList.add('active');
    }

    function hideLoading() {
        loadingSpinner.classList.remove('active');
        content.classList.add('show');
    }

    function fetchAdminProfile() {
        showLoading();
        fetch(`http://localhost:3000/api/user/profile?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                if (data.email && data.admin) {
                    renderAdminProfile(data);
                    fetchAllUsers();
                    fetchAllProducts();
                } else {
                    document.body.innerHTML = `
                        <div class="container mt-5 text-center">
                            <p>You do not have enough permissions to view this page.</p>
                            <button id="redirectToHome" class="btn btn-primary">Go to Home</button>
                        </div>
                    `;
                    document.getElementById('redirectToHome').addEventListener('click', () => {
                        window.location.href = '../structures/home.html';
                    });
                }
            })
            .catch(error => {
                hideLoading();
                console.error('Error fetching admin profile:', error);
                adminProfileContainer.innerHTML = '<p>Error fetching admin profile.</p>';
            });
    }

    function renderAdminProfile(admin) {
        const adminHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${admin.email || 'Admin Profile'}</h5>
                    <p class="card-text"><strong>Email:</strong> ${admin.email}</p>
                    <p class="card-text"><strong>Admin:</strong> ${admin.admin ? 'Yes' : 'No'}</p>
                    <p class="card-text"><strong>Member since:</strong> ${new Date(admin.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `;
        adminProfileContainer.innerHTML = adminHTML;
    }

    function fetchAllUsers() {
        fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
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

    function fetchAllProducts() {
        fetch('http://localhost:3000/api/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                products = data;
                filteredProducts = products;
                renderProductList();
                renderPagination(products.length, currentPage, 'product');
            })
            .catch(error => {
                console.error('Error fetching product list:', error);
                productListContainer.innerHTML = '<p>Error fetching product list.</p>';
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
                        <h5 class="card-title">${user.email}</h5>
                        <p class="card-text"><strong>Email:</strong> ${user.email}</p>
                        <p class="card-text"><strong>Admin:</strong> ${user.admin ? 'Yes' : 'No'}</p>
                        <p class="card-text"><strong>Member since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                        <button class="btn btn-warning" onclick="editUser('${user._id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteUser('${user._id}')">Delete</button>
                    </div>
                </div>
            `;
            userListContainer.insertAdjacentHTML('beforeend', userHTML);
        });
    }

    function renderProductList() {
        productListContainer.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPageProduct;
        const end = start + itemsPerPageProduct;
        const paginatedProducts = filteredProducts.slice(start, end);

        paginatedProducts.forEach(product => {
            const productHTML = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Product ID: ${product.pro_id}</h5>
                        <p class="card-text">${product.name}</p>
                        <p class="card-text"><strong>Price:</strong> ${product.price}</p>
                        <p class="card-text"><strong>Category:</strong> ${product.category}</p>
                        <p class="card-text"><strong>In Stock:</strong> ${product.inStock ? 'Yes' : 'No'}</p>
                        <button class="btn btn-warning" onclick="editProduct('${product._id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                    </div>
                </div>
            `;
            productListContainer.insertAdjacentHTML('beforeend', productHTML);
        });
    }

    function renderPagination(totalItems, currentPage, type) {
        const container = type === 'user' ? userPaginationContainer : productPaginationContainer;
        container.innerHTML = '';
        const totalPages = Math.ceil(totalItems / (type === 'user' ? itemsPerPageUser : itemsPerPageProduct));

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
        if (type === 'user') {
            renderUserList();
            renderPagination(users.length, currentPage, 'user');
        } else {
            renderProductList();
            renderPagination(filteredProducts.length, currentPage, 'product');
        }
    }

    function deleteUser(userId) {
        fetch(`http://localhost:3000/api/user/delete/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (response.ok) {
                    console.log(`User ${userId} deleted successfully`);
                    fetchAllUsers();
                } else {
                    throw new Error('Error deleting user');
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
            });
    }

    function deleteProduct(productId) {
        fetch(`http://localhost:3000/api/products/delete/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (response.ok) {
                    console.log(`Product ${productId} deleted successfully`);
                    fetchAllProducts();
                } else {
                    throw new Error('Error deleting product');
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
            });
    }

    function editProduct(productId) {
        const product = products.find(prod => prod._id === productId);
        if (product) {
            document.getElementById('editProductId').value = product._id;
            document.getElementById('editName').value = product.name;
            document.getElementById('editPrice').value = product.price;
            document.getElementById('editDiscountRate').value = product.discountRate;
            document.getElementById('editCategory').value = product.category;
            document.getElementById('editDescription').value = product.description;
            document.getElementById('editFeatures').value = product.features.join(', ');
            document.getElementById('editInStock').checked = product.inStock;
            document.getElementById('editLatest').value = product.latest.split('T')[0];
            document.getElementById('editPopularity').value = product.popularity;

            editProductModal.show();
        }
    }

    function editUser(userId) {
        const user = users.find(user => user._id === userId);
        if (user) {
            document.getElementById('editUserId').value = user._id;
            document.getElementById('editUserEmail').value = user.email;
            document.getElementById('editUserAdmin').checked = user.admin;
            editUserModal.show();
        }
    }

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
                    window.location.href = '../auth/auth.html?login';
                } else {
                    console.error('Error logging out:', data.message);
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
            });
    }

    async function handleAddProduct(event) {
        event.preventDefault();

        const newProId = await fetch('http://localhost:3000/api/products/highest-pro-id')
            .then(response => response.json())
            .then(data => data.highestProId + 1)
            .catch(error => {
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

        if (result.success) {
            alert('Product added successfully!');
            addProductForm.reset();
            fetchAllProducts();
        } else {
            alert('Error adding product: ' + result.message);
        }
    }

    async function handleEditProduct(event) {
        event.preventDefault();

        const formData = new FormData(editProductForm);
        const productId = formData.get('productId');
        formData.delete('productId');
        const features = formData.get('features') || '';
        formData.set('features', features.split(',').map(feature => feature.trim()).join(','));

        const response = await fetch(`http://localhost:3000/api/products/edit/${productId}`, {
            method: 'PUT',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert('Product updated successfully!');
            editProductModal.hide();
            fetchAllProducts(); // Refresh the product list
        } else {
            alert('Error updating product: ' + result.message);
        }
    }

    async function handleAddUser(event) {
        event.preventDefault();

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
            },
            body: JSON.stringify(user)
        });

        const result = await response.json();

        if (response.ok) {
            alert('User added successfully!');
            document.getElementById('addUserForm').reset();
            addUserModal.hide();
            fetchAllUsers();
        } else {
            alert('Error adding user: ' + result.message);
        }
    }

    async function handleEditUser(event) {
        event.preventDefault();

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
            },
            body: JSON.stringify(user)
        });

        const result = await response.json();

        if (result.success) {
            alert('User updated successfully!');
            editUserModal.hide();
            fetchAllUsers();
        } else {
            alert('Error updating user: ' + result.message);
        }
    }

    function filterProductsByCategory() {
        selectedCategory = productCategoryFilter.value;
        filteredProducts = selectedCategory ? products.filter(product => product.category === selectedCategory) : products;
        renderProductList();
        renderPagination(filteredProducts.length, currentPage, 'product');
    }

    logoutButton.addEventListener('click', handleLogout);
    addProductForm.addEventListener('submit', handleAddProduct);
    editProductForm.addEventListener('submit', handleEditProduct);
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('editUserForm').addEventListener('submit', handleEditUser);
    productCategoryFilter.addEventListener('change', filterProductsByCategory);

    fetchAdminProfile();

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

    window.deleteUser = deleteUser;
    window.deleteProduct = deleteProduct;
    window.editProduct = editProduct;
    window.editUser = editUser;
});
