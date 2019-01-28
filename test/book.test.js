process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const Book = require('../src/models/Book');
const Review = require('../src/models/Review');

const should = chai.should();
const app = require('../src/start');

chai.use(chaiHttp);

describe('The books:', () => {
  before(async () => {
    await Book.remove({});

    const bookWithReview = await Book({
      asin: 'abc123456',
      title: 'My amazing book',
    }).save();

    await Book({
      asin: 'abc654321',
      title: 'My amazing book part 2',
    }).save();

    await Book({
      asin: '654321cba',
      title: 'My amazing book: The revenge',
    }).save();

    await Review({
      reviewerID: 'SOMEGOODID',
      asin: bookWithReview.asin,
      reviewerName: 'Roger Gonzalez',
      reviewText: 'Such an amazing book!',
      overall: 5,
      summary: 'Amazing book!',
    }).save();
  });

  it('should get the books information', (done) => {
    chai.request(app).get('/').end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.count.should.eql(3);
      res.body.books[0].should.have.property('asin').eql('abc123456');
      res.body.books[0].reviews[0].should.have.property('reviewerName').eql('Roger Gonzalez');
      done();
    });
  });
});
