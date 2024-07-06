const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('../../config.json');
const { CartItems } = require('../schema/cartItems');
const { Users } = require('../schema/users');
const { Products } = require('../schema/products');

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
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', async (req, res) => {
    try {
        const products = await Products.find();
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Error fetching products');
    }
});

app.post('/api/cart/add', async (req, res) => {
    const { pro_id, name, category, price, imageUrl, quantity } = req.body;

    try {
        let cartItem = await CartItems.findOne({ pro_id });

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cartItem = new CartItems({
                pro_id,
                name,
                category,
                price,
                imageUrl,
                quantity,
            });
        }

        await cartItem.save();
        res.status(201).send('CartItem added successfully');
    } catch (err) {
        console.error('Error saving cart item:', err);
        res.status(500).send('Error saving cart item');
    }
});

app.get('/api/cart/items', async (req, res) => {
    try {
        const cartItems = await CartItems.find();
        res.status(200).json(cartItems);
    } catch (err) {
        console.error('Error fetching cart items:', err);
        res.status(500).send('Error fetching cart items');
    }
});

app.delete('/api/cart/remove/:pro_id', async (req, res) => {
    const pro_id = req.params.pro_id;

    try {
        await CartItems.deleteOne({ pro_id });
        res.status(200).send('Item removed from cart');
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).send('Error removing item from cart');
    }
});

app.put('/api/cart/update/:pro_id', async (req, res) => {
    const pro_id = req.params.pro_id;
    const { operation } = req.body;

    try {
        const cartItem = await CartItems.findOne({ pro_id });

        if (!cartItem) {
            return res.status(404).send('Cart item not found');
        }

        if (operation === 'increase') {
            cartItem.quantity++;
        } else if (operation === 'decrease') {
            if (cartItem.quantity > 1) {
                cartItem.quantity--;
            } else {
                return res.status(400).send('Quantity cannot be less than 1');
            }
        } else {
            return res.status(400).send('Invalid operation');
        }

        await cartItem.save();
        res.status(200).send('Cart item quantity updated successfully');
    } catch (err) {
        console.error('Error updating cart item:', err);
        res.status(500).send('Error updating cart item');
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email, password });
        if (user) {
            res.status(200).json({ success: true, userId: user._id });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, message: 'Error during login' });
    }
});

app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            res.status(400).send('User already exists');
        } else {
            const newUser = new Users({ email, password });
            await newUser.save();
            res.status(201).send('User registered successfully');
        }
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Error during registration');
    }
});

app.get('/api/user/profile', async (req, res) => {
    const userId = req.query.userId;

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

app.post('/api/logout', (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
