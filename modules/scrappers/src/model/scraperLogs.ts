import { DataTypes, Model, Sequelize } from 'sequelize';
import ScraperLogsInterface from '../Interface/scraperLogs';
import { sequelizeConnection } from '../config/db';


class ScraperLogs extends Model {
  public id!: number;
  public content!: Text;
  public status!:number;
  public status_type!:number;
  public scraper_type!:number;
  public is_running!:number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ScraperLogs.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status_type: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scraper_type:{
    type:DataTypes.INTEGER,
    allowNull:true
  },
  is_running:{
    type:DataTypes.INTEGER,
    allowNull:true
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
    modelName: 'ScraperLogs',
    tableName: 'scrapers_logs',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

export default ScraperLogs;