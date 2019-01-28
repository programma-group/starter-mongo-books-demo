const mongoose = require('mongoose');

const Book = mongoose.model('Book');

exports.getBooks = async (req, res) => {
  const page = req.query.page || 1;
  const limit = parseInt((req.query.limit || 10), 10);
  const skip = (page * limit) - limit;

  const booksPromise = Book.find().skip(skip).limit(limit).populate('reviews');
  const booksCountPromise = Book.countDocuments();

  const [books, count] = await Promise.all([booksPromise, booksCountPromise]);

  return res.json({ books, count });
};
