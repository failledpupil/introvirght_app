import { Sequelize } from 'sequelize';

let sequelize: Sequelize | null = null;

export const initializePostgresDatabase = async (): Promise<Sequelize> => {
  if (sequelize) {
    return sequelize;
  }

  try {
    // Use DATABASE_URL for production (Railway, Render, etc.)
    const databaseUrl = process.env.DATABASE_URL;
    
    if (databaseUrl) {
      sequelize = new Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      });
    } else {
      // Fallback to individual environment variables
      sequelize = new Sequelize({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'introvirght',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        dialectOptions: process.env.NODE_ENV === 'production' ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        } : {},
      });
    }

    // Test the connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL database connection established successfully');

    // Sync database (create tables)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database tables synchronized successfully');

    return sequelize;
  } catch (error) {
    console.error('❌ PostgreSQL database initialization failed:', error);
    throw error;
  }
};

export const getPostgresDatabase = (): Sequelize => {
  if (!sequelize) {
    throw new Error('PostgreSQL database not initialized. Call initializePostgresDatabase() first.');
  }
  return sequelize;
};

export const closePostgresDatabase = async (): Promise<void> => {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    console.log('✅ PostgreSQL database connection closed');
  }
};