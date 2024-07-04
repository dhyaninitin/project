module.exports = (sequelize, Sequelize) ->
  CDealer = sequelize.define('CDealer', {
    id:
      primaryKey: true
      type: Sequelize.INTEGER
    name:
      type: Sequelize.STRING
      allowNull: true
    account_type:
      type: Sequelize.INTEGER
      allowNull: true
    address:
      type: Sequelize.STRING
      allowNull: true
    city:
      type: Sequelize.STRING
      allowNull: true
    state:
      type: Sequelize.STRING
      allowNull: true
    zip:
      type: Sequelize.STRING
      allowNull: true
    phone:
      type: Sequelize.STRING
      allowNull: true
    monthly_fee:
      type: Sequelize.DOUBLE
      allowNull: true
    is_active:
      type: Sequelize.INTEGER
      allowNull: true
    api_status:
      type: Sequelize.INTEGER
      allowNull: true
    m_activated_at:
      type: Sequelize.STRING
      allowNull: true
    m_beta_end_at:
      type: Sequelize.STRING
      allowNull: true
    m_created_at:
      type: Sequelize.STRING
      allowNull: true
    m_disabled_at:
      type: Sequelize.STRING
      allowNull: true
    
  },
    tableName: 'm_dealers'
    createdAt: 'created_at'
    updatedAt: 'updated_at'
  )
