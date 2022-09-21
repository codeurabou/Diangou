const createError = require("../utils/error")
const checkRole = (roles) => {
    return (req, res, next) => {
        const crole = req.user.us_role
        const hasRoles = Array.isArray(roles)
        const hasNoRoles = (hasRoles && crole && !roles.includes(crole))

        if (!crole) return next(createError(400, "role non defini"))
        if (!hasRoles) return next(createError(400, "veillez definir les roles"))
        if (hasNoRoles) return next(createError(400, "permissions refusé"))
        next()
    }
}
module.exports = checkRole