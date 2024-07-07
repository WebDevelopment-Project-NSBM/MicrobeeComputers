const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Client, Server, UploadFilesCommand } = require('nextcloud-node-client');

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

const server = new Server({
    basicAuth: {
        password: config.nextcloudPassword,
        username: config.nextcloudUsername,
    },
    url: config.nextcloudUrl,
});
const client = new Client(server);

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/api/products', async (req, res) => {
    try {
        const products = await Products.find();
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

app.post('/api/products/add', upload.single('image'), async (req, res) => {
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
            const fileName = path.parse(req.file.originalname).name;
            const fileExt = path.parse(req.file.originalname).ext;
            const remoteFilePath = `/uploads/${fileName}${fileExt}`;
            imageUrl = await uploadToNextcloud(req.file.buffer, remoteFilePath, req.file.originalname);
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

app.put('/api/products/edit/:id', upload.single('image'), async (req, res) => {
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
            const fileName = path.parse(req.file.originalname).name;
            const fileExt = path.parse(req.file.originalname).ext;
            const remoteFilePath = `/uploads/${fileName}${fileExt}`;
            imageUrl = await uploadToNextcloud(req.file.buffer, remoteFilePath, req.file.originalname);
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

app.delete('/api/products/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Products.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ success: false, message: 'Error deleting product' });
    }
});

async function uploadToNextcloud(fileBuffer, remoteFilePath, fileName) {
    try {
        console.log('Uploading to Nextcloud:', remoteFilePath);

        const tempFilePath = path.join(__dirname, 'tmp', fileName);
        if (!fs.existsSync(path.join(__dirname, 'tmp'))) {
            fs.mkdirSync(path.join(__dirname, 'tmp'));
        }
        fs.writeFileSync(tempFilePath, fileBuffer);

        const files = [
            {
                sourceFileName: tempFilePath,
                targetFileName: remoteFilePath
            },
        ];

        const uc = new UploadFilesCommand(client, { files });
        await uc.execute();

        console.log(`File uploaded to Nextcloud: ${remoteFilePath}`);

        const file = await client.getFile(remoteFilePath);
        const createShare = { fileSystemElement: file };
        const share = await client.createShare(createShare);
        const streamlink = share.url + "/download/" + fileName;

        fs.unlinkSync(tempFilePath);

        return streamlink;
    } catch (error) {
        console.error(`Error uploading to Nextcloud: ${error}`);
        throw error;
    }
}

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
    const { email, password, admin } = req.body;

    try {
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'User already exists' });
        } else {
            const newUser = new Users({ email, password, admin });
            await newUser.save();
            res.status(201).json({ success: true, message: 'User registered successfully' });
        }
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ success: false, message: 'Error during registration' });
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

app.delete('/api/user/delete/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        await Users.findByIdAndDelete(userId);
        res.status(200).send('User deleted successfully');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Error deleting user');
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users');
    }
});

app.put('/api/user/edit/:userId', async (req, res) => {
    const userId = req.params.userId;
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
