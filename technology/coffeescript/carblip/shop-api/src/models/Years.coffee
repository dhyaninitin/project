module.exports = (sequelize, DataTypes) ->
  Years = sequelize.define 'Years', {
    id:
      type: DataTypes.INTEGER(11).UNSIGNED
      allowNull: false
      primaryKey: true
      autoIncrement: true
    year:
      type: 'YEAR(4)'
      allowNull: true
    is_default:
      type:DataTypes.INTEGER
      allowNull:true
    is_active:
      type: DataTypes.INTEGER
      allowNull: true
  },
  tableName: 'years'
  createdAt: 'created_at'
  updatedAt: 'updated_at'
  Years