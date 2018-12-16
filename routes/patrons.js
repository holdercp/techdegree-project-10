const express = require('express');
const methodOverride = require('method-override');
const Sequelize = require('sequelize');
const moment = require('moment');
const models = require('../models');
const emptyStringToNull = require('../middlewares/emptyStringToNull');

const { Op } = Sequelize;
const router = express.Router();

router.use(methodOverride('_method'));

/* GET loans listing. */
router.get('/', (req, res, next) => {
  models.Patron.findAll()
    .then((patrons) => {
      res.render('patrons/list', { title: 'All Patrons', patrons });
    })
    .catch((err) => {
      next(err);
    });
});

router
  .route('/add')
  // GET new patron form
  .get((req, res) => {
    res.render('patrons/add', { title: 'Add Patron' });
  })
  // POST new patron data
  .post(emptyStringToNull, (req, res) => {
    models.Patron.create(req.body)
      .then(() => {
        res.redirect('/patrons');
      })
      .catch((err) => {
        const messages = err.errors.map(error => error.message);
        res.render('patrons/add', { title: 'Add Patron', errors: messages });
      });
  });

// router
//   .route('/:bookId')
//   // GET book detail/edit form
//   .get((req, res, next) => {
//     const { bookId } = req.params;
//     const bookQ = models.Book.findByPk(bookId);
//     const loansQ = models.Loan.findAll({
//       where: { book_id: bookId },
//       include: [{ model: models.Patron, attributes: ['first_name', 'last_name'] }],
//     });

//     Promise.all([bookQ, loansQ])
//       .then((results) => {
//         const book = results[0];
//         const loans = results[1];
//         if (results[0]) {
//           res.render('books/view', { title: book.title, book, loans });
//         } else {
//           throw new Error('Book not found!');
//         }
//       })
//       .catch((err) => {
//         next(err);
//       });
//   }) // PATCH update to book
//   .patch((req, res) => {
//     models.Book.findByPk(req.params.bookId)
//       .then(book => book.update(req.body))
//       .then(() => {
//         res.redirect('/books');
//       })
//       .catch((err) => {
//         const messages = err.errors.map(error => error.message);
//         res.render('books/add', { title: 'Add Book', errors: messages });
//       });
//   });

module.exports = router;
