const { sequelize, inscriptionModel, paiementModel } = require("../db/sequelize")
const checkBody = require("../utils/checkBody")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")

const inscriptionCtrl = {
    addInscription: async (req, res, next) => {
        try {
            const { el_id, cl_id, as_id, frais } = req.body
            const { isValid } = checkBody(el_id, cl_id, as_id)
            if (isValid === false) return next(createError(400, "champs invalide"))
            await inscriptionModel.create({ el_id, cl_id, as_id, in_frais: frais })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "inscriptions_unique1:inscription deja fait veillez l'ajuster",
                "inscriptions_fkey1:eleves introuvable",
                "inscriptions_fkey2:classe introuvable",
                "inscriptions_fkey3:annee scolaire introuvable",
            )
        }
    },
    editInscription: async (req, res, next) => {
        try {
            const { inId } = req.params
            const { frais, cl_id, as_id } = req.body
            const findInscription = await inscriptionModel.findByPk(inId)
            if (!findInscription) return res.json({ mess })
            const { in_frais, in_id, as_id: asId, cl_id: clId } = findInscription
            await inscriptionModel.update({
                cl_id: cl_id || clId,
                as_id: as_id || asId,
                in_frais: frais || in_frais
            }, { where: { in_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "inscriptions_unique1:inscription deja fait",
                "inscriptions_fkey1:eleves introuvable",
                "inscriptions_fkey2:classe introuvable",
                "inscriptions_fkey3:annee scolaire introuvable",
            )
        }
    },
    getInscription: async (req, res, next) => {
        try {
            const { inId } = req.params
            const findInscription = await inscriptionModel.findByPk(inId)
            if (!findInscription) return next(createError(400, "inscription introuvable"))
            const { in_id } = findInscription
            const query = `
                select el_prenom,el_nom,el_type,el_tel,
                case
                    when el_type='pv' then es_frais
                    when el_type='pu' then es_sub
                end as montant
                from inscriptions join eleves using(el_id) join classes using(cl_id) 
                join etabseries using(se_id)
                where in_id=${in_id}
            `
            const inscriptionDetails = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            return res.json(inscriptionDetails[0])
        } catch (err) { return next(err) }
    },
    getEtabInscription: async (req, res, next) => {
        try {
            const { etId } = req.params
            const query = `
            select *
            from (select  in_id,el_prenom||' '||el_nom nom,el_mat,cl_nom,el_id,e.et_id,in_frais,a.as_id,cl_id,
                    concat(extract(year from as_d),'-',extract(year from as_f)) annee,"createdAt",el_sexe,
                    case
                        when el_type = 'pv' then es_frais
                        when el_type = 'pu' then es_sub
                    end as montant
            from inscriptions 
                join classes using(cl_id)
                join series using(se_id)
                join etabseries using(se_id,et_id)
                join ascolaires a using(as_id)
                join eleves e using(el_id)
            ) as t
            left join (select sum(pa_mte) payer,in_id from paiements group by paiements.in_id) as p using(in_id) where t.et_id=${etId}`
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    removeInscription: async (req, res, next) => {
        try {
            const { inId } = req.params
            const findInscription = await inscriptionModel.findByPk(inId)
            if (!findInscription) return next(createError(400, "inscription introuvable"))
            const { in_id } = findInscription
            await inscriptionModel.destroy({ where: { in_id } })
            return res.json({ message: "deleted" })
        } catch (err) { return next(err) }
    },
    addInscriptionPaiement: async (req, res, next) => {
        try {
            const { inId } = req.params
            const { mte, motif } = req.body
            const { isValid } = checkBody(mte, motif)
            if (isValid === false) return next(createError(400, "champs invalide"))
            const findInscription = await inscriptionModel.findByPk(inId)
            if (!findInscription) return next(createError(400, "inscription introuvable"))
            const { in_id } = findInscription
            const query = `
            select in_id,
            case 
                when el_type = 'pv' then es_frais
                when el_type = 'pu' then es_sub
            end montant,coalesce(pa_mte,0) payer
            from inscriptions 
                join eleves e using(el_id) 
                join classes using(cl_id)
                join series using (se_id)
                join etabseries using(se_id)
                left join paiements using (in_id) where in_id=${inId}
            `
            const inscriptionInfos = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            const { montant, payer } = inscriptionInfos[0]
            const reste = parseInt(montant, 10) - parseInt(payer, 10)
            if (mte > reste) return res.json({ message: `vous avez depasser le reste : ${reste}` })
            await paiementModel.create({ pa_mte: mte, pa_motif: motif, in_id })
            return res.json({ message: "added" })
        } catch (err) { return next(err) }
    },
    editInscriptionPaiement: async (req, res, next) => {
        try {
            const { paId } = req.params
            const { mte, motif } = req.body
            const findPaiement = await paiementModel.findByPk(paId)
            if (!findPaiement) return next(createError(400, "paiement introuvable"))
            const { in_id, pa_id, pa_mte, pa_motif } = findPaiement
            const query = `
            select in_id,
            case 
                when el_type = 'pv' then es_frais
                when el_type = 'pu' then es_sub
            end montant,coalesce(pa_mte,0) payer
            from inscriptions 
                join eleves e using(el_id) 
                join classes using(cl_id)
                join series using (se_id)
                join etabseries using(se_id)
                left join paiements using (in_id) where in_id=${in_id}
            `
            const inscriptionInfos = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            const { montant, payer } = inscriptionInfos[0]
            const reste = parseInt(montant, 10) - parseInt(payer, 10)
            if (mte > reste) return res.json({ message: `vous avez depasser le reste : ${reste}` })
            await paiementModel.update({ pa_mte: mte || pa_mte, pa_motif: motif || pa_motif }, { where: { pa_id } })
            return res.json({ message: "updated" })
        } catch (err) { return next(err) }
    },
    getInscriptionPaiement: async (req, res, next) => {
        try {
            const { inId } = req.params
            return res.json(await paiementModel.findAll({ where: { in_id: inId } }))
        } catch (err) { return next(err) }
    },
    removeInscriptionPaiement: async (req, res, next) => {
        try {
            const { paId } = req.params
            const findPaiement = await paiementModel.findByPk(paId)
            if (!findPaiement) return next(createError(400, "paiement introuvable"))
            const { pa_id } = findPaiement
            await paiementModel.destroy({ where: { pa_id } })
            return res.json({ message: "deleted" })
        } catch (err) { return next(err) }
    }
}
module.exports = inscriptionCtrl