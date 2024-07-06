const { Schema, model } = require('mongoose');

const cartItemSchema = new Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: false },
    quantity: { type: Number, required: true },
});

const CartItem = model('CartItem', cartItemSchema);

module.exports = {
    CartItem
}