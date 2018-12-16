module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    'Book',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      first_published: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: true,
          len: 4,
        },
      },
    },
    { timestamps: false, underscored: true },
  );
  Book.associate = (models) => {
    Book.hasMany(models.Loan);
  };
  return Book;
};
