module.exports = (sequelize, DataTypes) ->
    Cars = sequelize.define 'Cars', {
        id:
            autoIncrement: true
            primaryKey: true
            type: DataTypes.INTEGER
        name:
            type: DataTypes.STRING
            allowNull: false
        make:
            type: DataTypes.STRING
            allowNull: true
        year:
            type: DataTypes.INTEGER
            allowNull: true
        model:
            type: DataTypes.STRING
            allowNull: true
        trim:
            type: DataTypes.STRING
            allowNull: true
        image:
            type: DataTypes.INTEGER
            allowNull: false
        price:
            type: DataTypes.STRING
            allowNull: false
        msrp:
            type: DataTypes.STRING
            allowNull: false
        car_condition:
            type: DataTypes.STRING
            allowNull: false
        dealer_name:
            type: DataTypes.STRING
            allowNull: false
        dealer_address:
            type: DataTypes.STRING
            allowNull: false
        dealer_city:
            type: DataTypes.STRING
            allowNull: false
        dealer_state:
            type: DataTypes.STRING
            allowNull: false
        dealer_zip:
            type: DataTypes.STRING
            allowNull: false
        dealer_distance:
            type: DataTypes.STRING
            allowNull: false
        dealer_contact:
            type: DataTypes.STRING
            allowNull: false
        mileage:
            type: DataTypes.INTEGER
            allowNull: false 
        ext_color:
            type: DataTypes.STRING
            allowNull: false
        int_color:
            type: DataTypes.STRING
            allowNull: false  
        transmission:
            type: DataTypes.STRING
            allowNull: false  
        drive_train:
            type: DataTypes.STRING
            allowNull: false  
        engine:
            type: DataTypes.STRING
            allowNull: false  
        vin:
            type: DataTypes.STRING
            allowNull: false  
        stock:
            type: DataTypes.STRING
            allowNull: false  
        mpg:
            type: DataTypes.STRING
            allowNull: false  
        fueltype:
            type: DataTypes.STRING
            allowNull: false  
        ratings:
            type: DataTypes.STRING
            allowNull: true   
        reviews:
            type: DataTypes.INTEGER
            allowNull: true 
        car_options:
            type: DataTypes.STRING
            allowNull: true 
        description:
            type: DataTypes.STRING
            allowNull: false            
    },
    tableName: 'cars'
    timestamps: false
