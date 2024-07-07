document.addEventListener("DOMContentLoaded", function () {
    const userProfileContainer = document.getElementById('userProfileContainer');
    const logoutButton = document.getElementById('logoutButton');
    const userId = localStorage.getItem('userId');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const content = document.getElementById('content');

    if (!userId) {
        window.location.href = '../auth/auth.html?modal=login';
        return;
    }

    function showLoading() {
        loadingSpinner.classList.add('active');
    }

    function hideLoading() {
        loadingSpinner.classList.remove('active');
        content && content.classList.add('show');
    }

    function fetchUserProfile() {
        showLoading();
        fetch(`http://localhost:3000/api/user/profile?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                if (data.email) {
                    renderUserProfile(data);
                } else {
                    userProfileContainer.innerHTML = '<p>Error fetching user profile.</p>';
                }
            })
            .catch(error => {
                hideLoading();
                console.error('Error fetching user profile:', error);
                userProfileContainer.innerHTML = '<p>Error fetching user profile.</p>';
            });
    }

    function renderUserProfile(user) {
        const userHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${user.email || 'User Profile'}</h5>
                    <p class="card-text"><strong>Email:</strong> ${user.email}</p>
                    <p class="card-text"><strong>Admin:</strong> ${user.admin ? 'Yes' : 'No'}</p>
                    <p class="card-text"><strong>Member since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `;
        userProfileContainer.innerHTML = userHTML;
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

    logoutButton.addEventListener('click', handleLogout);

    fetchUserProfile();

    logoutButton.href = '#';
    logoutButton.classList.add('btn', 'btn-warning', 'mr-2');
    logoutButton.id = 'logoutButton';
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', function (event) {
        event.preventDefault();
        localStorage.removeItem('userId');
        window.location.href = '../auth/auth.html?modal=login';
    });

    if (userId) {
        document.querySelectorAll('.auth a[href*="login"], .auth a[href*="register"]').forEach(button => {
            button.style.display = 'none';
        });
        document.querySelector('.auth').appendChild(logoutButton);
    }
});
