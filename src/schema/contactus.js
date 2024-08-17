const { Schema, model } = require('mongoose');

const ContactSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true }
});

const ContactUs = model('contactus', ContactSchema);

module.exports = {
    ContactUs
}