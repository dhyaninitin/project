module.exports = (sequelize, Sequelize) ->
  CMake = sequelize.define 'CMake', {
    id:
      primaryKey: true
      type: Sequelize.INTEGER
    captive:
      type: Sequelize.STRING
      allowNull: true
    is_domestic:
      type: Sequelize.INTEGER
      allowNull: true
    name:
      type: Sequelize.STRING
      allowNull: true
    is_new:
      type: Sequelize.INTEGER
      allowNull: true
  },
    tableName: 'm_makes'
    createdAt: 'created_at'
    updatedAt: 'updated_at'
    
  CMake.associateRelations = (models) ->
    CMake.hasMany models.CModel,
      foreignKey: 'm_make_id'
      targetKey: 'id'
  CMake
