const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const { Schema } = mongoose;
mongoose.Promise = global.Promise;

const bookSchema = new Schema({
  asin: {
    type: String,
    unique: true,
    require: 'Please supply an asin',
  },
  title: {
    type: String,
    trim: true,
    require: 'Please supply a title',
  },
  price: Number,
  imUrl: String,
  related: {},
  salesRank: {},
  brand: {
    type: String,
    trim: true,
    require: 'Please supply a brand',
  },
  categories: [[String]],
});

bookSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Book', bookSchema);
