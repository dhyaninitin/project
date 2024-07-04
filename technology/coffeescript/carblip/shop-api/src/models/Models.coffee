module.exports = (sequelize, DataTypes) ->
    Models = sequelize.define 'Models', {
        id:
            autoIncrement: true
            primaryKey: true
            type: DataTypes.INTEGER
            unique: true
        name:
            type: DataTypes.STRING
            allowNull: false
        brand_id:
            type: DataTypes.INTEGER
            allowNull: false
        sub_brand_id:
            type: DataTypes.INTEGER
            allowNull: false
        year:
            type: DataTypes.INTEGER
            allowNull: true
        msrp:
            type: DataTypes.DOUBLE
            allowNull: true
        image_url:
            type: DataTypes.STRING
            allowNull: true
        image_url_320:
            type: DataTypes.STRING
            allowNull: true
        image_url_640:
            type: DataTypes.STRING
            allowNull: true
        image_url_1280:
            type: DataTypes.STRING
            allowNull: true
        image_url_2100:
            type: DataTypes.STRING
            allowNull: true
        data_release_date:
            type: DataTypes.DATE
            allowNull: true
        initial_price_date:
            type: DataTypes.DATE
            allowNull: true
        data_effective_date:
            type: DataTypes.DATE
            allowNull: true
        comment:
            type: DataTypes.TEXT('tiny')
            allowNull: true
        is_new:
            type: DataTypes.INTEGER
            allowNull: false
        is_enable:
            type:DataTypes.INTEGER
            allowNull:false
    },
    tableName: 'models'
    createdAt: 'created_at'
    updatedAt: 'updated_at'

    Models.associateRelations = (models) ->
        Models.belongsTo models.Brands,
            foreignKey: 'brand_id'
            targetkey: 'id'
        Models.hasMany models.VehicleInventory, foreignKey: 'model_id'
        Models.hasMany models.Vehicles, foreignKey: 'model_id'
        Models.belongsToMany models.Categories,
            through: models.ModelCategory
            foreignKey: 'model_id'
    Models