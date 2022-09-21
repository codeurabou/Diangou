const createError = require("../utils/error")
const jwt = require("jsonwebtoken")
const { userModel } = require("../db/sequelize")
require("dotenv").config()
module.exports = async (req, res, next) => {
    try {
        if (!req.headers.authorization) return next(createError(400, "entete requis"))
        const token = req.headers.authorization.split(' ')[1]
        const decodeToken = jwt.decode(token, process.env.TOKEN_SECRET)
        if (!decodeToken) return next(createError(400, "jeton invalide"))
        const usId = decodeToken.usId
        if (req.body.us_id && !usId === parseInt(req.body.us_id, 10)) return next(createError(400, "ID invalide"))
        const findUser = await userModel.findByPk(usId)
        if (!findUser) return next(createError(400, "utilisateur introuvable"))
        const user = findUser.dataValues
        delete user.us_pass
        req.user = user
        next()
    } catch (err) { return next(err) }
}