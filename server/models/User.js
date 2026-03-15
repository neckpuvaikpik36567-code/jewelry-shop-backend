import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  phone: String,
  address: String,
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

export default User;