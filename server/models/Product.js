import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['rings', 'earrings', 'necklaces', 'bracelets', 'other'],
    default: 'other'
  },
  material: {
    type: String,
    enum: ['gold', 'silver', 'platinum', 'other'],
    default: 'other'
  },
  gemstones: {
    type: [String],
    default: []
  },
  weight: {
    type: Number,
    default: 0
  },
  size: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Обновляем updatedAt при сохранении
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;