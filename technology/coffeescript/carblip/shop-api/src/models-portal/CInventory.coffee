module.exports = (sequelize, Sequelize) ->
  CInventory = sequelize.define 'CInventory', {
    id:
      primaryKey: true
      autoIncrement: true
      type: Sequelize.INTEGER
    vin:
      unique: true
      type: Sequelize.STRING
      allowNull: true
    m_dealer_id:
      type: Sequelize.INTEGER
      allowNull: true
    inventory_id:
      type: Sequelize.INTEGER
      allowNull: true
    m_make_id:
      type: Sequelize.INTEGER
      allowNull: true
    m_model_id:
      type: Sequelize.INTEGER
      allowNull: true
    year:
      type: Sequelize.INTEGER
      allowNull: true
    invoice:
      type: Sequelize.DOUBLE
      allowNull: true
    is_new:
      type: Sequelize.INTEGER
      allowNull: true
    msrp:
      type: Sequelize.DOUBLE
      allowNull: true
    model_number:
      type: Sequelize.STRING
      allowNull: true
    mscode:
      type: Sequelize.STRING
      allowNull: true
    shipping:
      type: Sequelize.STRING
      allowNull: true
    desc:
      type: Sequelize.STRING
      allowNull: true
    weight:
      type: Sequelize.INTEGER
      allowNull: true
    year_display:
      type: Sequelize.STRING
      allowNull: true
    base_msrp:
      type: Sequelize.DOUBLE
      allowNull: true
    current_mileage:
      type: Sequelize.INTEGER
      allowNull: true
    exterior_color:
      type: Sequelize.STRING
      allowNull: true
    interior_color:
      type: Sequelize.STRING
      allowNull: true
    lot_age:
      type: Sequelize.INTEGER
      allowNull: true
    price:
      type: Sequelize.DOUBLE
      allowNull: true
    stock_no:
      type: Sequelize.STRING
      allowNull: true
  },
  tableName: 'm_inventories'
  createdAt: 'created_at'
  updatedAt: 'updated_at'
    
  CInventory.associateRelations = (models) ->
    CInventory.belongsTo models.CDealer,
      foreignKey: 'm_dealer_id'
    CInventory.belongsTo models.CMake,
      foreignKey: 'm_make_id'
    CInventory.belongsTo models.CModel,
      foreignKey: 'm_model_id'
  CInventory


