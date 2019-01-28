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
  },
  categories: [[String]],
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

bookSchema.plugin(mongodbErrorHandler);

bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: 'asin',
  foreignField: 'asin',
});

module.exports = mongoose.model('Book', bookSchema);
