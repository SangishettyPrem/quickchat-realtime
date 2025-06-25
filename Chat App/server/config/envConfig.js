import dotenv from 'dotenv'
dotenv.config();

const envConfig = {
    jwtSecert: process.env.JWT_SECRET_KEY,
    port: process.env.PORT,
    nodeENV: process.env.NODE_ENV,

    // DB configruation
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME
}

export default envConfig;