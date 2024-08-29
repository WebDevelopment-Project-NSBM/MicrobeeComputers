<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Product</title>
    <link rel="icon" type="image/png" href="../logo/MicroBee Comupters.png">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link href="../styles/style.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="./add-product.js"></script>
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
                    <a href="../admin/order-panel.php" class="btn btn-home mr-2">Orders</a>
                    <a href="../admin/product-management.php" class="btn btn-home mr-2">Products</a>
                    <a href="../admin/contactusview.php" class="btn btn-home mr-2">ContactUs</a>
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

    <div id="logoutAlert" class="hidden fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2">
        Logout successful!
    </div>

    <div id="productAdded" class="hidden fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2">
        New product added successfully!
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

    <div id="adminContent" class="container mx-auto mt-5">
        <div class="container mx-auto mt-5">
            <h2 class="text-center text-3xl font-bold mb-6">Add Product</h2>
            <form id="addProductForm" enctype="multipart/form-data">
                <div class="form-group mb-4">
                    <label for="name">Name</label>
                    <input type="text" class="input input-bordered w-full" id="name" name="name" required>
                </div>
                <div class="form-group mb-4">
                    <label for="price">Price</label>
                    <input type="number" class="input input-bordered w-full" id="price" name="price" required>
                </div>
                <div class="form-group mb-4">
                    <label for="discountRate">Discount Rate</label>
                    <input type="number" class="input input-bordered w-full" id="discountRate" name="discountRate"
                        required>
                </div>
                <div class="form-group mb-4">
                    <label for="category">Category</label>
                    <select class="select select-bordered w-full bg-white" id="category" name="category" required>
                        <option value="cpu">CPU</option>
                        <option value="motherboards">Motherboards</option>
                        <option value="ram">RAM</option>
                        <option value="gpu">GPU</option>
                        <option value="storage">Storage</option>
                        <option value="monitor">Monitor</option>
                        <option value="casing">Casing</option>
                        <option value="powersupply">Power Supply</option>
                        <option value="coolers">Coolers</option>
                        <option value="ups">UPS</option>
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label for="image">Image</label><br>
                    <input type="file" class="file-input file-input-bordered file-input-warning w-full max-w-xs"
                        id="image" name="image" required>
                </div>
                <div class="form-group mb-4">
                    <label for="description">Description</label>
                    <textarea class="textarea textarea-bordered w-full bg-white" id="description" name="description"
                        required></textarea>
                </div>
                <div class="form-group mb-4">
                    <label for="features">Features (comma separated)</label>
                    <input type="text" class="input input-bordered w-full" id="features" name="features">
                </div>
                <div class="form-group mb-4 flex items-center">
                    <label for="inStock" class="mr-2">In Stock</label>
                    <input type="checkbox" class="checkbox modal-box-checkbox-outline" id="inStock" name="inStock">
                </div>
                <div class="form-group mb-4">
                    <label for="latest">Latest</label>
                    <div class="relative">
                        <input type="text" class="input input-bordered w-full bg-white" id="latest" name="latest"
                            required>
                        <i class="fas fa-calendar-alt absolute top-2 right-2 cursor-pointer" id="calendarIcon"></i>
                    </div>
                </div>
                <div class="form-group mb-4">
                    <label for="popularity">Popularity</label>
                    <select class="select select-bordered w-full bg-white" id="popularity" name="popularity" required>
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Add Product</button>
            </form>
        </div>
    </div>

    <script>
        $(document).ready(function () {
            $("#latest").datepicker({
                dateFormat: "yy-mm-dd"
            });

            $("#calendarIcon").on("click", function () {
                $("#latest").datepicker("show");
            });
        });
    </script>
</body>

</html>