const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require('./config.json');
const { Users } = require('./schema/users');
const { Products } = require('./schema/products');
const { ContactUs } = require('./schema/contactus');

mongoose.set('strictQuery', true);
mongoose.connect(config.mongodbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const app = express();
app.use(cors());
app.use(express.json());

function generateToken(user) {
    return jwt.sign({ userId: user._id, admin: user.admin }, 'microbeewebprivatekeynewsecretkey2024newkeys', { expiresIn: '7d' });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, 'microbeewebprivatekeynewsecretkey2024newkeys', (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const category = req.body.category;
        const uploadPath = path.join(__dirname, `./products_images/${category}`);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });


app.get('/api/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ success: false, message: 'Query is required' });
    }

    try {
        const products = await Products.find({
            name: { $regex: query, $options: 'i' } // case-insensitive search
        });

        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching search results:', err);
        res.status(500).json({ success: false, message: 'Error fetching search results' });
    }
});

app.post('/api/contactus', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        const newContact = new ContactUs({
            name,
            email,
            message,
        });

        await newContact.save();
        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('Error saving contact message:', err);
        res.status(500).json({ success: false, message: 'Error saving message' });
    }
});

app.get('/api/products', async (req, res) => {
    const { category, sortBy } = req.query;

    let filter = {};
    if (category) {
        filter.category = category;
    }

    let sort = {};
    switch (sortBy) {
        case 'popularity':
            sort.popularity = -1;
            break;
        case 'latest':
            sort.latest = -1;
            break;
        case 'priceLowToHigh':
            sort.price = 1;
            break;
        case 'priceHighToLow':
            sort.price = -1;
            break;
        default:
            sort = {};
            break;
    }

    try {
        const products = await Products.find(filter).sort(sort);
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Error fetching products');
    }
});

app.get('/api/products/highest-pro-id', async (req, res) => {
    try {
        const lastProduct = await Products.findOne().sort({ pro_id: -1 });
        const highestProId = lastProduct ? lastProduct.pro_id : 0;
        res.status(200).json({ highestProId });
    } catch (err) {
        console.error('Error fetching highest pro_id:', err);
        res.status(500).send('Error fetching highest pro_id');
    }
});

app.post('/api/products/add', upload.single('image'), authenticateToken, async (req, res) => {
    const { name, price, discountRate, category, description, features, inStock, latest, popularity } = req.body;

    const allowedCategories = ['cpu', 'motherboards', 'ram', 'gpu', 'storage', 'monitor', 'casing', 'powersupply', 'coolers', 'ups'];
    if (!allowedCategories.includes(category.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    if (![1, 2, 3].includes(parseInt(popularity))) {
        return res.status(400).json({ success: false, message: 'Invalid popularity' });
    }

    try {
        const lastProduct = await Products.findOne().sort({ pro_id: -1 });
        const pro_id = lastProduct ? lastProduct.pro_id + 1 : 1;

        let imageUrl = '';
        if (req.file) {
            imageUrl = `./products_images/${category}/${req.file.filename}`;
        }

        const newProduct = new Products({
            pro_id,
            name,
            price,
            discountRate,
            category,
            imageUrl,
            description,
            features: features.split(',').map(feature => feature.trim()),
            inStock: inStock === 'on',
            latest,
            popularity: parseInt(popularity)
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: 'Product added successfully' });
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ success: false, message: 'Error adding product' });
    }
});

app.put('/api/products/edit/:id', upload.single('image'), authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, price, discountRate, category, description, features, inStock, latest, popularity } = req.body;

    const allowedCategories = ['cpu', 'motherboards', 'ram', 'gpu', 'storage', 'monitor', 'casing', 'powersupply', 'coolers', 'ups'];
    if (!allowedCategories.includes(category.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    if (![1, 2, 3].includes(parseInt(popularity))) {
        return res.status(400).json({ success: false, message: 'Invalid popularity' });
    }

    try {
        let imageUrl = '';
        if (req.file) {
            imageUrl = `./products_images/${category}/${req.file.filename}`;
        }

        const updateFields = {
            name,
            price,
            discountRate,
            category,
            description,
            features: features.split(',').map(feature => feature.trim()),
            inStock: inStock === 'on',
            latest,
            popularity: parseInt(popularity)
        };

        if (imageUrl) {
            updateFields.imageUrl = imageUrl;
        }

        const updatedProduct = await Products.findByIdAndUpdate(id, updateFields, { new: true });
        res.status(200).json({ success: true, message: 'Product updated successfully', product: updatedProduct });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ success: false, message: 'Error updating product' });
    }
});

