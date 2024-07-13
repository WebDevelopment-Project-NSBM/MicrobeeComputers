document.addEventListener("DOMContentLoaded", function () {
    const productListContainer = document.getElementById('productListContainer');
    const productPaginationContainer = document.getElementById('productPaginationContainer');
    const editProductForm = document.getElementById('editProductForm');
    const productCategoryFilter = document.getElementById('productCategoryFilter');
    const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    let products = [];
    let filteredProducts = [];
    let currentPage = 1;
    const itemsPerPageProduct = 6;
    let selectedCategory = '';

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
        const container = productPaginationContainer;
        container.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPageProduct);

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
        renderProductList();
        renderPagination(filteredProducts.length, currentPage, 'product');
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

    function filterProductsByCategory() {
        selectedCategory = productCategoryFilter.value;
        filteredProducts = selectedCategory ? products.filter(product => product.category === selectedCategory) : products;
        renderProductList();
        renderPagination(filteredProducts.length, currentPage, 'product');
    }

    editProductForm.addEventListener('submit', handleEditProduct);
    productCategoryFilter.addEventListener('change', filterProductsByCategory);

    fetchAllProducts();

    window.deleteProduct = deleteProduct;
    window.editProduct = editProduct;
});
