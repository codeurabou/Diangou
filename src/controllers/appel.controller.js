const { apContenuModel, apModel, sequelize } = require("../db/sequelize")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")
const checkBody = require("../utils/checkBody")

const apCtrl = {
    addAp: async (req, res, next) => {
        try {
            const { motif, cl_id } = req.body
            const { isValid } = checkBody(motif, cl_id)
            if (isValid === false) return next(createError(400, "champ invalide"))
            const addAppel = await apModel.create({ ap_motif: motif, cl_id })
            if (addAppel) {
                const { ap_id } = addAppel
                const query = `
                   insert into apcontenus(el_id,ap_id) (select el_id,'${ap_id}' ap_id
                    from inscriptions
                    join eleves using(el_id)
                    where cl_id=${cl_id})
                `
                try {
                    await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
                    return res.json({ message: "added" })
                } catch (err) {
                    await apModel.destroy({ where: { ap_id } })
                    pgError(err, next,
                        "apcontenus_unique1:eleve dejas appeler",
                        "apcontenus_fkey1:eleve introuvable",
                        "apcontenus_fkey2:appel introuvable"
                    )
                }
            }
        } catch (err) {
            pgError(err, next, "appels_fkey1:classe introuvable")
        }
    },
    getClasseAp: async (req, res, next) => {
        try {
            const { clId } = req.params
            return res.json(await apModel.findAll({ where: { cl_id: clId } }))
        } catch (err) {

        }
    },
    removeAp: async (req, res, next) => {
        try {
            const { apId } = req.params
            const findAppel = await apModel.findByPk(apId)
            if (!findAppel) return next(createError(400, "appel introuvable"))
            const { ap_id } = findAppel
            await apModel.destroy({ where: { ap_id } })
            return res.json({ message: "deleted" })
        } catch (err) { return next(err) }
    },
    getApContenu: async (req, res, next) => {
        try {
            const { apId } = req.params
            const query = `
                select apc_id,el_prenom||' '||el_nom nom,apc_etat
                        from apcontenus 
                             join eleves using(el_id)
                             where ap_id=${apId} order by nom`
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    editApContenu: async (req, res, next) => {
        try {
            const { apcId } = req.params
            const findApContenu = await apContenuModel.findByPk(apcId)
            if (!findApContenu) return next(createError(400, "contenu d'appel introuvable"))
            const { apc_etat, apc_id } = findApContenu
            await apContenuModel.update({ apc_etat: !apc_etat }, { where: { apc_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "apcontenus_unique1:eleve dejas appeler",
                "apcontenus_fkey1:eleve introuvable",
                "apcontenus_fkey2:appel introuvable"
            )
        }
    },
    editApEtat: async (req, res, next) => {
        try {
            const { apId } = req.params
            const { type } = req.query
            if (!type) return next(createError(400, "champs invalide"))
            const findAppel = await apModel.findByPk(apId)
            if (!findAppel) return next(createError(400, "appel introuvable"))
            const { ap_id } = findAppel
            const updateObj = type === "p" ? { apc_etat: true } : { apc_etat: false }
            await apContenuModel.update({ ...updateObj }, { where: { ap_id } })
            return res.json({ message: "updated" })
        } catch (err) { return next(err) }
    }

}

module.exports = apCtrl