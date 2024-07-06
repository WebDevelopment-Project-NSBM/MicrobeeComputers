document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 12;
    let currentPage = 1;
    let sortedProducts = [];

    const productContainer = document.getElementById('productContainer');
    const paginationContainer = document.getElementById('paginationContainer');

    function fetchProducts() {
        fetch('http://localhost:3000/api/products')
            .then(response => response.json())
            .then(data => {
                sortedProducts = data;
                console.log(sortedProducts)
                renderProducts(sortedProducts, currentPage);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }
    fetchProducts();

    function renderProducts(products, page = 1) {
        productContainer.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedProducts = products.slice(start, end);

        paginatedProducts.forEach(product => {
            const productHTML = `
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card">
                        <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" onclick="redirectToProductPage(${product.id})">
                        <div class="card-body">
                            <h5 class="card-title" onclick="redirectToProductPage(${product.id})">${product.name}</h5>
                            <p class="card-text">Rs: ${product.price.toLocaleString()} <del>Rs: ${product.originalPrice.toLocaleString()}</del></p>
                            <a href="#" class="btn btn-primary btn-block" onclick="addToCart(${product.id})">Add to cart</a>
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
});
function redirectToProductPage(productId) {
    window.location.href = `../Products/product-info.html?id=${productId}`;
}

window.addToCart = function (productId) {
    console.log(`Product ${productId} added to cart`);
};
