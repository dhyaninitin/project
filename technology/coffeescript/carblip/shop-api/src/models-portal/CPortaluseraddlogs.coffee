module.exports = (sequelize, Sequelize) ->
  CPortalUser = sequelize.define('CPortalUserLogs', {
    id:
      primaryKey: true
      type: Sequelize.BIGINT
    content:
      type: Sequelize.TEXT
      allowNull: true
    category:
      type: Sequelize.STRING
      allowNull: true
    action:
      type: Sequelize.STRING
      allowNull: true
    is_read:
      type: Sequelize.BOOLEAN
      allowNull: false
    is_view:
      type: Sequelize.BOOLEAN
      allowNull: false
    target_id:
      type: Sequelize.BIGINT
      allowNull: true
    target_type:
      type: Sequelize.STRING
      allowNull: true
    portal_user_id:
      type: Sequelize.BIGINT
      allowNull: true
    portal_user_name:
      type: Sequelize.STRING
      allowNull: true
  },
    tableName: 'logs'
    createdAt: 'created_at'
    updatedAt: 'updated_at'
  )