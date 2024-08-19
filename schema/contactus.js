const { Schema, model } = require('mongoose');

const ContactSchema = new Schema({
    cId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true }
});

const ContactUs = model('contactus', ContactSchema);

module.exports = {
    ContactUs
}