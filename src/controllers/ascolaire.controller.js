const { ascolaireModel, sequelize } = require("../db/sequelize")
const backup = require("../utils/backup")
const checkBody = require("../utils/checkBody")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")

const ascolaireCtrl = {
    addAscoalraie: async (req, res, next) => {
        try {
            const { d, f, et_id } = req.body
            const { isValid } = checkBody(d, f, et_id)
            if (isValid === false) return next(createError(400, "champs invalide"))
            await ascolaireModel.create({ as_d: d, as_f: f, et_id })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "ascolaires_unique1:annee scolaire existe",
                "ascolaires_check1:date debut doit etre inferieur au date de fin",
                "ascolaires_check2:ne vaut pas une année scolaire au moins 8 mois ou plus",
                "ascolaires_fkey1:etablissement introuvable"
            )
        }
    },
    editAscolaire: async (req, res, next) => {
        try {
            const { asId } = req.params
            const { d, f } = req.body
            const findAscolaire = await ascolaireModel.findByPk(asId)
            if (!findAscolaire) return next(createError(400, "annee scolaire introuvable"))
            const { as_id } = findAscolaire
            await ascolaireModel.update({ as_d: d, as_f: f }, { where: { as_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "ascolaires_unique1:annee scolaire existe",
                "ascolaires_check1:date debut doit etre inferieur au date de fin",
                "ascolaires_check2:ne vaut pas une année scolaire au moins 8 mois ou plus",
                "ascolaires_fkey1:etablissement introuvable"
            )
        }
    },
    getEtabAscolaire: async (req, res, next) => {
        try {
            const { etId } = req.params
            const query = `
                select as_id as value,concat(extract(year from as_d),'-',extract(year from as_f)) label,as_d,as_f,disabled
                from ascolaires where et_id=${etId}
            `
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    removeAscolaire: async (req, res, next) => {
        try {
            const { asId } = req.params
            const { type } = req.query
            const findAscolaire = ascolaireModel.findByPk(asId)
            if (!findAscolaire) return next(createError(400, "annee scolaire introuvable"))
            backup(type, ascolaireModel, "as_id", asId, (err, data) => {
                if (err) return next(createError(400, err))
                return res.json(data)
            })
        } catch (err) { return next(err) }
    }
}
module.exports = ascolaireCtrl