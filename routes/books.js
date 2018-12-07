const express = require('express');
const Sequelize = require('sequelize');
const moment = require('moment');
const bodyParser = require('body-parser');
const models = require('../models');

const { Op } = Sequelize;
const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET books listing. */
router.get('/', (req, res) => {
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
      // TODO: Handle errors
      res.send(err);
    });
});

router
  .route('/add')
  // GET new book form
  .get((req, res) => {
    res.render('books/add', { title: 'Add Book' });
  })
  // POST new book data
  .post(urlencodedParser, (req, res) => {
    models.Book.create(req.body)
      .then(() => {
        res.redirect('/books');
      })
      .catch((err) => {
        const messages = err.errors.map(error => error.message);
        res.render('books/add', { title: 'Add Book', errors: messages });
      });
  });

router.get('/:bookId', (req, res) => {
  res.render('books/view', { title: 'Book: Title Here', bookId: req.params.bookId });
});

module.exports = router;
