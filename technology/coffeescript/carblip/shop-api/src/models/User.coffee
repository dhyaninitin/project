module.exports = (sequelize, Sequelize) ->
  User = sequelize.define('User', {
    id:
      autoIncrement: true
      primaryKey: true
      type: Sequelize.INTEGER
    first_name:
      type: Sequelize.STRING
      allowNull: true
    last_name:
      type: Sequelize.STRING
      allowNull: true
    gender:
      type: Sequelize.STRING
      allowNull: true
    date_of_birth:
      type: Sequelize.DATE
      allowNull: true
    email_address:
      type: Sequelize.STRING
    contact_owner_email:
      type: Sequelize.STRING
    app_version:
      type: Sequelize.STRING
    password:
      type: Sequelize.STRING
      allowNull: true
    facebook_id:
      type: Sequelize.STRING
      allowNull: true
    device_token:
      type: Sequelize.STRING
      allowNull: true
    device_type:
      type: Sequelize.STRING
      allowNull: true
    access_token:
      type: Sequelize.STRING
      allowNull: true
    otp:
      type: Sequelize.INTEGER
      allowNull: true
    phone:
      type: Sequelize.STRING
      allowNull: true
    phone_verified:
      type: Sequelize.BOOLEAN
      defaultValue: '0'
    otp_tmp:
      type: Sequelize.INTEGER
      allowNull: true
    phone_tmp:
      type: Sequelize.STRING
      allowNull: true
    status:
      type: Sequelize.INTEGER
      defaultValue: '0'
    zipcode:
      type: Sequelize.STRING
      allowNull: true
    location:
      type: Sequelize.STRING
      allowNull: true
    login_verify_code:
      type: Sequelize.STRING
      allowNull: true
    lease_captured:
      type: Sequelize.BOOLEAN
      defaultValue: '0'
    is_active:
      type: Sequelize.BOOLEAN
      defaultValue: '1'
    appsflyer_id:
      type: Sequelize.STRING
      allowNull: true
    idfa:
      type: Sequelize.STRING
      allowNull: true
    idfv:
      type: Sequelize.STRING
      allowNull: true
    phone_preferred_contact:
      type: Sequelize.INTEGER
      allowNull: true
    phone_preferred_time:
      type: Sequelize.STRING
      allowNull: true
    phone_preferred_type:
      type: Sequelize.STRING
      allowNull: true
    street_address:
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
    source:
      type: Sequelize.INTEGER
      allowNull: true
    type:
      type: Sequelize.INTEGER
      allowNull: true
    concierge_state:
      type: Sequelize.STRING
      allowNull: true
    over18:
      type: Sequelize.INTEGER
      allowNull: true
    concierge_referral_url:
      type: Sequelize.STRING
      allowNull: true
    hubspot_contact_id:
      type: Sequelize.BIGINT
      allowNull: true
  },
    tableName: 'user'
    createdAt: 'created_at'
    updatedAt: 'updated_at'
  )

  User.associateRelations = (models) ->
    User.hasMany models.UserEducation, foreignKey: 'user_id'
    User.hasMany models.UserWorkHistory, foreignKey: 'user_id'
  User
