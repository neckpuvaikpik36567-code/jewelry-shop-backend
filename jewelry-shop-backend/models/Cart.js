const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // один-к-одному
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

// Виртуальное поле для подсчета общей суммы
cartSchema.virtual('totalAmount').get(async function() {
  await this.populate('items.product');
  let total = 0;
  this.items.forEach(item => {
    if (item.product) {
      total += item.product.price * item.quantity;
    }
  });
  return total;
});

module.exports = mongoose.model('Cart', cartSchema);