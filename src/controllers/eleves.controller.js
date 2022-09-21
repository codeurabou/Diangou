const { eleveModel, sequelize } = require("../db/sequelize")
const { removeFile, checkFileSync } = require("../middlewares/multer")
const checkBody = require("../utils/checkBody")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")
const { basename } = require("path")
const backup = require("../utils/backup")

const eleveCtrl = {
    addEleve: async (req, res, next) => {
        try {
            const { prenom, nom, pere, mere, tel, sexe, type, lieu_naiss, date_naiss, mat, et_id } = req.body
            const { isValid } = checkBody(prenom, pere, mere, nom, sexe, type, lieu_naiss, date_naiss, mat, et_id)
            if (isValid === false) return next(createError(400, "champs invalide"))
            const url = req.file ? `${req.protocol}://${req.get("host")}/file/${req.file.filename}` : null
            await eleveModel.create({
                el_prenom: prenom,
                el_nom: nom,
                el_mat: mat,
                el_pere: pere,
                el_mere: mere,
                el_tel: tel,
                el_sexe: sexe,
                el_type: type,
                el_url: url,
                lieu_naiss,
                date_naiss,
                et_id
            })
            return res.json({ message: "added" })
        } catch (err) {
            if (req.file) await removeFile("src/uploads", basename(req.file.filename))
            pgError(err, next,
                "eleves_unique1:nom et prenom pris",
                "eleves_unique2:matricule est unique",
                "eleves_check1:genre invalide",
                "eleves_check2:type invalide",
                "eleves_check3:date de naissance invalide"
            )
        }
    },
    editEleve: async (req, res, next) => {
        try {
            const { elId } = req.params
            const { prenom, nom, pere, mere, tel, sexe, type, lieu_naiss, date_naiss, mat, et_id } = req.body
            const findEleve = await eleveModel.findByPk(elId)
            if (!findEleve) return next(createError(400, "eleve introuvable"))
            const { el_id, el_url, el_prenom, el_nom, el_pere, el_mere, el_tel, el_mat, el_sexe, el_type, lieu_naiss: naiss, date_naiss: date } = findEleve
            const url = req.file ? `${req.protocol}://${req.get("host")}/file/${req.file.filename}` : null
            await eleveModel.update({
                el_prenom: prenom || el_prenom,
                el_nom: nom || el_nom,
                el_mat: mat || el_mat,
                el_pere: pere || el_pere,
                el_mere: mere || el_mere,
                el_tel: tel || el_tel,
                el_sexe: sexe || el_sexe,
                el_type: type || el_type,
                el_url: url || el_url,
                lieu_naiss: lieu_naiss || naiss,
                date_naiss: date_naiss || date,
                et_id
            }, { where: { el_id } })

            const oldUrl = req.file && el_url
            if (oldUrl) {
                const exist = checkFileSync(el_url)
                if (exist) await removeFile("src/uploads", basename(el_url))
                return res.json({ message: "updated" })
            }
            else return res.json({ message: "updated" })
        } catch (err) {
            if (req.file) await removeFile("src/uploads", basename(req.file.filename))
            pgError(err, next,
                "eleves_unique1:nom et prenom pris",
                "eleves_unique2:matricule est unique",
                "eleves_check1:genre invalide",
                "eleves_check2:type invalide",
                "eleves_check3:date de naissance invalide"
            )
        }
    },
    getEleve: async (req, res, next) => {
        try {
            const { elId } = req.params
            const findEleve = await eleveModel.findByPk(elId)
            if (!findEleve) return next(createError(400, "eleve introuvable"))
            return res.json(findEleve)
        } catch (err) { return next(err) }
    },
    getEtabEleve: async (req, res, next) => {
        try {
            const { etId } = req.params
            return res.json(await eleveModel.findAll({ where: { et_id: etId } }))
        } catch (err) { return next(err) }
    },
    getEtabEleveAdapt: async (req, res, next) => {
        try {
            const { etId } = req.params
            const query = `select el_id as value,el_prenom||' '||el_nom as label from eleves where et_id=${etId}`
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) {
            return next(err)
        }
    },
    removeEleve: (req, res, next) => {
        try {
            const { elId } = req.params
            const { type } = req.query
            backup(type, eleveModel, "el_id", elId, (err, data) => {
                if (err) return next(createError(400, err))
                return res.json(data)
            })
        } catch (err) { return next(err) }
    },
}

module.exports = eleveCtrl