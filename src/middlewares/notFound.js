module.exports = (req, res) => {
    const { url, method } = req
    return res.status(400).json({ message: `ressource introuvable vers : ${method} ${url}` })
}