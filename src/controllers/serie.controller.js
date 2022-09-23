const { serieModel, sequelize, etabSerieModel } = require("../db/sequelize")
const checkBody = require("../utils/checkBody")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")

const serieCtrl = {
    addSerie: async (req, res, next) => {
        try {
            const { nom, ab, niveau } = req.body
            const { isValid } = checkBody(nom, ab, niveau)
            if (isValid === false) return next(createError(400, "champs invalide"))
            await serieModel.create({ se_nom: nom, se_nomab: ab, se_niveau: niveau })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "series_unique1:serie existe",
                "series_unique2:serie abregé pris",
                "series_check1:niveau invalide"
            )
        }
    },
    editSerie: async (req, res, next) => {
        try {
            const { seId } = req.params
            const { nom, ab, niveau } = req.body
            const findSerie = await serieModel.findByPk(seId)
            if (!findSerie) return next(createError(400, "serie introuvable"))
            const { se_id, se_nom, se_niveau, se_nomab } = findSerie
            await serieModel.update({
                se_nom: nom || se_nom,
                se_nomab: ab || se_nomab,
                se_niveau: niveau || se_niveau
            }, { where: { se_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "series_unique1:serie existe",
                "series_unique2:serie abregé pris",
                "series_check1:niveau invalide"
            )
        }
    },
    getAllSerie: async (req, res, next) => {
        try {
            const { n } = req.query
            const query = `
            select se_id as value,se_nom as label,se_nomab,se_niveau 
                from series ${n ? `where se_niveau=${n}` : ''} 
            `
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    removeSerie: async (req, res, next) => {
        try {
            const { seId } = req.params
            const findSerie = await serieModel.findByPk(seId)
            if (!findSerie) return next(createError(400, "serie introuvable"))
            const { se_id } = findSerie
            await serieModel.destroy({ where: { se_id } })
            return res.json({ message: "deleted" })
        } catch (err) { return next(err) }
    },
    addEtabSerie: async (req, res, next) => {
        try {
            const { etId } = req.params
            const query = `insert into etabseries (et_id,se_id) (select '${etId}',se_id from series)`
            const findAndCount = await etabSerieModel.findAndCountAll({ where: { et_id: etId } })
            const { count } = findAndCount
            if (count > 0) return res.json({ message: "contenu positionner" })
            await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "etabseries_unique1:serie existe",
                "etabseries_fkey1:etablissement introuvable",
                "etabseries_fkey2:serie introuvable",
            )
        }
    },
    editEtabSerie: async (req, res, next) => {
        try {
            const { esId } = req.params
            const findEtabSerie = await etabSerieModel.findByPk(esId)
            if (!findEtabSerie) return next(createError(400, "serie introuvable"))
            const { es_id, es_frais, es_sub, es_etat } = findEtabSerie
            const { frais, sub, etat } = req.body
            await etabSerieModel.update({ es_frais: frais || es_frais, es_sub: sub || es_sub, es_etat: etat || es_etat }, { where: { es_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "etabseries_check1:etat invalide",
                "etabseries_check2:frais n'est pas negatif",
                "etabseries_check3:subvention n'est pas negatif",
            )
        }
    },
    getEtabSerie: async (req, res, next) => {
        try {
            const { etId } = req.params
            const query = `
            select se_id as value,se_nom as label,es_id,es_etat,es_frais,es_sub 
                from series join etabseries using (se_id) where et_id=${etId} order by se_niveau`
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    }
}

module.exports = serieCtrl