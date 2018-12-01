
module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define(
    'Loan',
    {
      book_id: DataTypes.INTEGER,
      patron_id: DataTypes.INTEGER,
      loaned_on: DataTypes.DATE,
      returned_by: DataTypes.DATE,
      returned_on: DataTypes.DATE,
    },
    {},
  );
  Loan.associate = function (models) {
    // associations can be defined here
  };
  return Loan;
};
