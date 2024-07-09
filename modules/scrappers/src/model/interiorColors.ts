import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelizeConnection } from '../config/db';

class InteriorColors extends Model {
    public id!: number;
    public vehicle_id!: number | null;
    public color!: string | null;
    public simple_color!: string;
    public oem_option_code!: string | null;
    public color_hex_code!: string | null;
    public msrp!: number | null;
    public invoice!: number | null;
    public static associateRelations(models: any): void {
        InteriorColors.hasMany(models.VehicleInventory, {
            foreignKey: 'interior_color_id'
        });

        InteriorColors.hasMany(models.VehicleRequestColors, {
            foreignKey: 'interior_color_id'
        });
    }
}

InteriorColors.init(
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER,
        },
        vehicle_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        simple_color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        oem_option_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        color_hex_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        msrp: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        invoice: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        }
    },
    {
        sequelize: sequelizeConnection,
        tableName: 'interior_colors',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default InteriorColors;
