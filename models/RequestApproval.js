'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RequestApproval extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RequestApproval.init({
    requestId: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    departmentApproval: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    departmentApprovalEmail: {
      type: DataTypes.STRING(50),
      allowNull: false
    }, 
    departmentApprovalDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    requiresOfficerApproval: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    officerApproval: {
      type: DataTypes.NUMBER
    },
    officerApprovalEmail: {
      type: DataTypes.STRING(50)
    },
    officerApprovalDate: {
      type: DataTypes.DATEONLY
    },
    requiresAP: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: false
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'request_approval',
    modelName: 'RequestApproval',
  });
  return RequestApproval;
};