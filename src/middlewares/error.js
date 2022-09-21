module.exports = (err, req, res, next) => {
    const status = err.status || 500
    const message = err.message || "something went wrong"
    const stack = err.stack
    return res.status(status).json({ succes: false, message: message, stack: stack })
}