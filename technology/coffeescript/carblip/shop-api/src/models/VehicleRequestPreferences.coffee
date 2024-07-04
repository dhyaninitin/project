module.exports = (sequelize, Sequelize) ->
    VehicleRequestPreferences = sequelize.define 'VehicleRequestPreferences', {
        id:
            autoIncrement: true
            primaryKey: true
            type: Sequelize.INTEGER
        preferences:
            type: Sequelize.TEXT,
            allowNull: true
    },
    tableName: 'vehicle_request_preferences'
    timestamps: false
