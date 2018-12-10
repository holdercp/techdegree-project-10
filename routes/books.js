const express = require('express');
const methodOverride = require('method-override');
const Sequelize = require('sequelize');
const moment = require('moment');
const bodyParser = require('body-parser');
const models = require('../models');

const { Op } = Sequelize;
const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.use(methodOverride('_method'));

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

// GET book detail/edit form
router.get('/:bookId', (req, res) => {
  const { bookId } = req.params;
  models.Book.findById(bookId, {
    include: [
      {
        model: models.Loan,
        include: [{ model: models.Patron, attributes: ['first_name', 'last_name'] }],
      },
    ],
  })
    .then((results) => {
      if (results) {
        res.render('books/view', { title: results.title, results });
      } else {
        // TODO: Handle null book
        res.send('Book does not exist');
      }
    })
    .catch((err) => {
      // TODO: Handle errors
      console.error(err);
    });
});

// PATCH update to book
router.patch('/:bookId', urlencodedParser, (req, res) => {
  models.Book.findById(req.params.bookId)
    .then(book => book.update(req.body))
    .then(() => {
      res.redirect('/books');
    })
    .catch((err) => {
      const messages = err.errors.map(error => error.message);
      res.render('books/add', { title: 'Add Book', errors: messages });
    });
});

module.exports = router;
