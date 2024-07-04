module.exports = (sequelize, Sequelize) ->
  Favorites = sequelize.define 'Favorites', {
    id:
      primaryKey: true
      autoIncrement: true
      type: Sequelize.INTEGER
    vehicle_inventory_id:
      type: Sequelize.INTEGER
      allowNull: false
    user_id:
      type: Sequelize.INTEGER
      allowNull: false
    favorite:
      type: Sequelize.BOOLEAN
      defaultValue: '0'
  },
  tableName: 'favorites'
  createdAt:'created_at'
  updatedAt:'updated_at'
  
  Favorites.associateRelations = (models) ->
    Favorites.belongsTo models.User,
      foreignKey: 'user_id'
      targetkey: 'id'
    Favorites.belongsTo models.VehicleInventory,
      foreignKey: 'vehicle_inventory_id'
      targetkey: 'id'
  Favorites
