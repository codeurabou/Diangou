const createError = require("./error")
const pgError = (err, next, ...args) => {
    if (!err) return
    const constraint = err?.original?.constraint
    const tab = [...args]
    const finded = tab.find(d => d.split(':')[0] === constraint)
    if (finded) return next(createError(400, finded.split(':')[1]))
    return next(err)
}
module.exports = pgError