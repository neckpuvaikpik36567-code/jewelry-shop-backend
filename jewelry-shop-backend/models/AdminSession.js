const mongoose = require('mongoose');

const adminSessionSchema = new mongoose.Schema({
  adminKey: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 дней
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminSession', adminSessionSchema);