document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('pro_id'));
    const loadingBar = document.getElementById('loadingBar');
    const productDetailsContainer = document.getElementById('productDetails');
    const logoutAlert = document.getElementById('logoutAlert');
    const cartAlert = document.getElementById('cartAlert');

    function showLoading() {
        loadingBar.style.width = '100%';
        loadingBar.style.display = 'block';
    }

    function hideLoading() {
        loadingBar.style.width = '0';
        loadingBar.style.display = 'none';
    }

    showLoading();

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

    const userId = localStorage.getItem('userId');

    if (userId) {
        document.querySelectorAll('.auth a[href*="login"], .auth a[href*="register"]').forEach(button => {
            button.style.display = 'none';
        });

        fetch(`http://localhost:3000/api/user/details?userId=${userId}`)
            .then(response => response.json())
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
        const originalPrice = product.price + (product.discountRate / 100 * product.price);
        const discountPrice = product.price;

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

    window.addToCart = function (productId, productName, productCategory, productPrice, productImageUrl) {
        const quantity = parseInt(document.getElementById('quantity').value);
        const cartItem = {
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
            },
            body: JSON.stringify(cartItem),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(`Product ${productId} added to cart`);
                showCartAlert();
            })
            .catch(error => {
                console.error('Error adding product to cart:', error);
            });
    };

    function showCartAlert() {
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
                }
            });
            const data = await response.json();
            if (data.success) {
                localStorage.removeItem('userId');
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
