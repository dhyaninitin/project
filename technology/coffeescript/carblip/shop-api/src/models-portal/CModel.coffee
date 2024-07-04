module.exports = (sequelize, Sequelize) ->
  CModel = sequelize.define 'CModel', {
    id:
      primaryKey: true
      type: Sequelize.INTEGER
    m_make_id:
      type: Sequelize.INTEGER
      allowNull: true
    name:
      type: Sequelize.STRING
      allowNull: true
    is_new:
      type: Sequelize.INTEGER
      allowNull: true
  },
    tableName: 'm_models'
    createdAt: 'created_at'
    updatedAt: 'updated_at'
    
  CModel.associateRelations = (models) ->
    CModel.belongsTo models.CMake,
      foreignKey: 'm_make_id'
      targetkey: 'id'
  CModel

