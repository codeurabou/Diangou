const { Sequelize, DataTypes } = require("sequelize")
const config = require("../../config")
require("dotenv").config()

let sequelize
if (process.env.NODE_ENV === "production") {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        logging: config.production.logging,
        dialect: config.production.dialect,
        timezone: config.production.timezone,
        dialectOptions: { ...config.production.dialectOptions }
    })
}
else {
    sequelize = new Sequelize({
        username: config.developpement.username,
        password: config.developpement.password,
        database: config.developpement.database,
        host: config.developpement.host,
        port: config.developpement.port,
        logging: config.developpement.logging,
        timezone: config.developpement.timezone,
        dialect: config.developpement.dialect
    })
}

const isAuth = () => sequelize.authenticate()
    .then(() => console.log("connection reussit"))
    .catch(() => console.log("connection echoué"))
const isSync = (opts = "") => {
    const hasNoOptions = opts && !["alter", "force"].includes(opts)
    if (hasNoOptions) return new Error("options invalide")
    if (!opts) {
        sequelize.sync()
            .then(() => console.log("synchronisation reussit"))
            .catch(() => console.log("synchronisation echoué"))
    }
    else {
        const getOptions = opts === "alter" ? { alter: true } : { force: true }
        sequelize.sync(getOptions)
            .then(() => console.log("synchronisation reussit"))
            .catch(() => console.log("synchronisation echoué"))
    }
}

const userModel = require('../models/user')(sequelize, DataTypes)
const etabModel = require('../models/etab')(sequelize, DataTypes)
const ascolaireModel = require('../models/ascolaire')(sequelize, DataTypes)
const eleveModel = require("../models/eleve")(sequelize, DataTypes)
const serieModel = require("../models/serie")(sequelize, DataTypes)
const etabSerieModel = require("../models/etabserie")(sequelize, DataTypes)
const classeModel = require("../models/classe")(sequelize, DataTypes)
const inscriptionModel = require("../models/inscription")(sequelize, DataTypes)
const paiementModel = require("../models/paiement")(sequelize, DataTypes)
const profModel = require("../models/professeur")(sequelize, DataTypes)
const matiereModel = require("../models/matiere")(sequelize, DataTypes)
const matserieModel = require("../models/matserie")(sequelize, DataTypes)
const reglementModel = require("../models/reglement")(sequelize, DataTypes)
const noteModel = require("../models/note")(sequelize, DataTypes)
const courModel = require("../models/cours")(sequelize, DataTypes)
const apModel = require("../models/appel")(sequelize, DataTypes)
const apContenuModel = require("../models/apcontenu")(sequelize, DataTypes)

const models = {
    userModel,
    etabModel,
    ascolaireModel,
    eleveModel,
    serieModel,
    etabSerieModel,
    classeModel,
    inscriptionModel,
    paiementModel,
    profModel,
    matiereModel,
    matserieModel,
    reglementModel,
    noteModel,
    courModel,
    apModel,
    apContenuModel,
}
module.exports = { sequelize, isAuth, isSync, ...models }