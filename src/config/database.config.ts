import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  name: process.env.DB_NAME || 'verilearn',
  poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 2,
  poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  ssl: process.env.DB_SSL === 'true',
}));
