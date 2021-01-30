'use strict';
const {
  Model
} = require('sequelize');
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.BankDeposit, {
        foreignKey: "user_id",
        as: "bank_deposits"
      });

      User.hasMany(models.Chat, {
        foreignKey: "sender_id",
        as: "chats"
      });

      User.hasMany(models.Referral, {
        foreignKey: "user_id",
        as: "ref_user"
      });

      User.hasMany(models.Referral, {
        foreignKey: "referral_id",
        as: "refferrer"
      });

      User.hasMany(models.Withdrawal, {
        foreignKey: "user_id",
        as: "withdrawals"
      });

      User.hasOne(models.Kyc, {
        foreignKey: "user_id",
        as: "kyc"
      });
    }
  };
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    name: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    email: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    phone: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    role: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    wallet: {
      allowNull: true,
      type: DataTypes.DECIMAL,
    },
    referral_count: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    referral_amount: {
      allowNull: true,
      type: DataTypes.DECIMAL(65, 0),
      defaultValue: 0,
    },
    password: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    reference: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    referral_id: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    oauth_id: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    oauth_token: {
      allowNull: true,
      type: DataTypes.STRING,
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
    modelName: 'User',
    timestamps: true,
    paranoid: true,
    tableName: 'users',
  });
  return User;
};