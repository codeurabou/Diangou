const { noteModel, classeModel, sequelize, eleveModel } = require("../db/sequelize")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")
const checkBody = require("../utils/checkBody")

const noteCtrl = {
    addEleveNote: async (req, res, next) => {
        try {
            const { elId } = req.params
            const { as_id, periode, cl_id } = req.body
            const findEleve = await eleveModel.findByPk(elId)
            const findClasse = await classeModel.findByPk(cl_id)
            if (!findClasse) return next(createError(400, "classe introuvable"))
            if (!findEleve) return next(createError(400, "eleve introuvable"))
            const { el_id } = findEleve
            const query = `
            insert into notes (el_id,ma_id,as_id,periode) (
            select el_id,ma_id,'${as_id}','${periode}'
            from eleves
                join inscriptions i using(el_id)
                join classes using(cl_id)
                join matseries using(se_id)
                join ascolaires a using(as_id)
                where eleves.el_id=${el_id}
                and ma_id not in (select ma_id from notes where periode='${periode}' and as_id=${as_id} and el_id=${el_id}))
            `
            await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            return res.json({ message: "added" })

        } catch (err) {
            pgError(err, next,
                "notes_unique1:note unique",
                "notes_check1:periode invalide",
                "notes_fkey1:eleve introuvable",
                "notes_fkey2:matiere introuvable",
                "notes_fkey3:année scolaire introuvable",
            )
        }
    },
    editEleveNote: async (req, res, next) => {
        try {
            const { noId } = req.params
            const { compo, classe } = req.body
            const findNote = await noteModel.findByPk(noId)
            if (!findNote) return next(createError(400, "note introuvable"))
            const { no_id } = findNote
            await noteModel.update({ no_compo: compo, no_classe: classe }, { where: { no_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "notes_check1:periode invalide",
                "notes_fkey1:eleve introuvable",
                "notes_fkey2:matiere introuvable",
                "notes_fkey3:année scolaire introuvable",
            )
        }
    },
    getEleveNote: async (req, res, next) => {
        try {
            const { elId } = req.params
            const query = `
                select no_id,n.as_id,ma_nom,ms_coef coef,no_classe,no_compo,
                   concat(extract(year from as_d),'-',extract(year from as_f)) annee,
                   periode,round(((no_compo*2+no_classe)/3)::numeric(4,2),2) mg
                from notes n
                join ascolaires using(as_id) 
                join inscriptions using(el_id) 
                join classes using(cl_id) 
                join matieres using(ma_id) 
                join matseries using(se_id,ma_id)
                where n.el_id=${elId}
                order by ms_coef desc
            `
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    getEleveNoteAnnuel: async (req, res, next) => {
        try {
            const { elId } = req.params
            const { a } = req.query
            const { isValid } = checkBody(elId, a)
            if (isValid === false) return next(createError(400, "champs invalide"))
            const query = `
            select round((sum((no_compo*2+no_classe)/3*ms_coef)/sum(ms_coef))::numeric(4,2),2) mg,
            case 
                when periode = 't1' then '1er Trimestre'
                when periode = 't2' then '2e Trimestre'
                when periode = 't3' then '3e Trimestre'
            end as periode
                from notes
                        join inscriptions using(el_id) 
                        join classes using(cl_id) 
                        join matseries using(se_id,ma_id) 
                        where notes.el_id=${elId} and notes.as_id=${a}
                        group by periode
            `
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    },
    getClasseNote: async (req, res, next) => {
        try {
            const { clId } = req.params
            const { a } = req.query
            const { isValid } = checkBody(clId, a)
            if (isValid === false) return next(createError(400, "champs invalide"))
            const query = `
            select round(((sum((no_compo*2+no_classe)/3*ms_coef)/sum(ms_coef)))::numeric(1000,2),2) mg_annuel,coalesce(nb_tri,0) nb_tri,
                    notes.el_id,notes.as_id,
                    el_prenom||' '||el_nom nom,el_mat,cl_nom,concat(extract(year from as_d),'-',extract(year from as_f)) annee,
                    case 
                        when round(((sum((no_compo*2+no_classe)/3*ms_coef)/sum(ms_coef)))::numeric(1000,2),2) >= 10 then 'Passe'
                        when round(((sum((no_compo*2+no_classe)/3*ms_coef)/sum(ms_coef)))::numeric(1000,2),2) <  10 then 'Redouble'
                    end as apr
                from notes 
                    join ascolaires using(as_id)
                    join eleves using(el_id)
                left join (
                    select count(*) nb_tri,el_id,as_id
                    from  
                        (select sum((no_compo*2+no_classe)/3*ms_coef)/sum(ms_coef) mg,notes.el_id,notes.as_id
                            from notes
                                join inscriptions using(el_id)
                                join classes using(cl_id) 
                                join matseries using(se_id,ma_id) group by periode,notes.el_id,notes.as_id
                        ) as t  group by t.el_id,t.as_id
            ) as a using(el_id,as_id)
                    join inscriptions using(el_id) 
                    join classes using(cl_id) 
                    join series using(se_id)
                    join matseries using(se_id,ma_id) 
                    where periode in ('t1','t2','t3') and cl_id=${clId} and notes.as_id=${a}
                    group by notes.as_id,nb_tri,notes.el_id,notes.as_id,nom,el_mat,cl_nom,annee
                    order by mg_annuel desc
            `
            return res.json(await sequelize.query(query, { type: sequelize.QueryTypes.SELECT }))
        } catch (err) { return next(err) }
    }
}
module.exports = noteCtrl