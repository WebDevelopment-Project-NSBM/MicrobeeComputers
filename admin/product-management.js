document.addEventListener("DOMContentLoaded", function () {
    const productListContainer = document.getElementById('productListContainer');
    const productPaginationContainer = document.getElementById('productPaginationContainer');
    const editProductForm = document.getElementById('editProductForm');
    const productCategoryFilter = document.getElementById('productCategoryFilter');
    const editProductModalToggle = document.getElementById('editProductModal');
    const loadingBar = document.getElementById('loadingBar');
    const logoutButton = document.getElementById('logoutButton');
    const authToken = localStorage.getItem('authToken');
    const adminContent = document.getElementById('adminContent');
    const manageProductsSection = document.getElementById('manageProductsSection');
    let products = [];
    let filteredProducts = [];
    let currentPage = 1;
    const itemsPerPageProduct = 12;
    let selectedCategory = '';

    if (!authToken) {
        window.location.href = '../auth/login.html';
        return;
    }

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
                hideLoadingBar();
                if (data.email) {
                    if (data.admin) {
                        manageProductsSection.classList.remove('hidden');
                    } else {
                        showAlert('You are not an admin user');
                        adminContent.innerHTML = `
                            <div class="container mx-auto text-center mt-5">
                                <h1 class="text-3xl font-bold mb-4">You are not an admin user</h1>
                                <a href="../structures/home.html" class="btn btn-primary">Home</a>
                            </div>
                        `;
                        productListContainer.innerHTML = '';
                    }
                } else {
                    showAlert('Error fetching user profile.');
                }
            })
            .catch(error => {
                hideLoadingBar();
                console.error('Error fetching user profile:', error);
                showAlert('Error fetching user profile.');
            });
    }

    fetchUserProfile();

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

    async function fetchAllProducts() {
        try {
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            products = await response.json();
            filteredProducts = products;
            renderProductList();
            renderPagination(products.length, currentPage);
        } catch (error) {
            console.error('Error fetching product list:', error);
            productListContainer.innerHTML = '<p>Error fetching product list.</p>';
        }
    }

    function renderProductList() {
        productListContainer.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPageProduct;
        const end = start + itemsPerPageProduct;
        const paginatedProducts = filteredProducts.slice(start, end);

        paginatedProducts.forEach(product => {
            const isLongName = product.name.length > 75;
            let displayName;
            if (product.name.length > 75) {
                displayName = `${product.name.substring(0, 25)}<br>${product.name.substring(25, 50)}<br>${product.name.substring(50, 75)}`;
            } else if (product.name.length > 50) {
                displayName = `${product.name.substring(0, 25)}<br>${product.name.substring(25, 50)}<br>${product.name.substring(50, 75)}`;
            } else if (product.name.length > 25) {
                displayName = `${product.name.substring(0, 25)}<br>${product.name.substring(25, 50)}`;
            } else {
                displayName = product.name;
            }

            const productHTML = `
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="text-center text-2xl font-bold mb-6">${product.pro_id}</h2>
                    <p class="${isLongName ? 'long' : ''}"><strong>Name:</strong> ${displayName}</p>
                    <p><strong>Price:</strong> ${product.price}</p>
                    <p><strong>Category:</strong> ${product.category}</p>
                    <p><strong>In Stock:</strong> ${product.inStock ? 'Yes' : 'No'}</p>
                    <div class="card-actions justify-end">
                        <button class="btn btn-warning" onclick="editProduct('${product._id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
            productListContainer.insertAdjacentHTML('beforeend', productHTML);
        });
    }

    function renderPagination(totalItems, currentPage) {
        const container = productPaginationContainer;
        container.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPageProduct);

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
        container.style.justifyContent = 'center';
    }

    function changePage(page) {
        currentPage = page;
        renderProductList();
        renderPagination(filteredProducts.length, currentPage);
    }

    async function deleteProduct(productId) {
        showLoadingBar();

        const requestingUser = await fetch(`http://localhost:3000/api/user/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }).then(async response => {
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
        });

        if (!requestingUser || !requestingUser.admin) {
            hideLoadingBar();
            showAlert('Only admin users can delete products');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/products/delete/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                showAlert('Product deleted successfully!');
                fetchAllProducts();
            } else {
                throw new Error('Error deleting product');
            }
        } catch (error) {
            showAlert('Error deleting product');
        }

        hideLoadingBar();
    }

    function editProduct(productId) {
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
            .then(requestingUser => {
                if (!requestingUser || !requestingUser.admin) {
                    hideLoadingBar();
                    showAlert('Only admin users can edit products');
                    return;
                }

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

                    editProductModalToggle.checked = true;
                }

                hideLoadingBar();
            });
    }

    async function handleEditProduct(event) {
        event.preventDefault();
        showLoadingBar();

        const formData = new FormData(editProductForm);
        const productId = formData.get('productId');
        formData.delete('productId');
        const features = formData.get('features') || '';
        formData.set('features', features.split(',').map(feature => feature.trim()).join(','));

        const requestingUser = await fetch(`http://localhost:3000/api/user/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }).then(async response => {
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
        });

        if (!requestingUser || !requestingUser.admin) {
            hideLoadingBar();
            showAlert('Only admin users can edit products');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/products/edit/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Product updated successfully!');
                editProductModalToggle.checked = false;
                fetchAllProducts();
            } else {
                showAlert('Error updating product: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }

        hideLoadingBar();
    }

    function filterProductsByCategory() {
        selectedCategory = productCategoryFilter.value;
        filteredProducts = selectedCategory ? products.filter(product => product.category === selectedCategory) : products;
        renderProductList();
        renderPagination(filteredProducts.length, currentPage);
    }

    editProductForm.addEventListener('submit', handleEditProduct);
    productCategoryFilter.addEventListener('change', filterProductsByCategory);

    fetchAllProducts();

    window.deleteProduct = deleteProduct;
    window.editProduct = editProduct;

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

    window.addEventListener('load', function () {
        hideLoadingBar();
    });
});
