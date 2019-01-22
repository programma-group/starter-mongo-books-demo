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

async function loadBooks() {
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
      const book = JSON.parse(JSON.stringify(eval(`(${line})`)));
      if (book.title && book.asin) {
        buffer.push(book);
        if (buffer.length === 1000) {
          await Book.insertMany(buffer);
          buffer = [];
        }
      }
    });

    rl.on('close', async () => {
      await Book.insertMany(buffer);
      console.log('All books done');
      return process.exit();
    });
  } catch (err) {
    console.log(err);
  }
}

loadBooks();
