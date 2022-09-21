const fs = require("fs")
const path = require("path")
const { sequelize } = require("./src/db/sequelize")
const readConstraintFile = fs.readFileSync(path.join(__dirname, "src/db", "pg_cons.sql"), "utf-8")

console.log("*** Excution des contraintes ***")
sequelize.query(readConstraintFile)
    .then(() => console.log("Execution terminer"))
    .catch((err) => console.error(err))