import { Sequelize, DataTypes, Model, Association } from 'sequelize';
import { DataType } from 'sequelize-typescript';
import { sequelizeConnection } from '../config/db';

class Vehicles extends Model {
    public id!: number;
    public brand_id!: string;
    public model_id!: number;
    public model_no!: string;
    public trim!: string;
    public friendly_model_name!: string;
    public friendly_style_name!: string;
    public friendly_drivetrain!: string;
    public friendly_body_type!: string;
    public price!: number;
    public base_invoice!: number;
    public destination!: number;
    public year!: number;
    public image_url!: string;
    public image_url_320!: string;
    public image_url_640!: string;
    public image_url_1280!: string;
    public image_url_2100!: string;
    public media_status!: number;
    public media_update_at!: Date;
    public is_supported!: number;
    public is_new!: number;
    public is_active!: number;

    // Timestamps
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static associate(models: any): void {
        Vehicles.belongsTo(models.Brands, {
            foreignKey: 'brand_id'
        });

        Vehicles.belongsTo(models.Models, {
            foreignKey: 'model_id'
        });

        Vehicles.hasMany(models.VehicleColors, { foreignKey: 'vehicle_id' });
        Vehicles.hasMany(models.InteriorColors, { foreignKey: 'vehicle_id' });
        Vehicles.hasMany(models.VehicleInventory, { foreignKey: 'vehicle_id' });
        Vehicles.hasMany(models.VehicleOptions, { foreignKey: 'vehicle_id' });
        Vehicles.hasMany(models.VehicleMedia, { foreignKey: 'vehicle_id' });
    }
}

Vehicles.init(
    {
        id: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        brand_id: {
            type: DataType.STRING,
            allowNull: true
        },
        model_id: {
            type: DataType.INTEGER,
            allowNull: true
        },
        model_no: {
            type: DataType.STRING,
            allowNull: true
        },
        trim: {
            type: DataType.STRING,
            allowNull: true
        },
        friendly_model_name: {
            type: DataType.STRING,
            allowNull: true
        },
        friendly_style_name: {
            type: DataType.STRING,
            allowNull: true
        },
        friendly_drivetrain: {
            type: DataType.STRING,
            allowNull: true
        },
        friendly_body_type: {
            type: DataType.STRING,
            allowNull: true
        },
        price: {
            type: DataType.DOUBLE,
            allowNull: true
        },
        base_invoice: {
            type: DataType.DOUBLE,
            allowNull: true
        },
        destination: {
            type: DataType.DOUBLE,
            allowNull: true
        },
        year: {
            type: DataType.INTEGER,
            allowNull: true
        },
        image_url: {
            type: DataType.STRING,
            allowNull: true
        },
        image_url_320: {
            type: DataType.STRING,
            allowNull: true
        },
        image_url_640: {
            type: DataType.STRING,
            allowNull: true
        },
        image_url_1280: {
            type: DataType.STRING,
            allowNull: true
        },
        image_url_2100: {
            type: DataType.STRING,
            allowNull: true
        },
        media_status: {
            type: DataType.INTEGER,
            allowNull: true
        },
        media_update_at: {
            type: DataType.DATE,
            allowNull: true
        },
        is_supported: {
            type: DataType.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        is_new: {
            type: DataType.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_active: {
            type: DataType.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        created_at: {
            type: DataType.DATE,
            allowNull: true
        },
        updated_at: {
            type: DataType.DATE,
            allowNull: true
        }
    },
    {
        sequelize: sequelizeConnection,
        tableName: 'vehicles',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default Vehicles;