app.delete('/api/products/delete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await Products.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ success: false, message: 'Error deleting product' });
    }
});

app.post('/api/cart/add', authenticateToken, async (req, res) => {
    const { pro_id, name, category, price, imageUrl, quantity } = req.body;
    const userId = req.user.userId;

    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const existingCartItem = user.cartItems.find(item => item.pro_id === pro_id);

        if (existingCartItem) {
            existingCartItem.quantity += quantity;
        } else {
            user.cartItems.push({ pro_id, name, category, price, imageUrl, quantity });
        }

        await user.save();
        res.status(201).json({ success: true, message: 'Cart item added successfully' });
    } catch (err) {
        console.error('Error adding cart item:', err);
        res.status(500).json({ success: false, message: 'Error adding cart item' });
    }
});

app.get('/api/cart/items', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json(user.cartItems);
    } catch (err) {
        console.error('Error fetching cart items:', err);
        res.status(500).json({ success: false, message: 'Error fetching cart items' });
    }
});

app.delete('/api/cart/remove/:pro_id', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { pro_id } = req.params;

    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.cartItems = user.cartItems.filter(item => item.pro_id !== parseInt(pro_id));

        await user.save();
        res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).json({ success: false, message: 'Error removing item from cart' });
    }
});

app.put('/api/cart/update/:pro_id', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { pro_id } = req.params;
    const { operation } = req.body;

    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const cartItem = user.cartItems.find(item => item.pro_id === parseInt(pro_id));

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        if (operation === 'increase') {
            cartItem.quantity++;
        } else if (operation === 'decrease') {
            if (cartItem.quantity > 1) {
                cartItem.quantity--;
            } else {
                return res.status(400).json({ success: false, message: 'Quantity cannot be less than 1' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Invalid operation' });
        }

        await user.save();
        res.status(200).json({ success: true, message: 'Cart item quantity updated successfully' });
    } catch (err) {
        console.error('Error updating cart item:', err);
        res.status(500).json({ success: false, message: 'Error updating cart item' });
    }
});

app.post('/api/register', async (req, res) => {
    const { email, password, admin } = req.body;

    if (email.length >= 80 || password.length >= 40) {
        return res.status(400).json({ success: false, message: 'Email or password exceeds character limit' });
    }

    try {
        const existingUser = await Users.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        } else {
            const newUser = new Users({ email: email.toLowerCase(), password, admin });
            await newUser.save();
            res.status(201).json({ success: true, message: 'User registered successfully' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error during registration' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (email.length >= 80 || password.length >= 40) {
        return res.status(400).json({ success: false, message: 'Email or password exceeds character limit' });
    }

    try {
        const user = await Users.findOne({ email: email.toLowerCase(), password });
        if (user) {
            const token = generateToken(user);
            res.status(200).json({ success: true, token, admin: user.admin });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error during login' });
    }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const user = await Users.findById(userId);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Error fetching user profile');
    }
});

app.get('/api/user/details', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const user = await Users.findById(userId).select('email admin');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'An error occurred while fetching user details' });
    }
});

app.delete('/api/user/delete/:userId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        await Users.findByIdAndDelete(userId);
        res.status(200).send('User deleted successfully');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Error deleting user');
    }
});

app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users');
    }
});

app.put('/api/user/edit/:userId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { email, admin } = req.body;

    try {
        const user = await Users.findByIdAndUpdate(
            userId,
            { email, admin },
            { new: true, runValidators: true }
        );
        if (user) {
            res.status(200).json({ success: true, message: 'User updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
});

app.post('/api/logout', (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
