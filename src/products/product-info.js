document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    fetchProducts()
        .then(products => {
            const product = products.find(p => p.id === productId);
            if (product) {
                renderProductDetails(product);
            } else {
                const productDetailsContainer = document.getElementById('productDetails');
                productDetailsContainer.innerHTML = '<p>Product not found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            const productDetailsContainer = document.getElementById('productDetails');
            productDetailsContainer.innerHTML = '<p>Error fetching product details.</p>';
        });
});

function fetchProducts() {
    return fetch('http://localhost:3000/api/products')
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

    const productHTML = `
        <div class="col-md-6">
            <img src="${product.imageUrl}" class="img-fluid" alt="${product.name}">
        </div>
        <div class="col-md-6">
            <h2>${product.name}</h2>
            <p>Price: Rs ${product.price.toLocaleString()}</p>
            <p>Description: ${product.description}</p>
            <h4>Features:</h4>
            <ul>
                ${product.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <a href="#" class="btn btn-primary" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.imageUrl}')">Add to cart</a>
        </div>
    `;

    productDetailsContainer.innerHTML = productHTML;
}

window.addToCart = function (productId, productName, productPrice, productImageUrl) {
    const cartItem = {
        id: productId,
        name: productName,
        price: productPrice,
        imageUrl: productImageUrl,
        quantity: 1
    };

    fetch('http://localhost:3000/api/cart/add', {
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