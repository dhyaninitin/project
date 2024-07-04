module.exports = (sequelize, DataTypes) ->
    SampleData = sequelize.define 'SampleData', {
        vif:
            type: DataTypes.INTEGER,
            primaryKey: true
            allowNull: false
        org:
            type: DataTypes.INTEGER
            allowNull: false
        send:
            type: DataTypes.INTEGER
            allowNull: false
        year:
            type: DataTypes.INTEGER
            allowNull: false
        make:
            type: DataTypes.STRING
            allowNull: false
        model:
            type: DataTypes.STRING
            allowNull: false
        trim:
            type: DataTypes.STRING
            allowNull: true
        drs:
            type: DataTypes.INTEGER
            allowNull: false
        body:
            type: DataTypes.STRING
            allowNull: false
        cab:
            type: DataTypes.STRING
            allowNull: true
        whls:
            type: DataTypes.STRING
            allowNull: false
        vin:
            type: DataTypes.STRING
            allowNull: false
        date_delivered:
            type: DataTypes.DATEONLY
            allowNull: false
        color_code:
            type: DataTypes.STRING
            allowNull: false
    },
    tableName: 'sample_data'
    timestamps: false