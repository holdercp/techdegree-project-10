const express = require('express');
const methodOverride = require('method-override');
const Sequelize = require('sequelize');
const moment = require('moment');
const models = require('../models');
const emptyStringToNull = require('../middlewares/emptyStringToNull');

const { Op } = Sequelize;
const router = express.Router();

router.use(methodOverride('_method'));

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
    .then((books) => {
      res.render('books/list', { title, books });
    })
    .catch((err) => {
      next(err);
    });
});

router
  .route('/add')
  // GET new book form
  .get((req, res) => {
    res.render('books/add', { title: 'Add Book' });
  })
  // POST new book data
  .post(emptyStringToNull, (req, res) => {
    models.Book.create(req.body)
      .then(() => {
        res.redirect('/books');
      })
      .catch((err) => {
        const messages = err.errors.map(error => error.message);
        res.render('books/add', { title: 'Add Book', errors: messages });
      });
  });

router
  .route('/:bookId')
  // GET book detail/edit form
  .get((req, res, next) => {
    const { bookId } = req.params;
    models.Book.findByPk(bookId, {
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
          throw new Error('Book not found!');
        }
      })
      .catch((err) => {
        next(err);
      });
  }) // PATCH update to book
  .patch((req, res) => {
    models.Book.findByPk(req.params.bookId)
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
