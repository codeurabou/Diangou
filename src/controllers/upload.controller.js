const { etabModel } = require("../db/sequelize")
const { removeFile, checkFileSync } = require("../middlewares/multer")
const createError = require("../utils/error")
const { basename } = require("path")
const path = require("path")

const uploadCtrl = {
    addEtabLogo: async (req, res, next) => {
        try {
            const { etId } = req.params
            if (!req.file) return next(createError(400, "aucun fichier joint"))
            const findEtab = await etabModel.findByPk(etId)
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            if (!findEtab || findEtab.et_url)
                await removeFile(path.join(__dirname, "../uploads"), basename(req.file.filename))
            const { et_url, et_id } = findEtab
            if (et_url) return next(createError(400, "Votre etablissement à deja un logo : suprimer pour ajouter un nouveau"))
            const fileUrl = `${req.protocol}://${req.get("host")}/file/${req.file.filename}`
            await etabModel.update({ et_url: fileUrl }, { where: { et_id } })
            return res.json(fileUrl)
        } catch (err) { return next(err) }
    },
    removeEtabLogo: async (req, res, next) => {
        try {
            const { etId } = req.params
            const findEtab = await etabModel.findByPk(etId)
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            const { et_url, et_id } = findEtab
            if (!et_url) return next(createError(400, "Votre etablissement n'a aucun logo"))
            const isFile = checkFileSync(et_url)
            if (isFile) await removeFile(path.join(__dirname, "../uploads"), basename(et_url))
            await etabModel.update({ et_url: null }, { where: { et_id } })
            return res.json({ message: "removed" })
        } catch (err) { return next(err) }
    }
}

module.exports = uploadCtrl