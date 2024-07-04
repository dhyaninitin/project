module.exports = (sequelize, Sequelize) ->
    UserWorkHistory = sequelize.define 'UserWorkHistory', {
        id:
            autoIncrement: true
            primaryKey: true
            type: Sequelize.INTEGER
        start_date:
            type: Sequelize.DATE
            allowNull: true
        end_date:
            type: Sequelize.DATE
            allowNull: true
        employer_name:
            type: Sequelize.STRING
            allowNull: true
        position:
            type: Sequelize.STRING
            allowNull: true
        facebook_id:
            type: Sequelize.STRING
            allowNull: false
        user_id:
            type: Sequelize.STRING
            allowNull: false
    },
    tableName: 'user_work_history'
    createdAt:'created_at'
    updatedAt: 'updated_at'
    
    UserWorkHistory.associateRelations = (models) ->
        UserWorkHistory.belongsTo models.User,
            foreignKey: 'user_id'
    UserWorkHistory
