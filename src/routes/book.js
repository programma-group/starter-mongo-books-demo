const express = require('express');
const { getBooks } = require('../controllers/book');
const { catchErrors } = require('../utils/errorHandlers');

const router = express.Router();

router.get('/', catchErrors(getBooks));
module.exports = router;
