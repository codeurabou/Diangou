require("dotenv").config()
const env = process.env
module.exports = {
    developpement: {
        username: env.USERNAME,
        database: env.DATABASE,
        password: env.PASSWORD,
        host: "127.0.0.1",
        port: 5432,
        dialect: "postgres",
        timezone: "+00:00",
        logging: false,
    },
    production: {
        logging: false,
        dialect: "postgres",
        timezone: "+00:00",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            }
        }
    }
}
