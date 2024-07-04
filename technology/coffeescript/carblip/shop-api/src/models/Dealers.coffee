module.exports = (sequelize, DataTypes) ->
  Dealers= sequelize.define( 'Dealers', {
    id:
      type: DataTypes.INTEGER(11).UNSIGNED
      allowNull: false
      primaryKey: true
      autoIncrement: true
    mscan_account_number:
      type: DataTypes.STRING(10)
      allowNull: true
    provider_dealer_id:
      type: DataTypes.STRING(255)
      allowNull: true
    name:
      type: DataTypes.STRING(255)
      allowNull: true
    email:
      type: DataTypes.STRING(255)
      allowNull: true
    address:
      type: DataTypes.STRING(255)
      allowNull: true
    state:
      type: DataTypes.STRING(20)
      allowNull: true
    city:
      type: DataTypes.STRING(20)
      allowNull: true
    zip:
      type: DataTypes.STRING(10)
      allowNull: true
    contact:
      type: DataTypes.STRING(20)
      allowNull: true
    lead_gen_system:
      type: DataTypes.STRING(255)
      allowNull: true
    lead_gen_email:
      type: DataTypes.STRING(255)
      allowNull: true
    status:
      type: DataTypes.INTEGER(11)
      allowNull: true
    feed_source:
      type: DataTypes.STRING(255)
      allowNull: true
    dealer_primary:
      type: DataTypes.INTEGER
      allowNull: true
    contact_name:
      type: DataTypes.STRING(300)
      allowNull: true
  },
      tableName: 'dealers'
      freezeTableName: true
      underscored: true
      createdAt:'created_at'
      updatedAt:'updated_at'
      )
  Dealers
