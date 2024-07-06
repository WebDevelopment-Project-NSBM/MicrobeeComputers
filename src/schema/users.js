const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: false, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Users = model('Users', userSchema);

module.exports = {
    Users
};