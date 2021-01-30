'use strict';
const {
  Model
} = require('sequelize');
const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chat.belongsTo(models.User, {
        foreignKey: "sender_id",
        as: "user",
      });
    }
  };
  Chat.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    sender_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    receiver_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    message: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    read_status: {
      allowNull: true,
      type: DataTypes.INTEGER
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
    modelName: 'Chat',
    timestamps: true,
    paranoid: true,
    tableName: 'chats',
  });
  return Chat;
};