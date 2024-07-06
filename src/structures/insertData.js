const mongoose = require('mongoose');
const config = require('../../config.json');
const { Products } = require('../schema/products');

mongoose.set('strictQuery', true);
mongoose.connect(config.mongodbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    console.log('Connected to MongoDB');

    const products = [
        {
            pro_id: 1,
            name: "Product 1",
            price: 1000,
            discountRate: 10,
            category: "ram",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 1",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 2,
            name: "Product 2",
            price: 2000,
            discountRate: 15,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 2",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 3,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 4,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 5,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 6,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 7,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 8,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 9,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 10,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 11,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 12,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 13,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 14,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 15,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 16,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 17,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 18,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 19,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        },
        {
            pro_id: 20,
            name: "Product 3",
            price: 3000,
            discountRate: 20,
            category: "cpu",
            imageUrl: "../products_images/cpu/2200G-500x500-1.jpg",
            description: "description for Product 3",
            features: ["Feature 1", "Feature 2"],
            inStock: true
        }
    ];

    try {
        await Products.insertMany(products);
        console.log('Products inserted successfully');
    } catch (err) {
        console.error('Error inserting products:', err);
    } finally {
        mongoose.connection.close();
    }
});