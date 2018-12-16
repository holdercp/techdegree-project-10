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

router
  .route('/:patronId')
  // GET patron detail/edit form
  .get((req, res, next) => {
    const { patronId } = req.params;
    const patronQ = models.Patron.findByPk(patronId);
    const loansQ = models.Loan.findAll({
      where: { patron_id: patronId },
      include: [{ model: models.Book, attributes: ['id', 'title'] }],
    });

    Promise.all([patronQ, loansQ])
      .then((results) => {
        const patron = results[0];
        const loans = results[1];
        if (patron) {
          res.render('patrons/view', { title: 'Patron Detail', patron, loans });
        } else {
          throw new Error('Patron not found!');
        }
      })
      .catch((err) => {
        next(err);
      });
  }) // PATCH update to patron
  .patch((req, res, next) => {
    const { patronId } = req.params;
    models.Patron.findByPk(patronId)
      .then((patron) => {
        patron.update(req.body);
      })
      .then(() => {
        res.redirect('/patrons');
      })
      .catch((err) => {
        const messages = err.errors.map(error => error.message);
        res.render(`patrons/${patronId}`, { title: 'Patron Detail', errors: messages });
        next(err);
      });
  });

module.exports = router;
