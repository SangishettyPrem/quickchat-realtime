import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import envConfig from "./envConfig.js";

dotenv.config();

const sequelize = new Sequelize(
    envConfig.dbName,
    envConfig.dbUser,
    envConfig.dbPassword,
    {
        host: envConfig.dbHost,
        dialect: "mysql",
        logging: false,
    }
);

sequelize
    .authenticate().then(() => {
        console.log("DB Connection successfully")
    })
    .catch((error) => console.error("Error While Connecting Database: ", error));

export default sequelize;
