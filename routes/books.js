const express = require('express');
const models = require('../models');

const router = express.Router();

/* GET books listing. */
router.get('/', (req, res, next) => {
  models.Book.findAll()
    .then(books => res.render('books/list', { title: 'All Books', books }))
    .catch((err) => {
      console.error(err);
    });
});

module.exports = router;
