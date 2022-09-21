require("dotenv").config()
const jwt = require("jsonwebtoken")
const generateToken = (obj = {}, exp = 18000, unite = "s") => jwt.sign(obj, process.env.TOKEN_SECRET, { expiresIn: `${exp}${unite}` })
module.exports = generateToken