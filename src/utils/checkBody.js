const createError = require("./error")

const checkBody = (...val) => {
    const tabs = [...val]
    const isValid = tabs.every(el => el !== undefined && el !== null && el !== "" && el !== '')
    return { isValid }
}
module.exports = checkBody