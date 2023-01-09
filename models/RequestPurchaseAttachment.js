'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RequestPurchaseAttachment extends Model {
    static associate(models) {
      // define association here
    }
  }
  RequestPurchaseAttachment.init({
    requestPurchaseId: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    data: {
      type: DataTypes.BLOB,
      allowNull: false
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
  }, {
    sequelize,
    tableName: 'request_purchase_attachments',
    modelName: 'RequestPurchaseAttachment',
  });
  return RequestPurchaseAttachment;
};