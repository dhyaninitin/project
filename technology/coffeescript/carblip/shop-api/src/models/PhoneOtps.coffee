module.exports = (sequelize, DataTypes) ->
    AppVersions = sequelize.define 'PhoneOtps', {
        id:
            autoIncrement: true
            primaryKey: true
            type: DataTypes.INTEGER
        phone:
            type: DataTypes.STRING
            allowNull: false
        otp:
            type: DataTypes.INTEGER
            allowNull: true
        is_verified:
            type: DataTypes.INTEGER
            allowNull: false
    },
    tableName: 'phone_otps'
    timestamps:false
