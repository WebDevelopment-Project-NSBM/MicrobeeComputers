document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 9;
    let currentPage = 1;
    let users = [];

    const adminProfileContainer = document.getElementById('adminProfileContainer');
    const userListContainer = document.getElementById('userListContainer');
    const logoutButton = document.getElementById('logoutButton');
    const addProductForm = document.getElementById('addProductForm');
    const userPaginationContainer = document.getElementById('userPaginationContainer');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        window.location.href = '../auth/auth.html?modal=login';
        return;
    }

    function fetchAdminProfile() {
        fetch(`http://localhost:3000/api/user/profile?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.email && data.admin) {
                    renderAdminProfile(data);
                    fetchAllUsers();
                } else {
                    adminProfileContainer.innerHTML = '<p>You do not have admin rights.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching admin profile:', error);
                adminProfileContainer.innerHTML = '<p>Error fetching admin profile.</p>';
            });
    }

    function renderAdminProfile(admin) {
        const adminHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${admin.email || 'Admin Profile'}</h5>
                    <p class="card-text"><strong>Email:</strong> ${admin.email}</p>
                    <p class="card-text"><strong>Admin:</strong> ${admin.admin ? 'Yes' : 'No'}</p>
                    <p class="card-text"><strong>Member since:</strong> ${new Date(admin.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `;
        adminProfileContainer.innerHTML = adminHTML;
    }

    function fetchAllUsers() {
        fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                users = data;
                renderUserList();
                renderPagination(users.length, currentPage);
            })
            .catch(error => {
                console.error('Error fetching user list:', error);
                userListContainer.innerHTML = '<p>Error fetching user list.</p>';
            });
    }

    function renderUserList() {
        userListContainer.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedUsers = users.slice(start, end);

        paginatedUsers.forEach(user => {
            const userHTML = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${user.email}</h5>
                        <p class="card-text"><strong>Email:</strong> ${user.email}</p>
                        <p class="card-text"><strong>Admin:</strong> ${user.admin ? 'Yes' : 'No'}</p>
                        <p class="card-text"><strong>Member since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                        <button class="btn btn-danger" onclick="deleteUser('${user._id}')">Delete</button>
                    </div>
                </div>
            `;
            userListContainer.insertAdjacentHTML('beforeend', userHTML);
        });
    }

    function renderPagination(totalItems, currentPage) {
        userPaginationContainer.innerHTML = '';
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

        userPaginationContainer.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.classList.add('btn', 'btn-light', 'mx-1');
            pageButton.textContent = i;
            pageButton.disabled = i === currentPage;
            pageButton.addEventListener('click', () => changePage(i));
            userPaginationContainer.appendChild(pageButton);
        }

        userPaginationContainer.appendChild(nextButton);
    }

    function changePage(page) {
        currentPage = page;
        renderUserList();
        renderPagination(users.length, currentPage);
    }

    function deleteUser(userId) {
        fetch(`http://localhost:3000/api/user/delete/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (response.ok) {
                    console.log(`User ${userId} deleted successfully`);
                    fetchAllUsers();
                } else {
                    throw new Error('Error deleting user');
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
            });
    }

    function handleLogout() {
        fetch(`http://localhost:3000/api/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.removeItem('userId');
                    window.location.href = '../auth/auth.html?modal=login';
                } else {
                    console.error('Error logging out:', data.message);
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
            });
    }

    async function handleAddProduct(event) {
        event.preventDefault();

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

    logoutButton.addEventListener('click', handleLogout);
    addProductForm.addEventListener('submit', handleAddProduct);

    fetchAdminProfile();

    window.deleteUser = deleteUser;
});
