document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 12;
    let currentPage = 1;
    let sortedProducts = [];
    let originalProducts = [];

    const productContainer = document.getElementById('productContainer');
    const paginationContainer = document.getElementById('paginationContainer');
    const productCountElement = document.getElementById('productCount');
    const sortByElement = document.getElementById('sortBy');

    function fetchProducts() {
        fetch(`${config.hosturl}/api/products`)
            .then(response => response.json())
            .then(data => {
                sortedProducts = data;
                originalProducts = data;
                updateProductCount(data.length);
                renderProducts(sortedProducts, currentPage);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }
    fetchProducts();

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
            const productHTML = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4 product-item">
                    <div class="card">
                        <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" onclick="redirectToProductPage(${product.pro_id})">
                        <div class="card-body">
                            <h5 class="card-title" onclick="redirectToProductPage(${product.pro_id})">${product.name}</h5>
                            <p class="card-text">Rs: ${discountPrice.toLocaleString()} <del>Rs: ${originalPrice.toLocaleString()}</del></p>
                            <a href="#" class="btn btn-primary btn-block" onclick="addToCart(${product.pro_id}, '${product.name}', '${product.category}', ${discountPrice}, '${product.imageUrl}')">Add to cart</a>
                        </div>
                    </div>
                </div>
            `;
            productContainer.insertAdjacentHTML('beforeend', productHTML);
        });

        renderPagination(products.length, page);
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

    sortByElement.addEventListener('change', function () {
        const sortBy = sortByElement.value;
        switch (sortBy) {
            case 'popularity':
                sortedProducts.sort((a, b) => b.popularity - a.popularity);
                break;
            case 'latest':
                sortedProducts.sort((a, b) => new Date(b.latest) - new Date(a.latest));
                break;
            case 'priceLowToHigh':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'priceHighToLow':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            default:
                sortedProducts = originalProducts.slice();
                break;
        }
        renderProducts(sortedProducts, 1);
    });
});

function redirectToProductPage(productId) {
    window.location.href = `../products/product-info.html?pro_id=${productId}`;
}

window.addToCart = function (productId, productName, productCategory, productPrice, productImageUrl) {
    const cartItem = {
        pro_id: productId,
        name: productName,
        category: productCategory,
        price: productPrice,
        imageUrl: productImageUrl,
        quantity: 1
    };

    fetch(`${config.hosturl}/api/cart/add`, {
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
        })
        .catch(error => {
            console.error('Error adding product to cart:', error);
        });
};

document.querySelector('.btn-primary.mr-2').addEventListener('click', function (event) {
    event.preventDefault();
    $('#loginModal').modal('show');
});

document.querySelector('.btn-secondary.mr-2').addEventListener('click', function (event) {
    event.preventDefault();
    $('#registerModal').modal('show');
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch(`${config.hosturl}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
        .then(response => {
            if (response.ok) {
                console.log('Login successful');
                $('#loginModal').modal('hide');
            } else {
                throw new Error('Login failed');
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
        });
});

document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    fetch(`${config.hosturl}/api/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
        .then(response => {
            if (response.ok) {
                console.log('Registration successful');
                $('#registerModal').modal('hide');
            } else {
                throw new Error('Registration failed');
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
        });
});