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
  const include = {
    include: [
      {
        model: models.Book,
        attributes: ['id', 'title'],
      },
      {
        model: models.Patron,
        attributes: ['id', 'first_name', 'last_name'],
      },
    ],
  };

  let where = {};
  let title = 'All Loans';

  // Set title and where clause if there is a filter query
  if (req.query.filter === 'overdue') {
    where = {
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
    };
    title = 'Overdue Loans';
  } else if (req.query.filter === 'checked-out') {
    where = {
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
    };
    title = 'Checked Out Loans';
  }

  const query = Object.assign(include, where);

  models.Loan.findAll(query)
    .then((results) => {
      res.render('loans/list', { title, results });
    })
    .catch((err) => {
      next(err);
    });
});

router
  .route('/add')
  // GET new loan form
  .get((req, res) => {
    const books = models.Book.findAll({
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
      attributes: ['id', 'title'],
    });

    const patrons = models.Patron.findAll({ attributes: ['id', 'first_name', 'last_name'] });

    Promise.all([books, patrons]).then((results) => {
      res.render('loans/add', { title: 'Add Loan', books: results[0], patrons: results[1] });
    });
  })
  // POST new loan data
  .post(emptyStringToNull, (req, res) => {
    models.Loan.create(req.body)
      .then(() => {
        res.redirect('/loans');
      })
      .catch((err) => {
        const messages = err.errors.map(error => error.message);
        res.render('loans/add', { title: 'Add Loan', errors: messages });
      });
  });

// router
//   .route('/:bookId')
//   // GET book detail/edit form
//   .get((req, res, next) => {
//     const { bookId } = req.params;
//     models.Book.findByPk(bookId, {
//       include: [
//         {
//           model: models.Loan,
//           include: [{ model: models.Patron, attributes: ['first_name', 'last_name'] }],
//         },
//       ],
//     })
//       .then((results) => {
//         if (results) {
//           res.render('books/view', { title: results.title, results });
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
