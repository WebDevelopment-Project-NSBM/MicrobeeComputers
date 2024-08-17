document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 15;
    let currentPage = 1;
    let sortedProducts = [];
    let originalProducts = [];

    const productContainer = document.getElementById('productContainer');
    const paginationContainer = document.getElementById('paginationContainer');
    const productCountElement = document.getElementById('productCount');
    const sortByElement = document.querySelectorAll('.dropdown-content a');
    const loadingBar = document.getElementById('loadingBar');
    const content = document.getElementById('content');
    const cartAlert = document.getElementById('cartAlert');
    const logoutAlert = document.getElementById('logoutAlert');

    function showLoading() {
        loadingBar.style.width = '100%';
        loadingBar.style.display = 'block';
    }

    function hideLoading() {
        loadingBar.style.width = '0';
        content.classList.add('show');
    }

    function fetchProducts(category, sortBy = 'latest') {
        showLoading();
        fetch(`http://localhost:3000/api/products?category=${category}&sortBy=${sortBy}`)
            .then(response => response.json())
            .then(data => {
                sortedProducts = data;
                originalProducts = data;
                updateProductCount(data.length);
                renderProducts(sortedProducts, currentPage);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            })
            .finally(() => {
                hideLoading();
            });
    }

    fetchProducts('casing');

    function updateProductCount(count) {
        productCountElement.textContent = `${count} Products found`;
    }

    function renderProducts(products, page = 1) {
        productContainer.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedProducts = products.slice(start, end);

        paginatedProducts.forEach(product => {
            const originalPrice = product.price + (product.discountRate / 100 * product.price);
            const discountPrice = product.price;
            const isLongName = product.name.length > 25;
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
                <div class="w-full p-2 product-item">
                    <div class="card bg-base-100 shadow-xl">
                        <figure><img src="${product.imageUrl}" alt="${product.name}" class="object-cover w-full h-48" onclick="redirectToProductPage(${product.pro_id})"></figure>
                        <div class="card-body">
                            <h2 class="card-title ${isLongName ? 'long' : ''}" onclick="redirectToProductPage(${product.pro_id})">${displayName}</h2>
                            <p class="card-text">Rs: ${discountPrice.toLocaleString()} <del>Rs: ${originalPrice.toLocaleString()}</del></p>
                            <a href="#" class="btn btn-primary btn-block" onclick="addToCart(${product.pro_id}, '${product.name}', '${product.category}', ${discountPrice}, '${product.imageUrl}')">Add to cart</a>
                        </div>
                    </div>
                </div>
            `;
            productContainer.insertAdjacentHTML('beforeend', productHTML);
        });
        renderPagination(products.length, page);
        attachButtonResetHandlers();
    }

    function renderPagination(totalItems, currentPage) {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPage);

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
        renderProducts(sortedProducts, currentPage);
    }

    sortByElement.forEach(item => {
        item.addEventListener('click', function () {
            const sortBy = this.dataset.sort;
            fetchProducts('casing', sortBy);
        });
    });

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
        logoutAlert.classList.remove('hidden');
        setTimeout(() => {
            logoutAlert.classList.add('hidden');
        }, 3000);
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
    }

    attachButtonResetHandlers();

    function attachButtonResetHandlers() {
        document.querySelectorAll('.btn').forEach(button => {
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

    function showCartAlert() {
        cartAlert.classList.remove('hidden');
        cartAlert.classList.add('show');
        setTimeout(() => {
            cartAlert.classList.remove('show');
            cartAlert.classList.add('hidden');
        }, 2000);
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

    window.addToCart = function (productId, productName, productCategory, productPrice, productImageUrl) {
        if (!userId) {
            showLoginAlert()
            return;
        }

        const cartItem = {
            userId: userId,
            pro_id: productId,
            name: productName,
            category: productCategory,
            price: productPrice,
            imageUrl: productImageUrl,
            quantity: 1
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

    const sortDropdown = document.getElementById('sortDropdown');
    const dropdownMenu = sortDropdown.querySelector('.dropdown-content');

    sortDropdown.addEventListener('mouseenter', function () {
        const rect = dropdownMenu.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        if (rect.right > windowWidth) {
            dropdownMenu.classList.add('dropdown-right');
        } else {
            dropdownMenu.classList.remove('dropdown-right');
        }
    });

    sortDropdown.addEventListener('mouseleave', function () {
        dropdownMenu.classList.remove('dropdown-right');
    });
});

function redirectToProductPage(productId) {
    window.location.href = `../products/products_info/product-info.html?pro_id=${productId}`;
}
