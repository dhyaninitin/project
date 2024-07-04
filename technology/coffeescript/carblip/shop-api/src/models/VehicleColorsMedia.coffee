module.exports = (sequelize, Sequelize) ->
    VehicleColorsMedia = sequelize.define 'VehicleColorsMedia', {
        id:
            primaryKey: true
            autoIncrement: true
            type: Sequelize.INTEGER
        vehicle_color_id:
            type: Sequelize.INTEGER
            allowNull: true
        url_2100:
            type: Sequelize.STRING
            allowNull: true
        url_1280:
            type: Sequelize.STRING
            allowNull: true
        url_640:
            type: Sequelize.STRING
            allowNull: true
        url_320:
            type: Sequelize.STRING
            allowNull: true
        shot_code:
            type: Sequelize.INTEGER
            allowNull: true
        type:
            type: Sequelize.INTEGER
            allowNull: true
    },
    tableName: 'vehicle_colors_media'
    createdAt: 'created_at'
    updatedAt: 'updated_at'
    
    VehicleColorsMedia.associateRelations = (models) ->
        VehicleColorsMedia.belongsTo models.VehicleColors,
            foreignKey: 'vehicle_color_id'
    VehicleColorsMedia
