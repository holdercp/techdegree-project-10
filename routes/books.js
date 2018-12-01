const express = require('express');
const models = require('../models');

const router = express.Router();

/* GET books listing. */
router.get('/', (req, res, next) => {
  models.Book.findAll()
    .then(books => res.render('books/list', { title: 'Books List', books }))
    .catch((err) => {
      console.error(err);
    });
});

// GET new book
router.get('/add', (req, res, next) => {
  res.render('books/add', { title: 'Add Book' });
});

router.get('/:bookId', (req, res, next) => {
  res.render('books/view', { title: 'Book: Title Here', bookId: req.params.bookId });
});

module.exports = router;
