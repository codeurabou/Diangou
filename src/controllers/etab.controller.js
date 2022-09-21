const { etabModel, sequelize } = require("../db/sequelize")
const checkBody = require("../utils/checkBody")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")

const etabCtrl = {
    addEtab: async (req, res, next) => {
        try {
            const { nom, abr, dev, aca, cap, type, tel, adr } = req.body
            const { isValid } = checkBody(nom, abr, dev, type, tel, adr)
            if (isValid === false) return next(createError(400, "champs invalide"))
            await etabModel.create({
                et_nom: nom,
                et_nomab: abr,
                et_dev: dev,
                et_aca: aca,
                et_cap: cap,
                et_type: type,
                et_tel: tel,
                et_adr: adr
            })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "etabs_unique1:nom etablissement pris",
                "etabs_unique3:telephone pris",
                "etabs_check1:type etablissement invalide"
            )
        }
    },
    editEtab: async (req, res, next) => {
        try {
            const { etId } = req.params
            const { nom, abr, aca, cap, dev, type, tel, adr } = req.body
            const findEtab = await etabModel.findByPk(etId)
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            const { et_id, et_nom, et_cap, et_aca, et_nomab, et_dev, et_type, et_tel, et_adr } = findEtab
            await etabModel.update({
                et_nom: nom || et_nom,
                et_nomab: abr || et_nomab,
                et_dev: dev || et_dev,
                et_aca: aca || et_aca,
                et_cap: cap || et_cap,
                et_type: type || et_type,
                et_tel: tel || et_tel,
                et_adr: adr || et_adr
            }, { where: { et_id } })
            return res.json(await etabModel.findByPk(et_id))
        } catch (err) {
            pgError(err, next,
                "etabs_unique1:nom etablissement pris",
                "etabs_unique3:telephone pris",
                "etabs_check1:type etablissement invalide"
            )
        }
    },
    getEtab: async (req, res, next) => {
        try {
            const { etId } = req.params
            const findEtab = await etabModel.findByPk(etId)
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            return res.json(findEtab)
        } catch (err) { return next(err) }
    },
    getAllEtab: async (req, res, next) => {
        try {
            return res.json(await etabModel.findAll())
        } catch (err) {
            return next(err)
        }
    },
    getEtabStats: async (req, res, next) => {
        try {
            const { etId } = req.params
            const findEtab = await etabModel.findByPk(etId)
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            const { et_id } = findEtab
            const out = { cart: [], graph: { eleve: null, prof: null, clSerie: null, clEleve: null } }
            const nbAscolaires = `select 'Année Scolaire' as title,'Nombres d''année scoalaire connus de votre etablissement' as description,
                                  count(*) as total from ascolaires where et_id=${et_id}
            `
            const nbClasses = `select  'Classes' as title,'Nombres de classes de votre etablissements' as description,
                               count(*) as total from classes where et_id=${et_id}
            `
            const nbEleves = `select 'Eleves' as title,'Nombre d''eleves de votre etablissement' as description,
                             count(*) as total from eleves where et_id=${et_id}
            `
            const nbInscriptions = `select  'Inscriptions' as title,'Nombres d''elèves inscrit dans votre etablissement' as description,
                                    count(*) as total from inscriptions join eleves using(el_id) where et_id=${et_id}
            `
            const nbProfs = `select 'Professeurs' as title,'Nombres de professeurs de votre etablissement' as description,
                                    count(*) as total from professeurs where et_id=${et_id}
            `
            const nbSeries = `select 'Series enseignée(s)' as title,'Nombres de series enseigner dans votre etablissement' as description,
                              count(*) as total from etabseries where et_id=${et_id} and es_etat='1'
            `
            const nbMatieres = `select 'Matieres' as title,'Nombres de matieres' as description,
                                count(*) as total from matieres
            `
            const cartQueryTab = [nbAscolaires, nbClasses, nbEleves, nbInscriptions, nbProfs, nbSeries, nbMatieres]
            for (const el of cartQueryTab) {
                const result = await sequelize.query(el, { type: sequelize.QueryTypes.SELECT })
                out.cart.push(result[0])
            }

            const statEleve = `select  count(el_sexe in ('g','f') or null) as nb_el,
                                        count(el_sexe in ('g') or null) as nb_g,
                                        count(el_sexe in ('f') or null) as nb_f
                                        from eleves where et_id=${et_id}`
            const profStat = `select   count(pr_sexe in ('h','f') or null) nb_prof,
                                       count(pr_sexe in ('h') or null) nb_h,
                                       count(pr_sexe in ('f') or null) nb_f
                                       from professeurs where et_id=${et_id}`
            const classeSerie = `select se_nom,count(*) nb_el from classes
                                        join series using(se_id)
                                        where et_id=${et_id} group by se_id,se_nom,se_niveau
                                        order by se_niveau
            `
            const classeEleve = `select cl_nom,count(*) nb_el 
                                 from eleves e 
                                 join inscriptions using(el_id)
                                join classes using(cl_id)
                                where e.et_id=${et_id} group by cl_id,cl_nom
                                order by nb_el
            `
            const statEleveQuery = await sequelize.query(statEleve, { type: sequelize.QueryTypes.SELECT })
            const statProfQuery = await sequelize.query(profStat, { type: sequelize.QueryTypes.SELECT })
            const statclSerieQuery = await sequelize.query(classeSerie, { type: sequelize.QueryTypes.SELECT })
            const statclEleveQuery = await sequelize.query(classeEleve, { type: sequelize.QueryTypes.SELECT })

            out.graph.eleve = statEleveQuery[0]
            out.graph.prof = statProfQuery[0]
            out.graph.clSerie = statclSerieQuery
            out.graph.clEleve = statclEleveQuery

            return res.json(out)
        } catch (err) { return next(err) }
    }
}
module.exports = etabCtrl
