'use strict';

import { QueryInterface, Sequelize } from 'sequelize';
import { DataType } from 'sequelize-typescript';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('documents', {
      id: {
        type: DataType.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      path: {
        type: DataType.STRING,
        allowNull: false,
      },
      original_name: {
        type: DataType.STRING,
        allowNull: true,
      },
      documenso_id: {
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      workflow_status: {
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
      },
      user_id: {
        type: DataType.BIGINT,
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        type: DataType.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataType.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('documents', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'documents_user_id_fk',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  },

  down: async (queryInterface: QueryInterface) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeConstraint('documents', 'documents_user_id_fk');
    await queryInterface.dropTable('documents');
  },
};
