'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RequestPurchase extends Model {
    static associate({ RequestPurchaseAttachment }) {
      this.hasOne(RequestPurchaseAttachment, { sourceKey: 'requestPurchaseId', foreignKey: 'requestPurchaseId' })
    }
  }
  RequestPurchase.init({
    requestPurchaseId: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    requestId: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    purchaseDestination: {
      type: DataTypes.STRING,
    },
    lastFour: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    OPIQNum: {
      type: DataTypes.STRING
    },
    OPIQEntryDate: {
      type: DataTypes.DATEONLY
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'request_purchases',
    modelName: 'RequestPurchase',
  });
  return RequestPurchase;
};