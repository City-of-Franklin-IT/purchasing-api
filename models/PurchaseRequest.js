'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PurchaseRequest extends Model {
    static associate({ RequestAttachment, RequestApproval, RequestPurchase }) {
      this.hasOne(RequestAttachment, { sourceKey: 'requestId', foreignKey: 'requestId' })
      this.hasOne(RequestApproval, { sourceKey: 'requestId', foreignKey: 'requestId' })
      this.hasOne(RequestPurchase, { sourceKey: 'requestId', foreignKey: 'requestId' })
    }
  }
  PurchaseRequest.init({
    requestId: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    requestLocation: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    requestDetails: {
      type: DataTypes.STRING(500)
    },
    vendor: {
      type: DataTypes.STRING(50)
    },
    requestAmount: {
      type: DataTypes.DECIMAL(19,4),
      allowNull: false
    },
    weblink: {
      type: DataTypes.STRING(2048)
    },
    status: {
      type: DataTypes.STRING(50),
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
    }
  }, {
    sequelize,
    tableName: 'requests',
    modelName: 'PurchaseRequest',
  });
  return PurchaseRequest;
};