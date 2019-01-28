const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const { Schema } = mongoose;
mongoose.Promise = global.Promise;

const reviewSchema = new Schema({
  reviewerID: {
    type: String,
    require: 'Please supply a reviewer ID',
  },
  asin: {
    type: String,
    require: 'Please supply a book',
  },
  reviewerName: {
    type: String,
    require: 'Please supply a reviewer name',
  },
  helpful: [Number],
  reviewText: {
    type: String,
    require: 'Please supply a review text',
  },
  overall: {
    type: Number,
    require: 'Please supply a overall score',
  },
  summary: {
    type: String,
    trim: true,
    require: 'Please supply a summary',
  },
  unixReviewTime: Number,
  reviewTime: String,
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

reviewSchema.plugin(mongodbErrorHandler);

reviewSchema.virtual('book', {
  ref: 'Book',
  localField: 'asin',
  foreignField: 'asin',
});

module.exports = mongoose.model('Review', reviewSchema);
