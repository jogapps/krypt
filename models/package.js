'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Package.hasMany(models.Investment, { foreignKey: "package_id", as: "investments" });
    }
  };
  Package.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    name: {
      allowNull: true,
      type: DataTypes.STRING
    },
    description: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    min_investment: {
      allowNull: true,
      type: DataTypes.DECIMAL(65, 0),
      defaultValue: 0,
    },
    max_investment: {
      allowNull: true,
      type: DataTypes.DECIMAL(65, 0),
      defaultValue: 0,
    },
    interest: {
      allowNull: true,
      type: DataTypes.DECIMAL(65, 0),
      defaultValue: 0,
    },
    duration: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Package',
    timestamps: true,
    paranoid: true,
    tableName: 'packages',
  });
  return Package;
};