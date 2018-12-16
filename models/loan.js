module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define(
    'Loan',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true,
          isInt: true,
        },
      },
      patron_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true,
          isInt: true,
        },
      },
      loaned_on: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validations: {
          isDate: true,
          notNull: true,
        },
      },
      return_by: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validations: {
          isDate: true,
          notNull: true,
        },
      },
      returned_on: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validations: {
          isDate: true,
        },
      },
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
