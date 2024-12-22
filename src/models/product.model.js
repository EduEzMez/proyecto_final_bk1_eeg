const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    stock: { type: Number, default: 0 },
    category: { type: String, require: true}
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
