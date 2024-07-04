module.exports = (sequelize, Sequelize) ->
    UserInventoryLease = sequelize.define 'UserInventoryLease', {
        id:
            primaryKey: true
            autoIncrement: true
            type: Sequelize.INTEGER
        vehicle_inventory_id:
            type: Sequelize.INTEGER
            allowNull: true
        user_id:
            type: Sequelize.INTEGER
            allowNull: true
        isleaseselected:
            type: Sequelize.BOOLEAN
            allowNull: false
        terminmonths_lease:
            type: Sequelize.INTEGER
            allowNull: false
        cashdownpayment_lease:
            type: Sequelize.INTEGER
            allowNull: false
        tradeinvalue_lease:
            type: Sequelize.INTEGER
            allowNull: false
        annualmileage_lease:
            type: Sequelize.INTEGER
            allowNull: true
        terminmonths_loan:
            type: Sequelize.INTEGER
            allowNull: false
        cashdownpayment_loan:
            type: Sequelize.INTEGER
            allowNull: false
        tradeinvalue_loan:
            type: Sequelize.INTEGER
            allowNull: false
    },
    tableName: 'user_inventory_lease'
    createdAt:'created_at'
    updatedAt:'updated_at'