'use strict';
const {
  Model
} = require('sequelize');
const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  class BankDeposit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BankDeposit.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  };
  BankDeposit.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    user_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    amount: {
      allowNull: true,
      type: DataTypes.DECIMAL(65, 0),
      defaultValue: 0,
    },
    image: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    status: {
      allowNull: true,
      type: DataTypes.INTEGER,
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
    modelName: 'BankDeposit',
    timestamps: true,
    paranoid: true,
    tableName: 'bankdeposits',
  });
  return BankDeposit;
};