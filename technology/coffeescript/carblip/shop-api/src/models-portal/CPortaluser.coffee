module.exports = (sequelize, Sequelize) ->
  CPortalUser = sequelize.define('CPortalUser', {
    id:
      primaryKey: true
      type: Sequelize.INTEGER
    first_name:
      type: Sequelize.STRING
      allowNull: true
    last_name:
      type: Sequelize.STRING
      allowNull: true
    location_id:
      type: Sequelize.INTEGER
      allowNull: true
    email:
      type: Sequelize.STRING
      allowNull: true
    password:
      type: Sequelize.STRING
      allowNull: true
    remember_token:
      type: Sequelize.STRING
      allowNull: true
    is_active:
      type: Sequelize.STRING
      allowNull: true
    promo_code:
      type: Sequelize.STRING
      allowNull: true
  },
    tableName: 'portal_users'
    createdAt: 'created_at'
    updatedAt: 'updated_at'
  )
