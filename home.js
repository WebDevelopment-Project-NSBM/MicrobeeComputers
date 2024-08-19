document.addEventListener("DOMContentLoaded", function () {
    const loadingBar = document.getElementById('loadingBar');
    const cartAlert = document.getElementById('cartAlert');
    const logoutAlert = document.getElementById('logoutAlert');

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
    setTimeout(hideLoading, 180);

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

    const authToken = localStorage.getItem('authToken');
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
        logoutAlert.classList.remove('hidden');
        setTimeout(() => {
            logoutAlert.classList.add('hidden');
        }, 3000);
    }

    function fetchProducts(category, sortBy = 'latest') {
        showLoading();
        fetch(`http://localhost:3000/api/products?category=${category}&sortBy=${sortBy}`)
            .then(response => response.json())
            .then(data => {
                renderProductCarousel(category, data);
            })
            .catch(error => {
                console.error(`Error fetching products for ${category}:`, error);
            })
            .finally(() => {
                hideLoading();
            });
    }

    function renderProductCarousel(category, products) {
        const carouselContainer = document.getElementById(`${category}-carousel`);
        carouselContainer.innerHTML = generateCarouselItems(products, category);
        enableAutoSliding(`#${category}-carousel`);
    }

    function generateCarouselItems(products, category) {
        const itemsPerSlide = 5;
        let slideIndex = 0;
        let carouselHTML = '';

        for (let i = 0; i < products.length; i += itemsPerSlide) {
            slideIndex++;
            const productsForSlide = products.slice(i, i + itemsPerSlide);

            carouselHTML += `
                <div id="${category}-slide${slideIndex}" class="carousel-item w-full flex justify-center transition-opacity duration-1000 ease-in-out" style="opacity: 0;">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        ${productsForSlide.map(product => createProductCard(product)).join('')}
                    </div>
                    <div class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                        <a href="#${category}-slide${slideIndex - 1}" class="btn btn-circle custom-carousel-arrow left-arrow">❮</a>
                        <a href="#${category}-slide${slideIndex + 1}" class="btn btn-circle custom-carousel-arrow right-arrow">❯</a>
                    </div>
                </div>`;
        }

        return carouselHTML;
    }

    function createProductCard(product) {
        const originalPrice = product.price + (product.discountRate / 100 * product.price);
        const discountPrice = product.price;
        const isLongName = product.name.length > 25;
        let displayName = product.name;

        if (product.name.length > 75) {
            displayName = `${product.name.substring(0, 25)}<br>${product.name.substring(25, 50)}<br>${product.name.substring(50, 75)}`;
        } else if (product.name.length > 50) {
            displayName = `${product.name.substring(0, 25)}<br>${product.name.substring(25, 50)}<br>${product.name.substring(50, 75)}`;
        } else if (product.name.length > 25) {
            displayName = `${product.name.substring(0, 25)}<br>${product.name.substring(25, 50)}`;
        }
        attachButtonResetHandlers();
        return `
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
    }

    function enableAutoSliding(carouselSelector) {
        let slideIndex = 1;
        const slides = document.querySelectorAll(`${carouselSelector} .carousel-item`);
        let slideInterval;

        function showSlides(index) {
            slides.forEach((slide, idx) => {
                slide.style.display = 'none';
                slide.style.opacity = '0';
                slide.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';
            });

            if (index > slides.length) {
                slideIndex = 1;
            }
            if (index < 1) {
                slideIndex = slides.length;
            }

            slides[slideIndex - 1].style.display = 'block';
            slides[slideIndex - 1].style.opacity = '1';
            slides[slideIndex - 1].style.transform = 'translateX(0)';
            slideIndex++;
        }

        function startAutoSlide() {
            slideInterval = setInterval(() => {
                slides.forEach(slide => {
                    slide.style.transform = 'translateX(-100%)';
                });
                showSlides(slideIndex);
            }, 7000);
        }

        function resetAutoSlide() {
            clearInterval(slideInterval);
            startAutoSlide();
        }

        showSlides(slideIndex);
        startAutoSlide();

        document.querySelectorAll(`${carouselSelector} .btn-circle`).forEach(button => {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                slides.forEach(slide => {
                    slide.style.transform = 'translateX(-100%)';
                });
                if (this.textContent.includes('❮')) {
                    showSlides(slideIndex -= 2);
                } else {
                    showSlides(slideIndex);
                }
                resetAutoSlide();
            });
        });

        document.querySelectorAll(`${carouselSelector} .product-item`).forEach(item => {
            item.addEventListener('click', () => {
                resetAutoSlide();
            });
        });

        const carouselElement = document.querySelector(carouselSelector);
        carouselElement.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        carouselElement.addEventListener('mouseleave', () => {
            resetAutoSlide();
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

    const mainContainer = document.createElement('div');
    mainContainer.className = 'grid-container container mx-auto mt-10';

    categories.forEach(category => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.id = `${category}-section`;

        categorySection.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold capitalize text-left">${category}</h2>
            <a href="../products/${category}.html" class="btn btn-home mr-2">View All</a>
        </div>
        <div id="${category}-carousel" class="carousel w-full relative"></div>
    `;

        mainContainer.appendChild(categorySection);
    });

    document.querySelector('main').appendChild(mainContainer);
    categories.forEach(category => fetchProducts(category));

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
        if (!authToken) {
            showLoginAlert()
            return;
        }

        const cartItem = {
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
                } else if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(`Product ${productId} added to cart`);
                showCartAlert();
            })
            .catch(error => {
                console.error('Error adding product to cart:', error);
            });
    };
});

function redirectToProductPage(productId) {
    window.location.href = `../products/products_info/product-info.html?pro_id=${productId}`;
}
