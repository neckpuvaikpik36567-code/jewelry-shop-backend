const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название товара обязательно'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Цена обязательна'],
    min: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['rings', 'earrings', 'bracelets', 'necklaces'],
    required: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);