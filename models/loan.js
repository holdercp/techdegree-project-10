module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define(
    'Loan',
    {
      book_id: DataTypes.INTEGER,
      patron_id: DataTypes.INTEGER,
      loaned_on: DataTypes.DATEONLY,
      return_by: DataTypes.DATEONLY,
      returned_on: DataTypes.DATEONLY,
    },
    {
      timestamps: false,
      underscored: true,
    },
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
