const { courModel, empModel, sequelize } = require("../db/sequelize")
const checkBody = require("../utils/checkBody")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")

const courCtrl = {
    addCours: async (req, res, next) => {
        try {
            const { pr_id, ma_id, cl_id } = req.body
            const { isValid } = checkBody(pr_id, ma_id, cl_id)
            if (isValid === false) return next(createError(400, "champs invalide"))
            await courModel.create({ pr_id, ma_id, cl_id })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "cours_unique1:cours dejas definis",
                "cours_fkey1:professeur introuvable",
                "cours_fkey2:matiere introuvable",
                "cours_fkey3:classe introuvable"
            )
        }
    },
    editCours: async (req, res, next) => {
        try {
            const { coId } = req.params
            const { pr_id, ma_id } = req.body
            const findCours = await courModel.findByPk(coId)
            if (!findCours) return next(createError(400, "cours introuvable"))
            const { co_id, pr_id: prId, ma_id: maId } = findCours
            await courModel.update({ pr_id: pr_id || prId, ma_id: ma_id || maId }, { where: { co_id } })
            return res.json({ message: "updated" })
        }
        catch (err) {
            pgError(err, next,
                "cours_unique1:cours dejas definis",
                "cours_fkey1:professeur introuvable",
                "cours_fkey2:matiere introuvable",
                "cours_fkey3:classe introuvable",
                "emptemps_unique:emplois du temps definis",
                "emptemps_check1:jour incorrect",
                "emptemps_check2:heure debut doit etre inferieur:",
                "emptemps_fkey1:cours introuvable",
            )
        }
    },
    getClasseCours: async (req, res, next) => {
        try {
            const { clId } = req.params
            const query = `
                select co_id,ma_nom,pr_prenom||' '||pr_nom nom,cl_nom,ma_id,pr_id
                       from cours 
                       join classes using(cl_id)
                       join professeurs using(pr_id)
                       join matieres using(ma_id)
                       where cl_id=${clId}
                       order by ma_nom
            `
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    removeCours: async (req, res, next) => {
        try {
            const { coId } = req.params
            const findCours = await courModel.findByPk(coId)
            if (!findCours) return next(createError(400, "cours introuvable"))
            const { co_id } = findCours
            await courModel.destroy({ where: { co_id } })
            return res.json({ message: "deleted" })
        } catch (err) { return next(err) }
    }
}

module.exports = courCtrl