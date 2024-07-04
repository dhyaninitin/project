module.exports = (sequelize, Sequelize) ->
  FbUserLead = sequelize.define('FbUserLead', {
    id:
      autoIncrement: true
      primaryKey: true
      type: Sequelize.INTEGER
    fb_user_id:
      type: Sequelize.INTEGER
      allowNull: false
    year:
      type: Sequelize.INTEGER
      allowNull: true
    make:
      type: Sequelize.STRING
      allowNull: true
    model:
      type: Sequelize.STRING
      allowNull: true
    trim:
      type: Sequelize.STRING
      allowNull: true
    exterior_color:
      type: Sequelize.STRING
      allowNull: true
    interior_color:
      type: Sequelize.STRING
      allowNull: true
    vin:
      type: Sequelize.STRING
      allowNull: true
    mileage:
      type: Sequelize.INTEGER
      allowNull: true
    vehicle_condition:
      type: Sequelize.INTEGER
      allowNull: true
    lease_end_date:
      type: Sequelize.DATE
      allowNull: true
    smoke_free:
      type: Sequelize.INTEGER
      allowNull: true
    number_keys:
      type: Sequelize.INTEGER
      allowNull: true
    bank_lender:
      type: Sequelize.STRING
      allowNull: true
    account:
      type: Sequelize.STRING
      allowNull: true
    payoff_amount:
      type: Sequelize.INTEGER
      allowNull: true
    uri:
      type: Sequelize.STRING
      allowNull: true
    is_submitted:
      type: Sequelize.INTEGER
      allowNull: true
  },
    tableName: 'fb_user_lead'
    createdAt: 'created_at'
    updatedAt: 'updated_at'
  )

  FbUserLead.associateRelations = (models) ->
      FbUserLead.belongsTo models.FbUser, foreignKey: 'fb_user_id'
      return
    FbUserLead
