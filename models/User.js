const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    guildID: { type: String, required: true },
    userID: { type: String, required: true },
    // Economy
    money: { type: Number, default: 500 },
    bank: { type: Number, default: 0 },
    lastWork: { type: Number, default: 0 },
    // Ranking
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    voiceXP: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);