import 'dotenv/config';

const { DataSource } = require('typeorm');
const { config } = require('./vendure-config');

const dbConnectionOptions = config.dbConnectionOptions;

if (dbConnectionOptions.type !== 'postgres') {
    throw new Error('This migration data source is configured for the Postgres Vendure setup.');
}

module.exports = new DataSource({
    type: 'postgres',
    synchronize: false,
    migrationsRun: false,
    logging: false,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [],
    migrations: ['src/migrations/*.+(js|ts)'],
});
