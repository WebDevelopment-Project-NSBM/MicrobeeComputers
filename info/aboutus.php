<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us</title>
    <link rel="icon" type="image/png" href="../logo/MicroBee Comupters.png">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="../styles/style.css" rel="stylesheet">
    <script src="aboutus.js"></script>
</head>

<body class="flex flex-col min-h-screen">
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
                    <a href="../auth/login.php" class="btn btn-home mr-2">
                        <i class="fas fa-sign-in-alt mr-1"></i> Log In
                    </a>
                    <a href="../auth/register.php" class="btn btn-home mr-2">
                        <i class="fas fa-user-plus mr-1"></i> Register
                    </a>
                    <a href="../user/cart.php" class="btn btn-cart btn-warning mr-2">
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

    <nav class="bg-gray-800 text-white py-2">
        <div class="container mx-auto">
            <a href="#" class="text-white">Home</a> / <a href="#" class="text-white nav-g-cat">About Us</a>
        </div>
    </nav>

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

    <main class="flex-grow container mx-auto mt-10 flex flex-col items-center">
        <div class="w-full md:w-4/5 lg:w-5/5 p-2 product-item mb-4">
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">Our Vision</h2>
                    <p>At MicroBee Computers, we envision a world where technology is seamlessly integrated into
                        everyday life, enhancing experiences and fostering innovation. Our goal is to be the leading
                        provider of cutting-edge computer parts and accessories, enabling our customers to build the
                        tech of their dreams.</p>
                </div>
            </div>
        </div>

        <div class="w-full md:w-4/5 lg:w-5/5 p-2 product-item mb-4">
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">Our Mission</h2>
                    <p>Our mission is to deliver the highest quality products and exceptional customer service. We
                        strive to empower our customers with the knowledge and tools they need to create, innovate, and
                        excel. By providing a vast selection of top-tier computer parts, we aim to be the go-to source
                        for tech enthusiasts and professionals alike.</p>
                </div>
            </div>
        </div>

        <div class="w-full md:w-4/5 lg:w-5/5 p-2 product-item mb-4">
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">Our Legacy</h2>
                    <p>Founded in 2024, MicroBee Computers has grown from a small startup to a trusted name in the tech
                        industry. Over the years, we have consistently provided reliable products and services, earning
                        the loyalty of a diverse customer base. Our legacy is built on a foundation of integrity,
                        innovation, and a commitment to excellence.</p>
                </div>
            </div>
        </div>

        <div class="w-full md:w-4/5 lg:w-5/5 p-2 product-item mb-4">
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">The Future</h2>
                    <p>As we look to the future, MicroBee Computers is committed to staying at the forefront of
                        technological advancements. We are constantly expanding our product range, exploring new
                        innovations, and enhancing our customer experience. Our dedication to progress ensures that we
                        will continue to be a trusted partner in your tech journey for years to come.</p>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer footer-center bg-base-200 text-base-content rounded p-10">
        <nav class="grid grid-flow-col gap-4">
            <a class="link link-footer" href="./aboutus.php">About Us</a>
            <a class="link link-footer" href="./contactus.php">Contact Us</a>
            <a class="link link-footer" href="./privacypolicy.php">Privacy Policy</a>
            <a class="link link-footer" href="./faq.php">FAQ</a>
        </nav>
        <nav>
            <div class="grid grid-flow-col gap-4">
                <a href="#"><i class="fa-brands fa-youtube footer-icons"></i></a>
                <a href="#"><i class="fa-brands fa-facebook footer-icons"></i></a>
                <a href="#"><i class="fa-brands fa-instagram footer-icons"></i></a>
            </div>
        </nav>
        <aside>
            <p>Copyright © 2024 - All right reserved by NSBM 23.2 Students Group S</p>
        </aside>
    </footer>
</body>

</html>