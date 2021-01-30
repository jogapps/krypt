'use strict';
const {
  Model
} = require('sequelize');
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  class Withdrawal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Withdrawal.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  };
  Withdrawal.init({
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
    amount: {
      allowNull: true,
      type: DataTypes.DECIMAL(65, 0),
      defaultValue: 0,
    },
    bank: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    bank_code: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    recipient_id: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    acc_name: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    acc_number: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    status: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    modelName: 'Withdrawal',
    timestamps: true,
    paranoid: true,
    tableName: 'withdrawals',
  });
  return Withdrawal;
};