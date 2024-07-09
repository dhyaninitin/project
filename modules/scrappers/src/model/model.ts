import { Sequelize, DataTypes, Model } from 'sequelize';
import ModelInterface from '../Interface/modelInterface';
import { sequelizeConnection } from '../config/db';


class Models extends Model<ModelInterface> {
    public id!: number;
    public name!: string;
    public image_url!: string;
    public brand_id!: number;
    public sub_brand_id!: number;
    public year!: number;
    public msrp!: number;
    public image_url_320!: string;
    public image_url_640!: string;
    public image_url_1280!: string;
    public image_url_2100!: string;
    public data_release_date!: Date;
    public initial_price_date!: Date;
    public data_effective_date!: Date;
    public comment!: string;
    public is_new!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static associateRelations(models: any): void {
        Models.belongsTo(models.Brands, {
            foreignKey: 'brand_id',
            targetKey: 'id',
        });

        Models.hasMany(models.VehicleInventory, { foreignKey: 'model_id' });
        Models.hasMany(models.Vehicles, { foreignKey: 'model_id' });

        Models.belongsToMany(models.Categories, {
            through: models.ModelCategory,
            foreignKey: 'model_id',
        });
    }
}

Models.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sub_brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    msrp: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image_url_320: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image_url_640: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image_url_1280: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image_url_2100: {
        type: DataTypes.STRING,
        allowNull: true
    },
    data_release_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    initial_price_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    data_effective_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    comment: {
        type: DataTypes.TEXT('tiny'),
        allowNull: true
    },
    is_new: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: sequelizeConnection,
    modelName: 'models',
    tableName: 'models',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Models;