document.addEventListener("DOMContentLoaded", function () {
    const categories = [
        { name: 'CPU', url: '../products/cpu.html' },
        { name: 'Motherboards', url: '../products/motherboards.html' },
        { name: 'RAM', url: '../products/ram.html' },
        { name: 'GPU', url: '../products/gpu.html' },
        { name: 'Storage', url: '../products/storage.html' },
        { name: 'Monitor', url: '../products/monitor.html' },
        { name: 'Casing', url: '../products/casing.html' },
        { name: 'Power Supply', url: '../products/powersupply.html' },
        { name: 'Coolers', url: '../products/coolers.html' },
        { name: 'UPS', url: '../products/ups.html' }
    ];

    const categoryContainer = document.getElementById('categoryContainer');

    categories.forEach(category => {
        const categoryHTML = `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4 category-item">
                <div class="card">
                    <div class="card-body text-center">
                        <h5 class="card-title">${category.name}</h5>
                        <a href="${category.url}" class="btn btn-primary">View Products</a>
                    </div>
                </div>
            </div>
        `;
        categoryContainer.insertAdjacentHTML('beforeend', categoryHTML);
    });
});
