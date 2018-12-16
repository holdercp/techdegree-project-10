module.exports = (sequelize, DataTypes) => {
  const Patron = sequelize.define(
    'Patron',
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          notNull: true,
        },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          notNull: true,
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          notNull: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
          notNull: true,
        },
      },
      library_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          notNull: true,
        },
      },
      zip_code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          notNull: true,
          len: [0, 5],
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
