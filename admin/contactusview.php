<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us Admin View</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="../styles/style.css" rel="stylesheet">
    <script src="./contactusview.js"></script>
</head>

<body>
    <div id="loadingBar" class="loading-bar"></div>
    <header class="relative w-full">
        <div class="bg-yellow-500 py-2 hidden md:block">
            <div class="container-fluid mx-auto flex justify-center md:justify-center space-x-4">
                <a class="link link-secondary text-black" href="../products/coolers.php">Coolers</a>
                <a class="link link-secondary text-black" href="../products/motherboards.php">MotherBoards</a>
                <a class="link link-secondary text-black" href="../products/powersupply.php">PowerSupplys</a>
                <a class="link link-secondary text-black" href="../products/casing.php">Casings</a>
                <a class="link link-secondary text-black" href="../products/storage.php">Storages</a>
            </div>
        </div>
        <div class="container-fluid mx-auto flex flex-wrap justify-center items-center mt-4 md:mt-0">
            <div class="flex items-center flex-wrap justify-center w-full">
                <div class="logo mr-4">
                    <img src="../logo/MicroBee Comupters.png" alt="MicroBee Computers" class="logo-img">
                </div>
                <div class="search-bar flex items-center w-full md:w-auto mx-4">
                    <div class="menu-bar mr-4 cursor-pointer" role="button" aria-label="Toggle Menu">
                        <i id="menuToggle" class="fas fa-bars text-2xl menu-bar-icon"></i>
                    </div>
                    <input type="text" placeholder="Search" class="ser-col w-full md:w-auto" aria-label="Search" />
                    <i class="fas fa-search ml-2" role="button" aria-label="Search"></i>

                    <div id="searchDropdown"
                        class="absolute bg-white border border-gray-300 w-full mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto hidden search-dropdown">
                    </div>
                </div>
                <div class="auth flex items-center space-x-2">
                    <a href="../home.php" class="btn btn-home mr-2">Home</a>
                    <a href="../admin/user-management.php" class="btn btn-home mr-2">Users</a>
                    <a href="../admin/add-product.php" class="btn btn-home mr-2">Add Products</a>
                    <a href="../admin/product-management.php" class="btn btn-home mr-2">Products</a>
                    <a href="../admin/order-panel.php" class="btn btn-home mr-2">Orders</a>
                    <a href="../auth/login.php" class="btn btn-home mr-2">
                        <i class="fas fa-sign-in-alt mr-1"></i> Log In
                    </a>
                    <a href="../auth/register.php" class="btn btn-home mr-2">
                        <i class="fas fa-user-plus mr-1"></i> Register
                    </a>
                    <a href="../cart/cart.php" class="btn btn-cart btn-warning mr-2">
                        <i class="fas fa-shopping-cart"></i>
                    </a>
                    <div class="dropdown relative">
                        <div tabindex="0" role="button" class="avatar placeholder">
                            <div
                                class="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                                <span></span>
                            </div>
                        </div>
                        <ul tabindex="0"
                            class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow absolute">
                            <li id="user-profile-dropdown" style="display: none;"><a
                                    href="../user/user-profile.php">Profile</a></li>
                            <li id="admin-profile-dropdown" style="display: none;"><a
                                    href="../admin/user-management.php">Admin Profile</a></li>
                            <li><a id="logoutButton" href="#">Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <div id="logoutAlert" class="hidden fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2">
        Logout successful!
    </div>

    <!-- Side Panel -->
    <div id="sidePanel" class="side-panel fixed top-0 left-0 h-full w-64 transform -translate-x-full z-50">
        <div class="flex justify-end p-4">
            <i id="closePanel" class="fas fa-times text-2xl cursor-pointer side-panel-close"></i>
        </div>
        <nav class="p-4">
            <ul id="categoryList" class="side-panel-ul">
                <!-- Categories will be dynamically inserted here -->
            </ul>
        </nav>
    </div>

    <div id="viewContactUsModal" class="viewContactUsModal custom-hidden">
        <div class="viewContactUsModal-content">
            <span id="closeViewContactUsModal" class="viewContactUsModal-close">&times;</span>
            <div id="modalMessageContent"></div>
        </div>
    </div>

    <div id="adminContent" class="container mx-auto mt-5">
        <div class="container mx-auto mt-5">
            <div id="contactUsContainer" class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
            <div id="messageDetailContainer" class="container mx-auto mt-5"></div>

            <nav aria-label="Page navigation" class="mt-4 flex justify-center">
                <ul class="pagination justify-center" id="userPaginationContainer">
                    <!-- Pagination buttons will be inserted here -->
                </ul>
            </nav>
        </div>
    </div>
</body>

</html>