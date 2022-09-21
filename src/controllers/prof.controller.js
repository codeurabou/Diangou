const { profModel, sequelize, reglementModel } = require("../db/sequelize")
const checkBody = require("../utils/checkBody")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")

const profCtrl = {
    addProf: async (req, res, next) => {
        try {
            const { prenom, nom, sexe, ecivil, sal, type, con, adr, et_id } = req.body
            const { isValid } = checkBody(prenom, nom, sexe, ecivil, sal, et_id)
            if (isValid === false) return next(createError(400, "champs invalide"))
            await profModel.create({
                pr_prenom: prenom,
                pr_nom: nom,
                pr_sexe: sexe,
                pr_ecivil: ecivil,
                pr_sal: sal,
                pr_type: type,
                pr_con: con || null,
                pr_adr: adr || null,
                et_id
            })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "professeurs_unique1:nom et prenom pris",
                "professeurs_unique2:le contact est unique",
                "professeurs_check1:genre invalide",
                "professeurs_check2:etat civile invalide",
                "professeurs_check3:salaire pas negatif",
                "professeurs_check4:type invalide"
            )
        }
    },
    editProf: async (req, res, next) => {
        try {
            const { prId } = req.params
            const { prenom, nom, sexe, ecivil, sal, type, con, adr, et_id } = req.body
            const findProf = await profModel.findByPk(prId)
            if (!findProf) return next(createError(400, "champs invalide"))
            const { pr_id, pr_prenom, pr_nom, pr_type, pr_sexe, pr_ecivil, pr_con, pr_adr, pr_sal } = findProf
            await profModel.update({
                pr_prenom: prenom || pr_prenom,
                pr_nom: nom || pr_nom,
                pr_sexe: sexe || pr_sexe,
                pr_ecivil: ecivil || pr_ecivil,
                pr_sal: sal || pr_sal,
                pr_type: type || pr_type,
                pr_con: con || pr_con,
                pr_adr: adr || pr_adr,
                et_id
            }, { where: { pr_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "professeurs_unique1:nom et prenom pris",
                "professeurs_unique2:le contact est unique",
                "professeurs_check1:genre invalide",
                "professeurs_check2:etat civile invalide",
                "professeurs_check3:salaire pas negatif",
                "professeurs_check4:type invalide"
            )
        }
    },
    getEtabProf: async (req, res, next) => {
        try {
            const { etId } = req.params
            return res.json(await profModel.findAll({ where: { et_id: etId } }))
        } catch (err) { return next(err) }
    },
    getEtabProfAdapt: async (req, res, next) => {
        try {
            const { etId } = req.params
            const query = `select pr_id as value,pr_prenom||' '||pr_nom as label from professeurs where et_id=${etId}`
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) {
            return next(err)
        }
    },
    removeProf: async (req, res, next) => {
        try {
            const { prId } = req.params
            const findProf = await profModel.findByPk(prId)
            if (!findProf) return next(createError(400, "champs invalide"))
            const { pr_id } = findProf
            await profModel.destroy({ where: { pr_id } })
            return res.json({ message: "deleted" })
        } catch (err) { return next(err) }
    },
    addEtabReglement: async (req, res, next) => {
        try {
            const { etId } = req.params
            const aQuery = `
                insert into reglements (mois,annee,pr_id,et_id,"createdAt") 
                (select extract(month from now()::date) mois,extract(year from now()::date) annee,pr_id,et_id,now() 
                from professeurs where et_id=${etId} and pr_type='p'
                and pr_id not in (select pr_id from professeurs join reglements using(pr_id) 
                where annee=extract(year from now()::date) and mois=extract(month from now()::date)))
            `
            await sequelize.query(aQuery, "SELECT")
            return res.json({ message: "paiement positionner" })
        } catch (err) {
            pgError(err, next,
                "reglements_unique1:paiement dejas effectuer",
                "reglements_check4:mois en cours depasser",
                "reglements_check3:annee en cours depasser",
                "reglements_fkey1:etablissement introuvable",
            )
        }
    },
    editReglement: async (req, res, next) => {
        try {
            const { reId } = req.params
            const findReglement = await reglementModel.findByPk(reId)
            if (!findReglement) return next(createError(400, "paiement introuvable"))
            const { re_id } = findReglement
            await reglementModel.update({ re_pay: true }, { where: { re_id } })
            return res.json({ message: "reglement effectuer" })
        } catch (err) {
            pgError(err, next,
                "reglements_unique1:paiement dejas effectuer",
                "reglements_check4:mois en cours depasser",
                "reglements_check3:annee en cours depasser",
                "reglements_fkey1:etablissement introuvable",
            )
        }
    },
    getEtabReglement: async (req, res, next) => {
        try {
            const { etId } = req.params
            const q = `
                select re_id,pr_id,pr_prenom||' '||pr_nom nom,pr_sexe,pr_ecivil,pr_sal,r."createdAt",mois,annee,re_pay,p.et_id
                from professeurs p join reglements as r using (pr_id) 
                where ((annee=extract(year from now()::date) and pr_type='p' and 
                mois=extract(month from now()::date) and re_pay=false) or re_pay=false) and p.et_id=${etId}
            `
            const getShopPaiement = await sequelize.query(q, { type: sequelize.QueryTypes.SELECT })
            return res.json(getShopPaiement)
        } catch (err) { return next(err) }
    },
    getEtabPayedReglement: async (req, res, next) => {
        try {
            const { etId } = req.params
            const q = `
                select re_id,pr_id,pr_prenom||' '||pr_nom nom,pr_sexe,pr_ecivil,pr_sal,r."createdAt",mois,annee,re_pay,p.et_id
                from professeurs p join reglements as r using (pr_id) 
                where re_pay=true and pr_type='p' and p.et_id=${etId}
            `
            const getShopPaiement = await sequelize.query(q, { type: sequelize.QueryTypes.SELECT })
            return res.json(getShopPaiement)
        } catch (err) { return next(err) }
    }

}
module.exports = profCtrl