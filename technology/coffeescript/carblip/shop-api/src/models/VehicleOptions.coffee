module.exports = (sequelize, Sequelize) ->
    VehicleOptions = sequelize.define 'VehicleOptions', {
        id:
            primaryKey: true
            autoIncrement: true
            type: Sequelize.INTEGER
        vehicle_id:
            type: Sequelize.INTEGER
            allowNull: true
        chrome_option_code:
            type: Sequelize.STRING
            allowNull: true
        oem_option_code:
            type: Sequelize.STRING
            allowNull: true
        header_id:
            type: Sequelize.INTEGER
            allowNull: true
        header_name:
            type: Sequelize.STRING
            allowNull: true
        consumer_friendly_header_id:
            type: Sequelize.INTEGER
            allowNull: true
        consumer_friendly_header_name:
            type: Sequelize.STRING
            allowNull: true
        option_kind_id:
            type: Sequelize.INTEGER
            allowNull: true
        description:
            type: Sequelize.INTEGER
            allowNull: true
        msrp:
            type: Sequelize.DOUBLE
            allowNull: true
        invoice:
            type: Sequelize.DOUBLE
            allowNull: true
        front_weight:
            type: Sequelize.DOUBLE
            allowNull: true
        rear_weight:
            type: Sequelize.DOUBLE
            allowNull: true
        price_state:
            type: Sequelize.STRING
            allowNull: true
        affecting_option_code:
            type: Sequelize.STRING
            allowNull: true
        special_equipment:
            type: Sequelize.BOOLEAN
            allowNull: true
        extended_equipment:
            type: Sequelize.BOOLEAN
            allowNull: true
        custom_equipment:
            type: Sequelize.BOOLEAN
            allowNull: true
        option_package:
            type: Sequelize.BOOLEAN
            allowNull: true
        option_package_content_only:
            type: Sequelize.BOOLEAN
            allowNull: true
        discontinued:
            type: Sequelize.BOOLEAN
            allowNull: true
        option_family_code:
            type: Sequelize.STRING
            allowNull: true
        option_family_name:
            type: Sequelize.STRING
            allowNull: true
        selection_state:
            type: Sequelize.STRING
            allowNull: true
        unique_type_filter:
            type: Sequelize.STRING
            allowNull: true
    },
    tableName: 'vehicle_options'
    createdAt:'created_at'
    updatedAt:'updated_at'
    
    VehicleOptions.associateRelations = (models) ->
        VehicleOptions.belongsTo models.Vehicles,
            foreignKey: 'vehicle_id'
    VehicleOptions