const { Schema, model } = require('mongoose');

const cartItemSchema = new Schema({
    pro_id: { type: Number, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: false },
    quantity: { type: Number, required: true },
});

const CartItems = model('CartItems', cartItemSchema);

module.exports = {
    CartItems
}