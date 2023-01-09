'use strict';
const DataTypes = require('sequelize/lib/data-types')

// Use this to override sequelize converting to UTC
DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options)
  return date.format('YYYY-MM-DD HH:mm:ss.SSS')
}

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    static associate({ PurchaseAttachment }) {
      this.hasOne(PurchaseAttachment, { sourceKey: 'purchaseId', foreignKey: 'purchaseId' })
    }
  }
  Purchase.init({
    purchaseId: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    purchaseDestination: {
      type: DataTypes.STRING(20),
      allowNull: false
    }, 
    purchaseDetails: {
      type: DataTypes.STRING
    }, 
    vendor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    purchaseAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false 
    },
    lastFour: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
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
    tableName: 'purchases',
    modelName: 'Purchase',
  });
  return Purchase;
};