const { sequelize, classeModel } = require("../db/sequelize")
const backup = require("../utils/backup")
const checkBody = require("../utils/checkBody")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")

const classeCtrl = {
    addClasse: async (req, res, next) => {
        try {
            const { nom, se_id, et_id } = req.body
            const { isValid } = checkBody(nom, se_id, et_id)
            if (isValid === false) return next(createError(400, "champs invalide"))
            await classeModel.create({ cl_nom: nom, se_id, et_id })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "classes_unique1:classe existe",
                "classes_fkey1:etablissement introuvable",
                "classes_fkey2:serie introuvable"
            )
        }
    },
    editClasse: async (req, res, next) => {
        try {
            const { clId } = req.params
            const { nom, se_id } = req.body
            const findClasse = await classeModel.findByPk(clId)
            if (!findClasse) return res.json({ message: "classe introuvable" })
            const { cl_id, cl_nom, se_id: seId } = findClasse
            await classeModel.update({ cl_nom: nom || cl_nom, se_id: se_id || seId }, { where: { cl_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "classes_unique1:classe existe",
                "classes_fkey1:etablissement introuvable",
                "classes_fkey2:serie introuvable"
            )
        }
    },
    getEtabClasse: async (req, res, next) => {
        try {
            const { etId } = req.params
            const query = `select cl_id as value,cl_nom as label,se_id,se_nom,se_niveau,disabled,count(el_id) nb_el
            from classes join series using(se_id) left join inscriptions using(cl_id) where et_id=${etId}
            group by et_id,cl_id,se_id,se_nom,se_niveau order by se_niveau`
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    getEtabClasseEleve: async (req, res, next) => {
        try {
            const { clId } = req.params
            const query = `
                select el_id,in_id,el_prenom||' '||el_nom nom,
                el_type,el_sexe,el_mat,el_tel,date_naiss,lieu_naiss,cl_nom,concat(extract(year from as_d),' ',extract(year from as_f)) annee
                from eleves 
                join inscriptions using(el_id) 
                join ascolaires using(as_id)
                join classes using(cl_id) 
                where cl_id=${clId} order by nom
            `
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    removeClasse: async (req, res, next) => {
        try {
            const { type } = req.query
            const { clId } = req.params
            const findClasse = await classeModel.findByPk(clId)
            if (!findClasse) return next(createError(400, "classe introuvable"))
            backup(type, classeModel, "cl_id", clId, (err, data) => {
                if (err) return next(createError(400, err))
                return res.json(data)
            })
        } catch (err) { return next(err) }
    },
}

module.exports = classeCtrl