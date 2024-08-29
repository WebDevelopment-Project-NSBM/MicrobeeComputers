document.addEventListener("DOMContentLoaded", function () {
    const userProfileContainer = document.getElementById('userProfileContainer');
    const logoutButton = document.getElementById('logoutButton');
    const authToken = localStorage.getItem('authToken');
    const loadingBar = document.getElementById('loadingBar');
    const logoutAlert = document.getElementById('logoutAlert');
    const searchInput = document.querySelector('.ser-col');
    const searchButton = document.querySelector('.fa-search');
    const searchDropdown = document.getElementById('searchDropdown');

    if (!authToken) {
        window.location.href = '../auth/login.php';
        return;
    }

    function showLoadingBar() {
        if (loadingBar) {
            loadingBar.style.width = '100%';
            loadingBar.style.display = 'block';
            loadingBar.classList.remove('hidden');
        }
    }

    function hideLoadingBar() {
        if (loadingBar) {
            loadingBar.style.width = '0';
            setTimeout(() => {
                loadingBar.style.display = 'none';
            }, 500);
        }
    }

    function performSearch(query) {
        if (!query) {
            console.log('No query provided, hiding dropdown');
            searchDropdown.classList.add('hidden');
            return;
        }

        fetch(`https://microbeecomputers.lk/api/search?query=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    searchDropdown.innerHTML = "<p class='px-4 py-2 text-gray-500'>No products found.</p>";
                } else {
                    renderSearchDropdown(data);
                }
                searchDropdown.classList.remove('hidden');
                console.log('Dropdown populated and displayed');
            })
            .catch(error => {
                console.error('Error during search:', error);
                searchDropdown.classList.add('hidden');
            });
    }

    function renderSearchDropdown(products) {
        searchDropdown.innerHTML = products.slice(0, 50).map(product => `
            <div class="px-4 py-2 cursor-pointer hover:bg-gray-100" onclick="redirectToProductPage(${product.pro_id})">
                <p class="text-black font-semibold">${product.name}</p>
                <p class="text-gray-500">Rs: ${product.price.toLocaleString()}</p>
            </div>
        `).join('');
        searchDropdown.classList.remove('hidden');
    }

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        performSearch(query);
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        performSearch(query);
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchDropdown.classList.add('hidden');
        }, 150);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            performSearch(query);
            searchDropdown.classList.add('hidden');
        }
    });

    function showTokenExpireLogOutAlert(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.add('hidden');
            document.body.removeChild(alertDiv);
        }, 3000);
    }

    function showLogoutMessage(message) {
        showTokenExpireLogOutAlert(message);
        setTimeout(() => {
            window.location.href = '../auth/login.php';
        }, 1000);
    }

    function handleTokenExpiration() {
        localStorage.removeItem('authToken');
        showLogoutMessage('Your session has expired. Please log in again.');
    }

    function fetchUserProfile() {
        showLoadingBar();
        fetch(`https://microbeecomputers.lk/api/user/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(async response => {
                hideLoadingBar();
                if (response.status === 401 || response.status === 403) {
                    const data = await response.json();
                    if (data.error === 'TokenExpired' || response.status === 403) {
                        handleTokenExpiration();
                    } else {
                        throw new Error('Unauthorized access');
                    }
                } else if (!response.ok) {
                    throw new Error('Error fetching user profile');
                } else {
                    return response.json();
                }
            })
            .then(data => {
                hideLoadingBar();
                if (data.email) {
                    renderUserProfile(data);
                } else {
                    userProfileContainer.innerHTML = '<p>Error fetching user profile.</p>';
                }
            })
            .catch(error => {
                hideLoadingBar();
                console.error('Error fetching user profile:', error);
                userProfileContainer.innerHTML = '<p>Error fetching user profile.</p>';
            });
    }

    function renderUserProfile(user) {
        let orderInfoCardHTML = '';

        if (user.orderStatus === 1) {
            orderInfoCardHTML = `
            <div class="card mb-3 mx-auto max-w-md">
                <div class="card-body">
                    <h5 class="text-center text-xl font-bold mb-4">Order Information</h5>
                    <p class="card-text mb-4"><strong>Your Order ID:</strong> ${user.userId}</p>
                    <p class="card-text mb-4 text-yellow-600"><strong>Status:</strong> Your order is pending. Please complete your purchase by contacting us.</p>
                    <p class="card-text mb-2"><strong>Email:</strong> <a href="mailto:sales@microbeecomputers.lk" class="text-blue-600">sales@microbeecomputers.lk</a></p>
                    <p class="card-text mb-2"><strong>Address:</strong></p>
                    <ul class="list-disc pl-5 mb-4">
                        <li>Dehiwala Showroom: 110A, Galle Road, Dehiwala.</li>
                        <li>Colombo 3 Showroom: 37, School Lane (Facing Duplication Road), Colombo 03.</li>
                    </ul>
                    <p class="card-text"><strong>Phone:</strong> <a href="tel:07777292272" class="text-blue-600">07777 292 272</a></p>
                </div>
            </div>
        `;
        }

        const userProfileCardHTML = `
        <div class="card mb-3 mx-auto max-w-md">
            <div class="card-body">
                <h5 class="text-center text-2xl font-bold mb-6">${user.email || 'User Profile'}</h5>
                <p class="card-text mb-4"><strong>Email:</strong> ${user.email}</p>
                <p class="card-text mb-4"><strong>Admin:</strong> ${user.admin ? 'Yes' : 'No'}</p>
                <p class="card-text mb-4"><strong>Member since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    `;

        userProfileContainer.innerHTML = userProfileCardHTML + orderInfoCardHTML;
    }

    function showLogoutMessage(message) {
        logoutAlert.textContent = message;
        logoutAlert.classList.remove('hidden');
        setTimeout(() => {
            logoutAlert.classList.add('hidden');
            window.location.href = '../auth/login.php';
        }, 1000);
    }

    function handleLogout() {
        fetch(`https://microbeecomputers.lk/api/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.removeItem('authToken');
                    showLogoutMessage('Logout successful!');
                } else {
                    console.error('Error logging out:', data.message);
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
            });
    }

    if (authToken) {
        document.querySelectorAll('.auth a[href*="login"], .auth a[href*="register"]').forEach(button => {
            button.style.display = 'none';
        });

        fetch(`https://microbeecomputers.lk/api/user/details`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(async response => {
                hideLoadingBar();
                if (response.status === 401 || response.status === 403) {
                    const data = await response.json();
                    if (data.error === 'TokenExpired' || response.status === 403) {
                        handleTokenExpiration();
                    } else {
                        throw new Error('Unauthorized access');
                    }
                } else if (!response.ok) {
                    throw new Error('Error fetching user profile');
                } else {
                    return response.json();
                }
            })
            .then(data => {
                const { email, admin } = data;
                if (email) {
                    const firstLetter = email.charAt(0).toUpperCase();
                    document.querySelector('.avatar.placeholder span').textContent = firstLetter;
                }

                if (admin) {
                    document.getElementById('user-profile-dropdown').style.display = 'block';
                    document.getElementById('admin-profile-dropdown').style.display = 'block';
                } else {
                    document.getElementById('user-profile-dropdown').style.display = 'block';
                    document.getElementById('admin-profile-dropdown').style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
            });

        logoutButton.addEventListener('click', function (event) {
            event.preventDefault();
            localStorage.removeItem('authToken');
            showLogoutMessage('Logout successful!');
        });
    } else {
        document.querySelector('.avatar.placeholder').style.display = 'none';
        document.getElementById('user-profile-dropdown').style.display = 'none';
        document.getElementById('admin-profile-dropdown').style.display = 'none';
    }

    fetchUserProfile();

    const categories = ['casing', 'coolers', 'cpu', 'gpu', 'monitor', 'motherboards', 'powersupply', 'ram', 'storage', 'ups'];
    const sidePanel = document.getElementById('sidePanel');
    const menuToggle = document.getElementById('menuToggle');
    const closePanel = document.getElementById('closePanel');
    const categoryList = document.getElementById('categoryList');

    sidePanel.style.overflowY = 'auto';

    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = "side-panel-li";
        li.innerHTML = `<a href="../products/${category}.php" class="side-panel-a">${category}</a>`;
        categoryList.appendChild(li);
    });

    menuToggle.addEventListener('click', function () {
        sidePanel.classList.remove('-translate-x-full');
    });

    closePanel.addEventListener('click', function () {
        sidePanel.classList.add('-translate-x-full');
    });
});

function redirectToProductPage(productId) {
    window.location.href = `../products/products_info/product-info.php?pro_id=${productId}`;
}