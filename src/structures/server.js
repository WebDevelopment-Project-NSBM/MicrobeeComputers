const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path = require('path');
const data = require('../product_data/cpu/data.json');
const config = require('../../config.json')

mongoose.set('strictQuery', true);
mongoose.connect(config.mongodbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const cartItemSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    imageUrl: String,
    quantity: Number,
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', (req, res) => {
    res.json(data);
});

app.post('/api/cart/add', async (req, res) => {
    const { id, name, price, imageUrl, quantity } = req.body;
    console.log(id)

    try {
        let cartItem = await CartItem.findOne({ id });

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cartItem = new CartItem({
                id,
                name,
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
        const cartItems = await CartItem.find();
        res.status(200).json(cartItems);
    } catch (err) {
        console.error('Error fetching cart items:', err);
        res.status(500).send('Error fetching cart items');
    }
});

app.delete('/api/cart/remove/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        await CartItem.deleteOne({ id: productId });
        res.status(200).send('Item removed from cart');
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).send('Error removing item from cart');
    }
});

app.put('/api/cart/update/:productId', (req, res) => {
    const productId = req.params.productId;
    const { operation } = req.body;

    CartItem.findOne({ id: productId })
        .then(cartItem => {
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

            cartItem.save()
                .then(() => {
                    res.status(200).send('Cart item quantity updated successfully');
                })
                .catch(err => {
                    console.error('Error updating cart item:', err);
                    res.status(500).send('Error updating cart item');
                });
        })
        .catch(err => {
            console.error('Error finding cart item:', err);
            res.status(500).send('Error finding cart item');
        });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
