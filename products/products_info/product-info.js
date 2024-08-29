document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('pro_id'));
    const loadingBar = document.getElementById('loadingBar');
    const productDetailsContainer = document.getElementById('productDetails');
    const logoutAlert = document.getElementById('logoutAlert');
    const cartAlert = document.getElementById('cartAlert');
    const authToken = localStorage.getItem('authToken');
    const searchInput = document.querySelector('.ser-col');
    const searchButton = document.querySelector('.fa-search');
    const searchDropdown = document.getElementById('searchDropdown');

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
    }

    showLoading();

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
            window.location.href = '../../auth/login.html';
        }, 1000);
    }

    function handleTokenExpiration() {
        localStorage.removeItem('authToken');
        showLogoutMessage('Your session has expired. Please log in again.');
    }

    fetchProducts()
        .then(products => {
            const product = products.find(p => p.pro_id === productId);
            if (product) {
                renderProductDetails(product);
            } else {
                productDetailsContainer.innerHTML = '<p>Product not found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            productDetailsContainer.innerHTML = '<p>Error fetching product details.</p>';
        })
        .finally(() => {
            hideLoading();
        });

    if (authToken) {
        document.querySelectorAll('.auth a[href*="login"], .auth a[href*="register"]').forEach(button => {
            button.style.display = 'none';
        });

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
                const avatar = document.querySelector('.avatar.placeholder');

                if (email) {
                    const firstLetter = email.charAt(0).toUpperCase();
                    avatar.querySelector('span').textContent = firstLetter;
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

        document.getElementById('logoutButton').addEventListener('click', handleLogout);
    } else {
        document.querySelector('.avatar.placeholder').style.display = 'none';
    }

    function fetchProducts() {
        return fetch(`http://localhost:3000/api/products`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                throw error;
            });
    }

    function renderProductDetails(product) {
        const discountPrice = product.price - (product.discountRate / 100 * product.price);
        const originalPrice = product.price;

        const productHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <img src="../${product.imageUrl}" class="w-500 h-500 object-cover" alt="${product.name}">
                </div>
                <div>
                    <h2 class="text-2xl font-bold">${product.name}</h2>
                    <p class="text-xl">Price: Rs ${discountPrice.toLocaleString()} <del class="text-red-500">Rs ${originalPrice.toLocaleString()}</del></p>
                    <p>Discount: ${product.discountRate}%</p>
                    <p>Category: ${product.category}</p>
                    <p>Description: ${product.description}</p>
                    <div class="flex items-center space-x-2">
                        <label for="quantity" class="mr-2">Quantity</label>
                        <input type="number" id="quantity" value="1" min="1" class="quantity-input">
                    </div>
                    <a href="#" class="btn btn-primary mt-4 add-to-cart" onclick="addToCart(${product.pro_id}, '${product.name}', '${product.category}', ${discountPrice}, '${product.imageUrl}')">Add to cart</a>
                    <div class="overflow-x-auto mt-4">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Features</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${product.features.map((feature) => `
                                    <tr class="hover:bg-gray-500">
                                        <td>${feature}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        productDetailsContainer.innerHTML = productHTML;
        attachButtonResetHandlers();
    }

    function attachButtonResetHandlers() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
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

    function showLoginAlert() {
        const loginAlert = document.getElementById('loginAlert');
        loginAlert.classList.remove('hidden');
        loginAlert.classList.add('show');
        setTimeout(() => {
            loginAlert.classList.remove('show');
            loginAlert.classList.add('hidden');
            window.location.href = '../../auth/login.html';
        }, 2000);
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
        li.innerHTML = `<a href="../../products/${category}.html" class="side-panel-a">${category}</a>`;
        categoryList.appendChild(li);
    });

    menuToggle.addEventListener('click', function () {
        sidePanel.classList.remove('-translate-x-full');
    });

    closePanel.addEventListener('click', function () {
        sidePanel.classList.add('-translate-x-full');
    });

    window.addToCart = function (productId, productName, productCategory, productPrice, productImageUrl) {
        if (!authToken) {
            showLoginAlert();
            return;
        }
        const quantity = parseInt(document.getElementById('quantity').value);
        const cartItem = {
            authToken: authToken,
            pro_id: productId,
            name: productName,
            category: productCategory,
            price: productPrice,
            imageUrl: productImageUrl,
            quantity: quantity
        };

        fetch(`http://localhost:3000/api/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(cartItem),
        })
            .then(async response => {
                if (response.status === 401 || response.status === 403) {
                    const data = await response.json();
                    if (data.error === 'TokenExpired' || response.status === 403) {
                        handleTokenExpiration();
                    } else {
                        throw new Error('Unauthorized access');
                    }
                } else if (response.status === 400) {
                    const data = await response.json();
                    if (data.message === 'Product is out of stock') {
                        showCartAlert(data.message, 'error');
                    }
                    throw new Error(data.message);
                } else if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(`Product ${productId} added to cart`);
                showCartAlert('Product added to cart successfully!', 'success');
            })
            .catch(error => {
                console.error('Error adding product to cart:', error);
            });
    };

    function showCartAlert(message, type = 'success') {
        cartAlert.classList.remove('bg-green-500', 'bg-red-500');
        if (type === 'error') {
            cartAlert.classList.add('bg-red-500');
        } else {
            cartAlert.classList.add('bg-green-500');
        }
        cartAlert.textContent = message;
        cartAlert.classList.remove('hidden');
        cartAlert.classList.add('show');
        setTimeout(() => {
            cartAlert.classList.remove('show');
            cartAlert.classList.add('hidden');
        }, 2000);
    }

    function showLogoutAlert() {
        logoutAlert.classList.remove('hidden');
        setTimeout(() => {
            logoutAlert.classList.add('hidden');
        }, 3000);
    }

    async function handleLogout() {
        try {
            const response = await fetch(`http://localhost:3000/api/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            if (data.success) {
                localStorage.removeItem('authToken');
                showLogoutAlert();
                setTimeout(() => {
                    window.location.href = '../../auth/login.html';
                }, 3000);
            } else {
                console.error('Error logging out:', data.message);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }
});

function redirectToProductPage(productId) {
    window.location.href = `./product-info.html?pro_id=${productId}`;
}