const { Schema, model } = require('mongoose');

const sessionSchema = new Schema({
    sessionId: { type: String, required: true, unique: true },
    data: { type: Map, of: String },
    createdAt: { type: Date, default: Date.now, expires: 3600 }
});

const Session = model('sessions', sessionSchema);
module.exports = { Session };