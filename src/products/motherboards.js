document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 15;
    let currentPage = 1;
    let sortedProducts = [];
    let originalProducts = [];

    const productContainer = document.getElementById('productContainer');
    const paginationContainer = document.getElementById('paginationContainer');
    const productCountElement = document.getElementById('productCount');
    const sortByElement = document.querySelectorAll('.dropdown-content a');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const content = document.getElementById('content');

    function showLoading() {
        loadingSpinner.classList.add('active');
    }

    function hideLoading() {
        loadingSpinner.classList.remove('active');
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

    fetchProducts('motherboards');

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
                <div class="w-full p-2 product-item">
                    <div class="card bg-base-100 shadow-xl">
                        <figure><img src="${product.imageUrl}" alt="${product.name}" onclick="redirectToProductPage(${product.pro_id})"></figure>
                        <div class="card-body">
                            <h2 class="card-title" onclick="redirectToProductPage(${product.pro_id})">${product.name}</h2>
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

    sortByElement.forEach(item => {
        item.addEventListener('click', function () {
            const sortBy = this.dataset.sort;
            fetchProducts('motherboards', sortBy);
        });
    });

    const userId = localStorage.getItem('userId');
    const logoutButton = document.createElement('a');
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
});

function redirectToProductPage(productId) {
    window.location.href = `../products/products_info/product-info.html?pro_id=${productId}`;
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
        })
        .catch(error => {
            console.error('Error adding product to cart:', error);
        });
};
