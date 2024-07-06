const { Schema, model } = require('mongoose');

const prodcutsSchema = new Schema({
    pro_id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    discountRate: { type: Number, required: false, default: 0 },
    category: { type: String, required: true },
    imageUrl: { type: String, required: false },
    description: { type: String, required: true },
    features: { type: Array, required: false },
    inStock: { type: Boolean, required: true, default: false }
});

const Products = model('products', prodcutsSchema);

module.exports = {
    Products
}