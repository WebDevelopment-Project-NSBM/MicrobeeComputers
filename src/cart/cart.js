document.addEventListener("DOMContentLoaded", function () {
    renderCart();
});

function renderCart() {
    fetch('http://localhost:3000/api/cart/items')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(cartItems => {
            const cartItemsContainer = document.getElementById('cartItems');
            cartItemsContainer.innerHTML = '';

            cartItems.forEach(item => {
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
        })
        .catch(error => {
            console.error('Error fetching cart items:', error);
            const cartItemsContainer = document.getElementById('cartItems');
            cartItemsContainer.innerHTML = '<p>Error fetching cart items.</p>';
        });
}

function removeFromCart(productId) {
    fetch(`http://localhost:3000/api/cart/remove/${productId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(`Product ${productId} removed from cart`);
            renderCart();
        })
        .catch(error => {
            console.error('Error removing product from cart:', error);
        });
}

function increaseQuantity(productId) {
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
            renderCart();
        })
        .catch(error => {
            console.error('Error increasing product quantity:', error);
        });
}

function decreaseQuantity(productId) {
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
            renderCart();
        })
        .catch(error => {
            console.error('Error decreasing product quantity:', error);
        });
}