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
  .get((req, res, next) => {
    // The "loanable" books should only be ones that are not currently checked out
    // This means books where their most recent Loan has a non-null value for returned_on
    // And books that don't have a Loan associated with them at all

    // Get the most recent Loans grouped by book_id where returned_on is not null (i.e. Books that have been returned)
    // id was used for ordering since the supplied library.db did not use timestamps on its records
    const returnedBooksQ = models.Loan.findAll({
      order: [['id', 'DESC']],
      limit: 1,
      group: ['book_id'],
      having: {
        returned_on: {
          [Op.not]: null,
        },
      },
      attributes: ['book_id'],
      // Now get all the books associated with those Loans
    }).then((returnedLoans) => {
      const returnedLoanIds = returnedLoans.map(loan => loan.book_id);
      return models.Book.findAll({
        where: {
          id: { [Op.in]: returnedLoanIds },
        },
      });
    });

    // Get books without a Loan
    // First get the id's of books with a Loan association
    const booksWithoutLoanQ = models.Book.findAll({
      include: [
        {
          model: models.Loan,
          where: { book_id: Sequelize.col('book.id') },
          attributes: ['id'],
        },
      ],
      // Then get the books whose id's are not included in that returned query
    }).then((booksWithLoan) => {
      const bookIdsWithLoan = booksWithLoan.map(book => book.id);
      return models.Book.findAll({
        where: {
          id: { [Op.notIn]: bookIdsWithLoan },
        },
      });
    });

    const patronsQ = models.Patron.findAll({ attributes: ['id', 'first_name', 'last_name'] });

    Promise.all([returnedBooksQ, booksWithoutLoanQ, patronsQ])
      .then((results) => {
        const books = [...results[0], ...results[1]];
        const patrons = results[2];
        // Populate date inputs with today's date and a week from now
        const date = {
          now: moment().format('YYYY-MM-DD'),
          nextWeek: moment()
            .add(7, 'days')
            .format('YYYY-MM-DD'),
        };
        res.render('loans/add', {
          title: 'Add Loan',
          books,
          patrons,
          date,
        });
      })
      .catch(err => next(err));
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

router
  .route('/:loanId')
  // GET loan return form
  .get((req, res, next) => {
    const { loanId } = req.params;
    models.Loan.findByPk(loanId, {
      include: [
        {
          model: models.Book,
          attributes: ['title'],
        },
        {
          model: models.Patron,
          attributes: ['first_name', 'last_name'],
        },
      ],
    })
      .then((loan) => {
        if (loan) {
          // Populate date inputs with today's date
          const date = {
            now: moment().format('YYYY-MM-DD'),
          };

          res.render('loans/return', { title: 'Return Book', loan, date });
        } else {
          throw new Error('Book Loan not found!');
        }
      })
      .catch((err) => {
        next(err);
      });
  }) // PATCH update to loan (return book)
  .patch((req, res) => {
    const { loanId } = req.params;
    models.Loan.findByPk(loanId)
      .then(loan => loan.update(req.body))
      .then(() => {
        res.redirect('/loans');
      })
      .catch((err) => {
        const messages = err.errors.map(error => error.message);
        res.render(`loans/${loanId}`, { title: 'Return Book', errors: messages });
      });
  });

module.exports = router;
