module.exports = (sequelize, DataTypes) => {
  const Patron = sequelize.define(
    'Patron',
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      address: DataTypes.STRING,
      email: DataTypes.STRING,
      library_id: DataTypes.STRING,
      zip_code: DataTypes.INTEGER,
    },
    { timestamps: false, underscored: true },
  );
  Patron.associate = (models) => {
    Patron.hasOne(models.Loan);
  };
  return Patron;
};
