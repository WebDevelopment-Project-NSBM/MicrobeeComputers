document.addEventListener("DOMContentLoaded", function () {
    const addProductForm = document.getElementById('addProductForm');

    async function handleAddProduct(event) {
        event.preventDefault();

        const requestingUserId = localStorage.getItem('userId');
        const requestingUser = await fetch(`http://localhost:3000/api/user/profile?userId=${requestingUserId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            if (!response.ok) {
                alert('User not found');
                return;
            }
            return response.json();
        });

        if (!requestingUser.admin) {
            alert('Only admin users can register new users');
            return;
        }

        const newProId = await fetch('http://localhost:3000/api/products/highest-pro-id')
            .then(response => response.json())
            .then(data => data.highestProId + 1)
            .catch(error => {
                console.error('Error fetching highest pro_id:', error);
                return 1;
            });

        const formData = new FormData(addProductForm);
        formData.append('pro_id', newProId);
        const features = formData.get('features') || '';
        formData.set('features', features.split(',').map(feature => feature.trim()).join(','));

        const response = await fetch('http://localhost:3000/api/products/add', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert('Product added successfully!');
            addProductForm.reset();
        } else {
            alert('Error adding product: ' + result.message);
        }
    }

    addProductForm.addEventListener('submit', handleAddProduct);
});
