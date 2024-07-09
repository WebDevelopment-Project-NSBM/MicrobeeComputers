document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('pro_id'));
    const loadingSpinner = document.querySelector('.loading-spinner');
    const productDetailsContainer = document.getElementById('productDetails');

    function showLoading() {
        loadingSpinner.classList.add('active');
    }

    function hideLoading() {
        loadingSpinner.classList.remove('active');
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
    const logoutButton = document.createElement('a');
    logoutButton.href = '#';
    logoutButton.classList.add('btn', 'btn-warning', 'mr-2');
    logoutButton.id = 'logoutButton';
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', function (event) {
        event.preventDefault();
        localStorage.removeItem('userId');
        window.location.href = '../../auth/auth.html?login';
    });

    if (userId) {
        document.querySelectorAll('.auth a[href*="login"], .auth a[href*="register"]').forEach(button => {
            button.style.display = 'none';
        });
        document.querySelector('.auth').appendChild(logoutButton);
    }
});

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
    const productDetailsContainer = document.getElementById('productDetails');

    const originalPrice = product.price + (product.discountRate / 100 * product.price);
    const discountPrice = product.price;

    const productHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <img src="../${product.imageUrl}" class="w-full h-auto object-cover" alt="${product.name}">
            </div>
            <div>
                <h2 class="text-2xl font-bold">${product.name}</h2>
                <p class="text-xl">Price: Rs ${discountPrice.toLocaleString()} <del class="text-red-500">Rs ${originalPrice.toLocaleString()}</del></p>
                <p>Discount: ${product.discountRate}%</p>
                <p>Category: ${product.category}</p>
                <p>Description: ${product.description}</p>
                <a href="#" class="btn btn-primary mt-4 add-to-cart" onclick="addToCart(${product.pro_id}, '${product.name}', '${product.category}', ${discountPrice}, '${product.imageUrl}')">Add to cart</a>
                <div class="overflow-x-auto mt-4">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Feature</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${product.features.map((feature, index) => `
                                <tr class="hover:bg-gray-500">
                                    <th>${index + 1}</th>
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
