module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    'Book',
    {
      title: DataTypes.STRING,
      author: DataTypes.STRING,
      genre: DataTypes.STRING,
      first_published: DataTypes.INTEGER,
    },
    { timestamps: false, underscored: true },
  );
  Book.associate = (models) => {
    Book.hasOne(models.Loan);
  };
  return Book;
};
