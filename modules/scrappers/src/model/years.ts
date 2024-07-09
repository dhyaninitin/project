import { Model } from 'sequelize';
import { DataType } from 'sequelize-typescript';
import { sequelizeConnection } from '../config/db';

class Years extends Model {
    public id!: number;
    public year!: string;
    public is_active!: number;
    public is_default!:number;
    public is_scrapable!:number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Years.init({
    id: {
        type: DataType.INTEGER,
        primaryKey: true,
    },
    year: {
        type: DataType.STRING,
        allowNull: false,
    },
    is_active: {
        type: DataType.NUMBER,
        allowNull: true,
    },
    is_default:{
        type:DataType.NUMBER,
        allowNull:true
    },
    is_scrapable:{
        type:DataType.NUMBER,
        allowNull:true
    },
    created_at: {
        type: DataType.DATE,
        allowNull: false,
    },
    updated_at: {
        type: DataType.DATE,
        allowNull: false,
    },
},
    {
        sequelize: sequelizeConnection,
        modelName: 'Years',
        tableName: 'years',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });


export default Years;