module.exports = (sequelize, Sequelize) ->
    UserEducation = sequelize.define 'UserEducation', {
        id:
            autoIncrement: true
            primaryKey: true
            type: Sequelize.INTEGER
        year:
            type: Sequelize.INTEGER
            allowNull: true
        concentration_name:
            type: Sequelize.STRING
            allowNull: true
        school_name:
            type: Sequelize.STRING
            allowNull: true
        type:
            type: Sequelize.STRING
            allowNull: true
        facebook_id:
            type: Sequelize.STRING
            allowNull: false
        user_id:
            type: Sequelize.STRING
            allowNull: false
    },
    tableName: 'user_education'
    createdAt:'created_at'
    updatedAt: 'updated_at'
    
    UserEducation.associateRelations = (models) ->
        UserEducation.belongsTo models.User,
            foreignKey: 'user_id'
    UserEducation
