module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define(
    'Loan',
    {
      book_id: DataTypes.INTEGER,
      patron_id: DataTypes.INTEGER,
      loaned_on: DataTypes.DATE,
      return_by: DataTypes.DATE,
      returned_on: DataTypes.DATE,
    },
    { timestamps: false, underscored: true },
  );
  Loan.associate = (models) => {
    Loan.belongsTo(models.Book, {
      foreignKey: {
        allowNull: false,
      },
    });
    Loan.belongsTo(models.Patron, {
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return Loan;
};
