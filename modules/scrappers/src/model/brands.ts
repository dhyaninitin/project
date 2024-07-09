import { DataTypes, Model, Sequelize } from 'sequelize';
import BrandsInterface from '../Interface/brandInterface';
import { sequelizeConnection } from '../config/db';


class Brands extends Model<BrandsInterface> {
    public id!: number;
    public name!: string;
    public image_url!: string;
    public years!:any;
    public is_active!:number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static associateRelations(models: any): void {
        Brands.hasMany(models.Models, {
            foreignKey: 'brand_id'
        });

        Brands.hasMany(models.VehicleInventory, {
            foreignKey: 'brand_id'
        });
    }
}

Brands.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    years: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
},
    {
        sequelize: sequelizeConnection,
        modelName: 'Brands',
        tableName: 'brands',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });


export default Brands;