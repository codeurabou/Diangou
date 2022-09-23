const { matiereModel, matserieModel, sequelize } = require("../db/sequelize")
const checkBody = require("../utils/checkBody")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")

const matCtrl = {
    addMatiere: async (req, res, next) => {
        try {
            const { nom, ab } = req.body
            const { isValid } = checkBody(nom, ab)
            if (isValid === false) return next(createError(400, "champs invalide"))
            await matiereModel.create({ ma_nom: nom, ma_nomab: ab })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "matieres_unique1:matiere existe",
                "matieres_unique2:matiere abregé pris"
            )
        }
    },
    editMatiere: async (req, res, next) => {
        try {
            const { maId } = req.params
            const { nom, ab } = req.body
            const findMatiere = await matiereModel.findByPk(maId)
            if (!findMatiere) return next(createError(400, "matiere introuvable"))
            const { ma_id, ma_nom, ma_nomab } = findMatiere
            await matiereModel.update({ ma_nom: nom || ma_nom, ma_nomab: ab || ma_nomab }, { where: { ma_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "matieres_unique1:matiere existe",
                "matieres_unique2:matiere abregé pris"
            )
        }
    },
    getMatiere: async (req, res, next) => {
        try {
            const query = `select ma_id as value,ma_nom label,ma_nomab from matieres order by ma_nom`
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    removeMatiere: async (req, res, next) => {
        try {
            const { maId } = req.params
            const findMatiere = await matiereModel.findByPk(maId)
            if (!findMatiere) return next(createError(400, "matiere introuvable"))
            const { ma_id } = findMatiere
            await matiereModel.destroy({ where: { ma_id } })
            return res.json({ message: "deleted" })
        } catch (err) { return next(err) }
    },
    addMatSerie: async (req, res, next) => {
        try {
            const { coef, se_id, ma_id, et_id } = req.body
            const { isValid } = checkBody(coef, ma_id, se_id, et_id)
            if (isValid === false) return next(createError(400, "champs invalide"))
            await matserieModel.create({ ma_id, se_id, et_id, ms_coef: coef })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "matseries_unique1:matiere dejas definis",
                "matseries_check1:coefficient superieur à zero",
                "matseries_fkey1:matiere introuvable",
                "matseries_fkey2:serie introuvable",
                "matseries_fkey3:etablissement introuvable"
            )
        }
    },
    editMatSerie: async (req, res, next) => {
        try {
            const { msId } = req.params
            const { coef, ma_id } = req.body
            const findMatSerie = await matserieModel.findByPk(msId)
            if (!findMatSerie) return next(createError(400, "matiere par serie introuvable"))
            const { ms_id, ms_coef, ma_id: maId } = findMatSerie
            await matserieModel.update({ ma_id: ma_id || maId, ms_coef: coef || ms_coef }, { where: { ms_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "matseries_unique1:matiere dejas definis",
                "matseries_check1:coefficient superieur à zero",
                "matseries_fkey1:matiere introuvable",
                "matseries_fkey2:serie introuvable",
                "matseries_fkey3:etablissement introuvable"
            )
        }
    },
    getMatSerieEtab: async (req, res, next) => {
        try {
            const { etId } = req.params
            const { s } = req.query
            const query = `
                select ms_id,ms_coef coef,ma_nom,ma_id 
                from matseries join matieres using(ma_id) where et_id=${etId} ${s ? `and se_id=${s}` : ''} order by ma_nom
            `
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    getMatSerieEtabAdapt: async (req, res, next) => {
        try {
            const { etId } = req.params
            const { s } = req.query
            const query = `
                select ma_id as value,ma_nom as label
                from matseries join matieres using(ma_id) where et_id=${etId} ${s ? `and se_id=${s}` : ''} order by ma_nom
            `
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    removeMatSerie: async (req, res, next) => {
        try {
            const { msId } = req.params
            const findMatSerie = await matserieModel.findByPk(msId)
            if (!findMatSerie) return next(createError(400, "matiere serie introuvable"))
            const { ms_id } = findMatSerie
            await matserieModel.destroy({ where: { ms_id } })
            return res.json({ message: "deleted" })
        } catch (err) { return next(err) }
    }
}
module.exports = matCtrl