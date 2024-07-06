const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path = require('path');
const data = require('../product_data/cpu/data.json');
const config = require('../../config.json')
const { CartItems } = require('../schema/cartItems')
const { Users } = require('../schema/users')

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

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', (req, res) => {
    res.json(data);
});

app.post('/api/cart/add', async (req, res) => {
    const { id, name, category, price, imageUrl, quantity } = req.body;

    try {
        let cartItem = await CartItems.findOne({ id });

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cartItem = new CartItems({
                id,
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

app.delete('/api/cart/remove/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        await CartItems.deleteOne({ id: productId });
        res.status(200).send('Item removed from cart');
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).send('Error removing item from cart');
    }
});

app.put('/api/cart/update/:productId', async (req, res) => {
    const productId = req.params.productId;
    const { operation } = req.body;

    try {
        const cartItem = await CartItems.findOne({ id: productId });

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
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Error during login');
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
