module.exports = (sequelize, DataTypes) ->
    ApiLimit = sequelize.define 'ApiLimit', {
        id:
            autoIncrement: true
            primaryKey: true
            type: DataTypes.INTEGER
        ip:
            type: DataTypes.STRING
            allowNull: false
        count:
            type: DataTypes.INTEGER
            allowNull: false
    },
    tableName: 'api_limit'
    createdAt:'created_at'
    updatedAt: 'updated_at'
