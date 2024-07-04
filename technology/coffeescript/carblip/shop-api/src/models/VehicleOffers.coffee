module.exports = (sequelize, Sequelize) ->
    VehicleOffers = sequelize.define 'VehicleOffers', {
        id:
            autoIncrement: true
            primaryKey: true
            type: Sequelize.INTEGER
        vehicle_inventory_id:
            type: Sequelize.INTEGER
            allowNull: true
        user_id:
            type: Sequelize.INTEGER
            allowNull: true
        status:
            type: Sequelize.INTEGER
            allowNull: true
        order_number:
            type: Sequelize.STRING(40)
            allowNull: true
        last_offered_price:
            type: Sequelize.INTEGER
            allowNull: true
        last_offer_made_at:
            type: Sequelize.STRING
            allowNull: true
        last_offered_price:
            type: Sequelize.INTEGER
            allowNull: false
        is_deleted:
            type: Sequelize.INTEGER
            defaultValue: '0'
        premium:
            type: Sequelize.INTEGER
            defaultValue: '0'
    },
    tableName: 'vehicle_offers'
    timestamps: false
    
    VehicleOffers.associateRelations = (models) ->
        VehicleOffers.belongsTo models.User,
            foreignKey: 'user_id'
        VehicleOffers.belongsTo models.VehicleInventory,
            foreignKey: 'vehicle_inventory_id'
        VehicleOffers.hasMany models.VehicleOfferConversations,
            foreignKey: 'vehicle_offer_id'
    VehicleOffers
