module.exports = (sequelize, Sequelize) ->
    UserLeaseInformation = sequelize.define 'UserLeaseInformation', {
        id:
            primaryKey: true
            autoIncrement: true
            type: Sequelize.INTEGER
        user_id:
            type: Sequelize.INTEGER
            allowNull: true
        buying_time:
            type: Sequelize.INTEGER
            allowNull: true
        buying_method:
            type: Sequelize.INTEGER
            allowNull: true
        will_trade:
            type: Sequelize.INTEGER
            allowNull: true
        year:
            type: Sequelize.INTEGER
            allowNull: true
        brand_id:
            type: Sequelize.INTEGER
            allowNull: true
        model_id:
            type: Sequelize.INTEGER
            allowNull: true
        miles:
            type: Sequelize.INTEGER
            allowNull: true
        term_in_months:
            type: Sequelize.INTEGER
            allowNull: true
        down_payment:
            type: Sequelize.DOUBLE
            allowNull: true
        annual_milage:
            type: Sequelize.DOUBLE
            allowNull: true
        credit_score:
            type: Sequelize.INTEGER
            allowNull: true
    },
    tableName: 'user_car_information'
    createdAt:'created_at'
    updatedAt:'updated_at'
    
    UserLeaseInformation.associateRelations = (models) ->
        UserLeaseInformation.belongsTo models.Brands,
            foreignKey: 'brand_id'
        UserLeaseInformation.belongsTo models.Models,
            foreignKey: 'model_id'
    UserLeaseInformation
