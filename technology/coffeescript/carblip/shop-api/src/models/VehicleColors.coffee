module.exports = (sequelize, Sequelize) ->
  VehicleColors = sequelize.define 'VehicleColors', {
    id:
      primaryKey: true
      autoIncrement: true
      type: Sequelize.INTEGER
    vehicle_id:
      type: Sequelize.INTEGER
      allowNull: true
    color:
      type: Sequelize.STRING
      allowNull: true
    simple_color:
      type: Sequelize.STRING
      allowNull: false
    oem_option_code:
      type: Sequelize.STRING
      allowNull: true
    color_hex_code:
      type: Sequelize.STRING
      allowNull: true
    msrp:
      type: Sequelize.DOUBLE
      allowNull: true
    invoice:
      type: Sequelize.DOUBLE
      allowNull: true
    color_type:
      type: Sequelize.INTEGER
  },
  tableName: 'vehicle_colors'
  createdAt: 'created_at'
  updatedAt: 'updated_at'
  
  VehicleColors.associateRelations = (models) ->
      VehicleColors.belongsTo models.Vehicles,
          foreignKey: 'vehicle_id'
      VehicleColors.hasMany models.VehicleColorsMedia,
          foreignKey: 'vehicle_color_id'
      VehicleColors.hasMany models.VehicleRequestColors,
        foreignKey: 'exterior_color_id'
  VehicleColors
