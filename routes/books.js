const express = require('express');
const Sequelize = require('sequelize');
const moment = require('moment');
const models = require('../models');

const { Op } = Sequelize;
const router = express.Router();

/* GET books listing. */
router.get('/', (req, res, next) => {
  let where = {};
  let title = 'All Books';

  // Set title and where clause if there is a filter query
  if (req.query.filter === 'overdue') {
    where = {
      include: [
        {
          model: models.Loan,
          where: {
            [Op.and]: {
              return_by: {
                [Op.lt]: moment().format('YYYY-MM-DD'),
              },
              returned_on: {
                [Op.eq]: null,
              },
            },
          },
        },
      ],
    };
    title = 'Overdue Books';
  } else if (req.query.filter === 'checked-out') {
    where = {
      include: [
        {
          model: models.Loan,
          where: {
            [Op.and]: {
              loaned_on: {
                [Op.not]: null,
              },
              returned_on: {
                [Op.eq]: null,
              },
            },
          },
        },
      ],
    };
    title = 'Checked Out Books';
  }

  models.Book.findAll(where)
    .then(books => res.render('books/list', { title, books }))
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
