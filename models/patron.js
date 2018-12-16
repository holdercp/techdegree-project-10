module.exports = (sequelize, DataTypes) => {
  const Patron = sequelize.define(
    'Patron',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      library_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      zip_code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          len: 5,
        },
      },
    },
    {
      timestamps: false,
      underscored: true,
      getterMethods: {
        fullName() {
          return `${this.first_name} ${this.last_name}`;
        },
      },
    },
  );
  Patron.associate = (models) => {
    Patron.hasMany(models.Loan);
  };
  return Patron;
};
