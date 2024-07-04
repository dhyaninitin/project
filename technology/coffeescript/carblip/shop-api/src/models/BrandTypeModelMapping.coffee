module.exports = (sequelize, DataTypes) ->
    BrandTypeModelMapping = sequelize.define 'BrandTypeModelMapping', {
        id:
            autoIncrement: true
            primaryKey: true
            type: DataTypes.INTEGER
        brand_id:
            type: DataTypes.INTEGER(20)
            allowNull: true
            references:
                model: 'Brands'
                key: 'id'
        type_id:
            type: DataTypes.INTEGER(20)
            allowNull: true
            references:
                model: 'Types'
                key: 'id'
        model_id:
            type: DataTypes.INTEGER(20)
            allowNull: true
            references:
                model: 'Models'
                key: 'id'
    },
    tableName: 'brand_type_model_mapping'
    createdAt:'created_at'
    updatedAt: false
