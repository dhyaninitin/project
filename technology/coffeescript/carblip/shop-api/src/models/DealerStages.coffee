module.exports = (sequelize, DataTypes) ->
    DealerStages = sequelize.define 'DealerStages', {
        id:
            autoIncrement: true
            primaryKey: true
            type: DataTypes.INTEGER
        stage_id:
            type: DataTypes.STRING
            allowNull: false
        label:
            type: DataTypes.STRING
            allowNull: true
        pipeline_name:
            type: DataTypes.STRING
            allowNull: true
        order:
            type: DataTypes.INTEGER
            allowNull: true
        active:
            type: DataTypes.INTEGER
            allowNull: true
    },
    tableName: 'deal_stage'
    createdAt: 'created_at'
    updatedAt: 'updated_at'
