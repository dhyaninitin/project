module.exports = (sequelize, DataTypes) ->
  HomenetInventory = sequelize.define('HomenetInventory', {
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
    selling_price:
      type: DataTypes.INTEGER(11)
      allowNull: false
    price:
      type: DataTypes.INTEGER(11)
      allowNull: false
    dealer_name:
      type: DataTypes.STRING(50)
      allowNull: true
    dealer_email:
      type: DataTypes.STRING(255)
      allowNull: false
    dealer_contact:
      type: DataTypes.STRING(20)
      allowNull: false
    dealer_address:
      type: DataTypes.STRING(50)
      allowNull: false
    dealer_city:
      type: DataTypes.STRING(50)
      allowNull: false
    dealer_state:
      type: DataTypes.STRING(50)
      allowNull: false
    dealer_zip:
      type: DataTypes.STRING(10)
      allowNull: false
    fuel_type:
      type: DataTypes.STRING(50)
      allowNull: true
    drive_train:
      type: DataTypes.STRING(50)
      allowNull: true
    ext_color:
      type: DataTypes.STRING(50)
      allowNull: true
    int_color:
      type: DataTypes.STRING(50)
      allowNull: true
    ext_color_generic:
      type: DataTypes.STRING(20)
      allowNull: true
    int_color_generic:
      type: DataTypes.STRING(20)
      allowNull: true
    stock:
      type: DataTypes.STRING(50)
      allowNull: true
    transmission:
      type: DataTypes.STRING(50)
      allowNull: true
    miles:
      type: DataTypes.STRING(10)
      allowNull: true
    vin:
      type: DataTypes.STRING(50)
      allowNull: true
    options:
      type: DataTypes.STRING
      allowNull: true
    city_mpg:
      type: DataTypes.STRING(20)
      allowNull: true
    highway_mpg:
      type: DataTypes.STRING(20)
      allowNull: true
    engine_displacement:
      type: DataTypes.STRING(50)
      allowNull: true
    engine_cylinders:
      type: DataTypes.STRING(50)
      allowNull: true
    ext_color_code:
      type: DataTypes.STRING(50)
      allowNull: true
    int_color_code:
      type: DataTypes.STRING(50)
      allowNull: true
    ext_color_hex_code:
      type: DataTypes.STRING(20)
      allowNull: true
    int_color_hex_code:
      type: DataTypes.STRING(20)
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
    tableName: 'homenet_inventory'
    freezeTableName: true
    underscored: true
    timestamps:false)
  HomenetInventory
