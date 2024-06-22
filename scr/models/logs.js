
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user: { type: String,  required: true },
    ip: { type: String },
    //timestamp: { type: Date, default: Date.now },
    timestamp: { type: Date },
    level: { type: String, required: false  },
    message:  { type: String, required: false  },
    additionalData:  { type: Object }
});
/*
logSchema.pre('save', function (next) {
    if (!this.timestamp) {
        this.timestamp = Date.now();
    }
    next();
});
*/
module.exports = mongoose.model('logs', logSchema);