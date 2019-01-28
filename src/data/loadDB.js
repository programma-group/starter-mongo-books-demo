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

const loadData = (model, filename) => new Promise(async (resolve, reject) => {
  const hrstart = process.hrtime();
  console.log(`Loading "${filename}"`);
  try {
    await model.deleteMany({});
    const stream = fs.createReadStream(`./src/data/${filename}.json`);
    const outstream = new Stream();
    outstream.readable = true;
    outstream.writable = true;

    const rl = readline.createInterface({
      input: stream,
      output: outstream,
      terminal: false,
    });

    let buffer = [];
    let processed = 0;
    rl.on('line', async (line) => {
      processed += 1;
      const result = JSON.parse(JSON.stringify(eval(`(${line})`)));
      if (result.asin && (result.title || result.reviewerID)) {
        buffer.push(result);
        if (buffer.length === 1000) {
          await model.insertMany(buffer);
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(
            `Current progress: [Processed: ${processed}]`,
          );
          buffer = [];
        }
      }
    });

    rl.on('close', async () => {
      await model.insertMany(buffer);
      const hrend = process.hrtime(hrstart);
      console.log(`\nAll results done. Script "${filename}" took ${hrend[0] / 60} minutes to load`);
      console.log(`${processed} items were processed`);
      console.log('----------------------------------------------------------------------------');
      resolve(true);
    });
  } catch (err) {
    reject(console.log(err));
  }
});

const run = async () => {
  await loadData(Book, 'books');
  await loadData(Review, 'reviews');
  return process.exit();
};

run();
