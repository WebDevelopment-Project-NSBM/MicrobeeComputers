document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 9;
    let currentPage = 1;
    let cartItems = [];

    const cartItemsContainer = document.getElementById('cartItems');
    const paginationContainer = document.getElementById('paginationContainer');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const content = document.getElementById('content');

    function fetchCartItems() {
        loadingSpinner.classList.add('active');
        fetch(`http://localhost:3000/api/cart/items`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                cartItems = data;
                renderCartItems();
                renderPagination(cartItems.length, currentPage);
            })
            .catch(error => {
                console.error('Error fetching cart items:', error);
                cartItemsContainer.innerHTML = '<p>Error fetching cart items.</p>';
            })
            .finally(() => {
                loadingSpinner.classList.remove('active');
                content.style.display = 'block';
            });
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = cartItems.slice(start, end);

        paginatedItems.forEach(item => {
            const itemHTML = `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}">
                        <div class="card-body">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text">Price: Rs ${item.price.toLocaleString()}</p>
                            <p class="card-text">Quantity: ${item.quantity}</p>
                            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.pro_id})">Remove</button>
                            <button class="btn btn-primary btn-sm" onclick="increaseQuantity(${item.pro_id})">+</button>
                            <button class="btn btn-primary btn-sm" onclick="decreaseQuantity(${item.pro_id})">-</button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });

        const checkoutButton = `
            <div class="col-md-12 mt-3">
                <button class="btn btn-success btn-block">Checkout</button>
            </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', checkoutButton);
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
        renderCartItems();
        renderPagination(cartItems.length, currentPage);
    }

    fetchCartItems();

    window.removeFromCart = function (productId) {
        fetch(`http://localhost:3000/api/cart/remove/${productId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(`Product ${productId} removed from cart`);
                fetchCartItems();
            })
            .catch(error => {
                console.error('Error removing product from cart:', error);
            });
    };

    window.increaseQuantity = function (productId) {
        fetch(`http://localhost:3000/api/cart/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ operation: 'increase' }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(`Product ${productId} quantity increased`);
                fetchCartItems();
            })
            .catch(error => {
                console.error('Error increasing product quantity:', error);
            });
    };

    window.decreaseQuantity = function (productId) {
        fetch(`http://localhost:3000/api/cart/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ operation: 'decrease' }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(`Product ${productId} quantity decreased`);
                fetchCartItems();
            })
            .catch(error => {
                console.error('Error decreasing product quantity:', error);
            });
    };
});
