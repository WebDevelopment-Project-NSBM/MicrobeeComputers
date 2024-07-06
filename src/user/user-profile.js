document.addEventListener("DOMContentLoaded", function () {
    const userProfileContainer = document.getElementById('userProfileContainer');
    const logoutButton = document.getElementById('logoutButton');
    const userId = localStorage.getItem('userId'); // Get the user ID from localStorage

    if (!userId) {
        window.location.href = '../auth/auth.html?modal=login'; // Redirect to login if user is not logged in
        return;
    }

    function fetchUserProfile() {
        fetch(`${config.hosturl}/api/user/profile?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.email) {
                    renderUserProfile(data);
                } else {
                    userProfileContainer.innerHTML = '<p>Error fetching user profile.</p>';
                }
            })
            .catch(error => {
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
        fetch(`${config.hosturl}/api/logout`, {
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
});
