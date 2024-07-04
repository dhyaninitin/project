module.exports = (sequelize, Sequelize) ->
    VehicleRequests = sequelize.define 'VehicleRequests', {
        id:
            autoIncrement: true
            primaryKey: true
            type: Sequelize.INTEGER
        vehicle_id:
            type: Sequelize.INTEGER
            allowNull: true
        vehicle_type:
            type: Sequelize.INTEGER
            allowNull: true
        price_type:
            type: Sequelize.INTEGER
            allowNull: true
        vehicle_req_preferences_id:
            type: Sequelize.INTEGER
            allowNull: true
        user_id:
            type: Sequelize.INTEGER
            allowNull: true
        status:
            type: Sequelize.INTEGER
            allowNull: true
        request_made_at:
            type: Sequelize.STRING
            allowNull: true
        total_price:
            type: Sequelize.INTEGER
            allowNull: true
        credit_score:
            type: Sequelize.INTEGER
            allowNull: true
        buying_method:
            type: Sequelize.INTEGER
            allowNull: true
        buying_time:
            type: Sequelize.INTEGER
            allowNull: true
        min_price:
            type: Sequelize.INTEGER
            allowNull: true
        max_price:
            type: Sequelize.INTEGER
            allowNull: true
        referral_code:
            type: Sequelize.STRING
            allowNull: true
        order_number:
            type: Sequelize.STRING(40)
            allowNull: true
        is_complete:
            type: Sequelize.INTEGER
            allowNull: true
        source_utm:
            type: Sequelize.INTEGER
            allowNull: true
        configuration_state_id:
            type: Sequelize.TEXT
            allowNull: true
        request_type:
            type: Sequelize.INTEGER
            allowNull: true
        deal_id:
            type: Sequelize.STRING
            allowNull: true
        car_direct_id:
            type: Sequelize.STRING
            allowNull: true
        style:
            type: Sequelize.STRING
            allowNull: true
        color_preference:
            type: Sequelize.STRING
            allowNull: true
        price_comment:
            type: Sequelize.STRING
            allowNull: true
        finance_method:
            type: Sequelize.STRING
            allowNull: true
        finance_type:
            type: Sequelize.STRING
            allowNull: true
        finance_amount:
            type: Sequelize.INTEGER
            allowNull: true
        provider_id :
            type:Sequelize.INTEGER
            allowNull:true
        provider_name:
            type:Sequelize.STRING
            allowNull: true
        deal_stage:
            type:Sequelize.STRING
            allowNull: true
        portal_deal_stage:
            type:Sequelize.STRING
            allowNull: true
        
    },
    tableName: 'vehicle_requests'
    createdAt: 'created_at'
    updatedAt: 'updated_at'
    
    VehicleRequests.associateRelations = (models) ->
        VehicleRequests.belongsTo models.User,
            foreignKey: 'user_id'
        VehicleRequests.belongsTo models.Vehicles,
            foreignKey: 'vehicle_id'
        VehicleRequests.belongsTo models.VehicleRequestPreferences,
            foreignKey: 'vehicle_req_preferences_id'
        VehicleRequests.hasMany models.VehicleRequestColors,
            foreignKey: 'vehicle_request_id'
        VehicleRequests.hasMany models.CreditApplication,
            foreignKey: 'vehicle_request_id'
        VehicleRequests.hasMany models.VehicleRequestOptions,
            foreignKey: 'vehicle_request_id'
    VehicleRequests
