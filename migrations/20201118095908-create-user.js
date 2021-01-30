'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING
      },
      role: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 3,
      },
      wallet: {
        allowNull: false,
        type: Sequelize.DECIMAL(65, 0),
        defaultValue: 0,
      },
      referral_count: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      referral_amount: {
        allowNull: true,
        type: Sequelize.DECIMAL(65, 0),
        defaultValue: 0,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      reference: {
        allowNull: true,
        type: Sequelize.STRING
      },
      referral_id: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      oauth_id: {
        allowNull: true,
        type: Sequelize.STRING
      },
      oauth_token: {
        allowNull: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};