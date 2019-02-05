/* eslint no-console: off */
/* eslint no-eval: off */
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
const Stream = require('stream');

require('dotenv').config({ path: path.join(__dirname, '/../../.env') });

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

const Book = require('../models/Book');
const Review = require('../models/Review');

const loadBooks = () => new Promise(async (resolve, reject) => {
  console.log('Loading "books"');
  try {
    await Book.deleteMany({});
    const stream = fs.createReadStream('./src/data/books.json');
    const outstream = new Stream();
    outstream.readable = true;
    outstream.writable = true;

    const rl = readline.createInterface({
      input: stream,
      output: outstream,
      terminal: false,
    });

    let buffer = [];
    rl.on('line', async (line) => {
      const result = JSON.parse(JSON.stringify(eval(`(${line})`)));
      if (result.asin && (result.title || result.reviewerID)) {
        buffer.push(result);
        if (buffer.length === 1000) {
          await Book.insertMany(buffer);
          const booksCount = await Book.countDocuments();
          if (booksCount >= 10000) {
            return rl.close();
          }
          buffer = [];
        }
      }
      return false;
    });

    rl.on('close', async () => {
      resolve(true);
    });
  } catch (err) {
    reject(console.log(err));
  }
});

const loadReviews = () => new Promise(async (resolve, reject) => {
  console.log('Loading "reviews"');
  try {
    await Review.deleteMany({});
    const stream = fs.createReadStream('./src/data/reviews.json');
    const outstream = new Stream();
    outstream.readable = true;
    outstream.writable = true;

    const rl = readline.createInterface({
      input: stream,
      output: outstream,
      terminal: false,
    });

    const books = await Book.find({});
    const booksAsin = books.map(book => book.asin);

    let buffer = [];
    let processed = 0;
    rl.on('line', async (line) => {
      const result = JSON.parse(JSON.stringify(eval(`(${line})`)));
      processed += 1;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(
        `Current progress: [Processed: ${processed}]`,
      );
      if (result.asin && booksAsin.includes(result.asin) && result.reviewerID) {
        buffer.push(result);
        if (buffer.length === 1000) {
          await Review.insertMany(buffer);
          buffer = [];
        }
      }
      return false;
    });

    rl.on('close', async () => {
      await Review.insertMany(buffer);
      const count = await Review.countDocuments();
      console.log('\nAll results done');
      console.log(`${count} reviews where added`);
      console.log('----------------------------------------------------------------------------');
      resolve(true);
    });
  } catch (err) {
    reject(console.log(err));
  }
});

const run = async () => {
  await loadBooks();
  await loadReviews();
  return process.exit();
};

run();
