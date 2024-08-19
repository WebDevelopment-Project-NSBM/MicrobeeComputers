const { Schema, model } = require('mongoose');

const cartItem = new Schema({
    pro_id: { type: Number, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: false },
    quantity: { type: Number, required: true },
});

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: false, default: false },
    cartItems: [cartItem],
    createdAt: { type: Date, default: Date.now }
});

const Users = model('Users', userSchema);

module.exports = {
    Users
};