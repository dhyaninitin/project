module.exports = (sequelize, Sequelize) ->
  VehicleRequestColors = sequelize.define 'VehicleRequestColors', {
    id:
      primaryKey: true
      autoIncrement: true
      type: Sequelize.INTEGER
    vehicle_request_id:
      type: Sequelize.INTEGER
      allowNull: false
    exterior_color_id:
      type: Sequelize.INTEGER
      allowNull: true
    interior_color_id:
      type: Sequelize.INTEGER
      allowNull: true
    color_type:
      type: Sequelize.INTEGER
  },
  tableName: 'vehicle_request_colors'
  createdAt: 'created_at'
  updatedAt: 'updated_at'
  
  VehicleRequestColors.associateRelations = (models) ->
    VehicleRequestColors.belongsTo models.VehicleRequests,
        foreignKey: 'vehicle_request_id'
    VehicleRequestColors.belongsTo models.VehicleColors,
            foreignKey: 'exterior_color_id'
    VehicleRequestColors.belongsTo models.InteriorColors,
            foreignKey: 'interior_color_id'
  VehicleRequestColors
