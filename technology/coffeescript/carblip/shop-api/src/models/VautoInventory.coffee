module.exports = (sequelize, DataTypes) ->
  VautoInventory = sequelize.define('VautoInventory', {
    id:
      type: DataTypes.INTEGER(11).UNSIGNED
      allowNull: false
      primaryKey: true
      autoIncrement: true
    make:
      type: DataTypes.STRING(50)
      allowNull: false
    year:
      type: 'YEAR(4)'
      allowNull: true
    model:
      type: DataTypes.STRING(50)
      allowNull: true
    trim:
      type: DataTypes.STRING(50)
      allowNull: true
    price:
      type: DataTypes.INTEGER(11)
      allowNull: false
    msrp:
      type: DataTypes.INTEGER(11)
      allowNull: false
    ext_color:
      type: DataTypes.STRING(50)
      allowNull: true
    int_color:
      type: DataTypes.STRING(50)
      allowNull: true
    stock:
      type: DataTypes.STRING(50)
      allowNull: true
    transmission:
      type: DataTypes.STRING(50)
      allowNull: true
    vin:
      type: DataTypes.STRING(50)
      allowNull: true
    options:
      type: DataTypes.STRING
      allowNull: true
    engine_displacement:
      type: DataTypes.STRING(50)
      allowNull: true
    engine_cylinders:
      type: DataTypes.STRING(50)
      allowNull: true
    drive_train:
      type: DataTypes.STRING(50)
      allowNull: true
    city_mpg:
      type: DataTypes.STRING(20)
      allowNull: true
    highway_mpg:
      type: DataTypes.STRING(20)
      allowNull: true
    ext_color_code:
      type: DataTypes.STRING(50)
      allowNull: true
    int_color_code:
      type: DataTypes.STRING(50)
      allowNull: true
    provider_dealer_id:
      type: DataTypes.STRING(255)
      allowNull: true
    invoice:
      type: DataTypes.INTEGER(11)
      allowNull: false
    is_new:
      type: DataTypes.STRING(10)
      allowNull: false
  },
    tableName: 'vauto_inventory'
    freezeTableName: true
    underscored: true
    timestamps:false)
  VautoInventory
