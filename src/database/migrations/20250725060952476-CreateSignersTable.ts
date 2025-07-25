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

    await queryInterface.createTable('signers', {
      id: {
        type: DataType.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
      },
      email: {
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
      },
      role: {
        type: DataType.STRING,
        allowNull: true,

        defaultValue: null,
      },
      status: {
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
      },
      fields: {
        type: DataType.JSON,
        allowNull: true,
        defaultValue: null,
      },
      user_id: {
        type: DataType.BIGINT,
        allowNull: true,
        defaultValue: null,
      },
      document_id: {
        type: DataType.BIGINT,
        allowNull: true,
        defaultValue: null,
      },
      signing_url: {
        type: DataType.STRING,
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

    await queryInterface.addConstraint('signers', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'signers_user_id_fk',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });

    await queryInterface.addConstraint('signers', {
      fields: ['document_id'],
      type: 'foreign key',
      name: 'signers_document_id_fk',
      references: {
        table: 'documents',
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

    await queryInterface.removeConstraint('signers', 'signers_user_id_fk');
    await queryInterface.removeConstraint('signers', 'signers_document_id_fk');
    await queryInterface.dropTable('signers');
  },
};
