import { Sequelize, Model, DataTypes } from 'sequelize';
import { sequelizeConnection } from '../config/db';
import VehicleInterFace from '../Interface/vehicleMedia';

class VehicleMedia extends Model<VehicleInterFace> {
    id!: number;
    vehicle_id!: number;
    url!: string | null;
    primary_color_option_code!: string | null;
    secondary_color_option_code!: string | null;
    primary_rgb!: string | null;
    secondary_rgb!: string | null;
    width!: number | null;
    height!: number | null;
    shot_code!: number | null;
    background_type!: number | null;
    type!: number | null;

    static associateRelations(models: any) {
        VehicleMedia.belongsTo(models.Vehicles, {
            foreignKey: 'vehicle_id'
        });
    }
}

VehicleMedia.init(
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER
        },
        vehicle_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        primary_color_option_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        secondary_color_option_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        primary_rgb: {
            type: DataTypes.STRING,
            allowNull: true
        },
        secondary_rgb: {
            type: DataTypes.STRING,
            allowNull: true
        },
        width: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        height: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        shot_code: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        background_type: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        sequelize: sequelizeConnection,
        modelName: 'VehicleMedia',
        tableName: 'vehicle_media',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

export default VehicleMedia;