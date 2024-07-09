import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelizeConnection } from '../config/db';

class VehicleOptions extends Model {
    public id!: number;
    public vehicle_id!: number | null;
    public chrome_option_code!: string | null;
    public oem_option_code!: string | null;
    public header_id!: number | null;
    public header_name!: string | null;
    public consumer_friendly_header_id!: number | null;
    public consumer_friendly_header_name!: string | null;
    public option_kind_id!: number | null;
    public description!: number | null;
    public msrp!: number | null;
    public invoice!: number | null;
    public front_weight!: number | null;
    public rear_weight!: number | null;
    public price_state!: string | null;
    public affecting_option_code!: string | null;
    public special_equipment!: boolean | null;
    public extended_equipment!: boolean | null;
    public custom_equipment!: boolean | null;
    public option_package!: boolean | null;
    public option_package_content_only!: boolean | null;
    public discontinued!: boolean | null;
    public option_family_code!: string | null;
    public option_family_name!: string | null;
    public selection_state!: string | null;
    public unique_type_filter!: string | null;

    // Timestamps
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static associateRelations(models: any): void {
        VehicleOptions.belongsTo(models.Vehicles, {
            foreignKey: 'vehicle_id'
        });
    }
}

VehicleOptions.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    vehicle_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    chrome_option_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    oem_option_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    header_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    header_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    consumer_friendly_header_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    consumer_friendly_header_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    option_kind_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    description: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    msrp: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    invoice: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    front_weight: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    rear_weight: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    price_state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    affecting_option_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    special_equipment: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    extended_equipment: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    custom_equipment: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    option_package: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    option_package_content_only: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    discontinued: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    option_family_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    option_family_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    selection_state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    unique_type_filter: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize:sequelizeConnection,
    tableName: 'vehicle_options',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});


export default VehicleOptions;