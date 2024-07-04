module.exports = (sequelize, DataTypes) ->
    ApiCredentials = sequelize.define 'ApiCredentials', {
        id:
            autoIncrement: true
            primaryKey: true
            type: DataTypes.INTEGER
        provider:
            type: DataTypes.STRING
            allowNull: false
        type:
            type: DataTypes.STRING
            allowNull: true
        value:
            type: DataTypes.STRING
            allowNull: false
    },
    tableName: 'api_credentials'
    timestamps:false
