const express = require('express');
const methodOverride = require('method-override');
const Sequelize = require('sequelize');
const moment = require('moment');
const models = require('../models');
const emptyStringToNull = require('../middlewares/emptyStringToNull');
const pagination = require('../middlewares/pagination');
const config = require('../config/config');

const { Op } = Sequelize;
const router = express.Router();

router.use(methodOverride('_method'));

/* GET books listing. */
router.get('/', (req, res, next) => {
  const q = {
    limit: config.perPage,
  };
  let title = 'All Books';

  const currentPage = req.query.page;

  if (currentPage && parseInt(currentPage, 0)) {
    q.offset = currentPage * config.perPage - config.perPage;
  }

  // Set title and where clause if there is a filter query
  if (req.query.filter === 'overdue') {
    q.include = [
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
    ];
    title = 'Overdue Books';
  } else if (req.query.filter === 'checked-out') {
    q.include = [
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
    ];
    title = 'Checked Out Books';
  }

  models.Book.findAndCountAll(q)
    .then((books) => {
      let pages;
      if (books.count > config.perPage) {
        const totalPages = Math.ceil(books.count / config.perPage);
        pages = pagination(req, totalPages, parseInt(currentPage, 0) || 1);
      }
      res.render('books/list', { books: books.rows, title, pages });
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
    const bookQ = models.Book.findByPk(bookId);
    const loansQ = models.Loan.findAll({
      where: { book_id: bookId },
      include: [{ model: models.Patron, attributes: ['id', 'first_name', 'last_name'] }],
    });

    Promise.all([bookQ, loansQ])
      .then((results) => {
        const book = results[0];
        const loans = results[1];
        if (results[0]) {
          res.render('books/view', { title: 'Book Detail', book, loans });
        } else {
          throw new Error('Book not found!');
        }
      })
      .catch((err) => {
        next(err);
      });
  }) // PATCH update to book
  .patch((req, res) => {
    const { bookId } = req.params;
    models.Book.findByPk(bookId)
      .then(book => book.update(req.body))
      .then(() => {
        res.redirect('/books');
      })
      .catch((err) => {
        const messages = err.errors.map(error => error.message);
        res.render(`books/${bookId}`, { title: 'Book Detail', errors: messages });
      });
  });

module.exports = router;
