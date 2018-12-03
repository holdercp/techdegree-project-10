const express = require('express');
const Sequelize = require('sequelize');
const models = require('../models');

const {Op} = Sequelize;
const router = express.Router();

/* GET books listing. */
router.get('/', (req, res, next) => {
  if (req.query.filter) {
    models.Book.findAll({
      include: [
        {
          model: models.Loan,
          where: {
            returnBy: {
              [Op.gt]:
            }
          },
        },
      ],
    });
  }

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
