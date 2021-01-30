'use strict';
const {
  Model
} = require('sequelize');
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  class Investment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Investment.belongsTo(models.Package, {
        foreignKey: "package_id",
        as: "package",
      });
    }
  };
  Investment.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    user_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    package_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    amount: {
      allowNull: true,
      type: DataTypes.DECIMAL(65, 0),
      defaultValue: 0,
    },
    interest: {
      allowNull: true,
      type: DataTypes.DECIMAL(65, 0),
      defaultValue: 0,
    },
    expiredAt: {
      allowNull: false,
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('expiredAt')).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      }
    }
  }, {
    sequelize,
    modelName: 'Investment',
    timestamps: true,
    paranoid: true,
    tableName: 'investments',
  });
  return Investment;
};