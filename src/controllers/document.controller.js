const { sequelize, classeModel, etabModel, ascolaireModel } = require("../db/sequelize")
const createError = require("../utils/error")
const template = require("../utils/lib/template")
const generatePdf = require("../utils/lib/generatePdf")
const path = require("path")
const { checkFileSync } = require("../middlewares/multer")

const globalBulletinStyle = `
    body {
        heigth:1800px;
    }
    #table{
        width:100%;
        border-collapse:collapse;
    }
    td,th {
        border: 1px solid black;
        text-align:center;
        padding:12px;
        margin:5px;
    }
    #doc {
        width:100vw;
        height:100vh;
        padding:22px;
    }
    #doc__header {
        display:flex;
        align:normal;
        justify-content:space-between;
    }
    #doc__header__right{text-align:center;}
    #doc__header__left {
        display:flex;
        flex-direction:column;
        align-items:normal;
    }
    #infos {
        margin-top:12px;
        border : 1px solid black;
        padding:12px;
    }
    #content {margin-top:10px;}
    #content-bottom {
        margin-top:12px;
        border:1px solid black;
        font-size:18px;
        padding:12px;
    }
    #content-footer {
        display:flex;
        align-items:normal;
        justify-content:space-between;
        margin-top:10px;
    }
    #logo {
        margin:5px;
        height:90px;
        width:90px;
        border-radius:50%;
    }
`
const globalNoteStyle = `
    #table{
        width:100%;
        border-collapse:collapse;
    }
    td,th {
        border: 1px solid black;
        padding:6px;
        margin:5px;
    }
    #doc {padding:22px;}
    #doc__header {
        display:flex;
        align-items:normal;
        justify-content:space-between;
    }
    #doc__header__right{text-align:center;}
    #infos {
        margin-top:12px;
        border : 1px solid black;
        padding:12px;
    }
    #infos>h3 {text-align:center;}
    #infos>p  {margin:3px;}
    #content{ margin-top:10px;}
`
const globalCardStyle = `
    body {
        width:380px;
        height:250px;
    }
    #doc {
        width:100%;
        height:100%;
        border:3px solid orange;
        padding:12px;
    } 
    #doc__header {
        display:flex;
        justify-content:space-between;
        font-size:10px;
    }
    #doc__main__top {
        margin-top:3px;
        font-size:15px;
    }
    #doc__header__right {
        text-align:center;
    }
    #content { 
        font-size:15px;
    }
    #doc__main__bottom {
        margin-top:5px;
    }
    #mali__logo {
        width:123px;
        height:20px;
        margin-top:5px;
    }
`
const listeStyle = `
    #table{
        width:100%;
        border-collapse:collapse;
    }
    td,th {
        border: 1px solid black;
        padding:6px;
        margin:5px;
    }
    #doc {padding:22px;}
    #doc__header {
        display:flex;
        align-items:normal;
        justify-content:space-between;
    }
    #divider {
        border : 1px solid black;
        margin-top:10px;
        margin-bottom:10px;
    }
`


const photoMali = "http://localhost:3000/file/Mali.png"

const docCtrl = {
    getClasseList: async (req, res, next) => {
        try {
            const { clId } = req.params
            const findClasse = await classeModel.findByPk(clId)
            if (!findClasse) return next(createError(400, "classe introuvable"))
            const { et_id, cl_id, cl_nom } = findClasse
            const findEtab = await etabModel.findByPk(et_id)
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            const query = `
            select el_id,el_prenom||' '||el_nom nom,cl_nom
            from eleves join inscriptions using(el_id) join classes using(cl_id) 
            where cl_id=${cl_id} order by nom
            `
            const findEleve = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            const content = findEleve.map(({ nom }, idx) => (
                `
                    <tr>
                        <td style="text-align:center;">${idx + 1}</td>
                        <td>${nom}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                `
            )).join("")

            const view = {
                header: {
                    left: `<h3>${findEtab.et_nom}</h3>`
                },
                main: {
                    top: `
                        <div>
                            <h4>Professeurs : ----------------------------------- </h4>
                            <h4>Cours de : -------------------------------------- </h4>
                            <h4>Classe : ${cl_nom}</h4>
                            <p>Date : Fait le ${new Date().toLocaleString()}</p>
                        </div>
                        <hr id="divider"/>
                    `,
                    bottom: `
                        <div id="content">
                            <div>
                                <h4 style="text-align:center;padding:6px">Liste des elèves de la classe : ${cl_nom}</h4>
                            </div>
                            <table id="table">
                                <thead>
                                    <tr>
                                        <th>N°</th>
                                        <th>Nom</th>
                                        <th>Observation</th>
                                        <th>Note 1</th>
                                        <th>Note 2</th>
                                        <th>Note 3</th>
                                    </tr>
                                </thead>
                                <tbody>${content}</tbody>
                            </table>
                        </div>
                    `
                },
            }
            const pdf = await generatePdf(template(view, listeStyle), { format: "A4", margin: { bottom: 5, top: 5 } })
            if (pdf) {
                res.set("Content-Type", "application/pdf")
                res.send(pdf)
                res.end()
            }
        } catch (err) { return next(err) }
    },
    getClasseNoteAn: async (req, res, next) => {
        try {
            const { clId } = req.params
            const { a } = req.query
            const findClasse = await classeModel.findByPk(clId)
            const { et_id } = findClasse
            const findEtab = await etabModel.findByPk(et_id)
            const findAscolaire = await ascolaireModel.findByPk(a)
            if (!findClasse) return next(createError(400, "classe introuvable"))
            if (!findAscolaire) return next(createError(400, "année scolaire introuvable"))
            const { as_d, as_f } = findAscolaire
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            const query = `
            select round(((sum((no_compo*2+no_classe)/3*ms_coef)/sum(ms_coef)))::numeric(1000,2),2) mg_annuel,coalesce(nb_tri,0) nb_tri,
                    notes.el_id,notes.as_id,
                    el_prenom,el_nom,el_mat,cl_nom,concat(extract(year from as_d),'-',extract(year from as_f)) annee,
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
                        group by notes.as_id,nb_tri,notes.el_id,notes.as_id,el_prenom,el_nom,el_mat,cl_nom,annee
                        order by mg_annuel desc
            `
            let out = { p: 0, r: 0 }
            const getClasseNote = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            if (getClasseNote.length === 0) return res.send("<h1>Aucune trimestre fait pour cette periode</h1>")
            for (const el of getClasseNote) {
                if (el.mg_annuel >= 10) out.p++
                else out.r++
            }
            const content = getClasseNote.map((d, idx) => (
                `
                    <tr>
                        <td style="text-align:center">${(idx + 1)}</td>
                        <td>${d.el_prenom}</td>
                        <td>${d.el_nom}</td>
                        <td>${d.el_mat}</td>
                        <td style="text-align:center;">${d.mg_annuel}</td>
                        <td style="text-align:center;">${d.apr}</td>
                    </tr>
                `
            )).join("")
            const view = {
                header: {
                    left: `
                    <p>M.E.N.A</p>
                    <p>${findEtab.et_aca}</p>
                    <p>${findEtab.et_cap}</p>
                    <p>*******************</p>
                    <h4>${findEtab.et_nom}</h4>
                    <p>${findEtab.et_dev}</p>
                    <p>Tel : ${findEtab.et_tel}</p>
                `,
                    right: `
                    <div>
                        <p>REPUBLIQUE DU MALI</p>
                        <p>UN PEUPLE - UN BUT - UNE FOIE</p>
                    </div>
                `,
                },
                main: {
                    top: `
                        <div id="infos">
                            <h3>Liste des moyennes globales de classe : 
                                ${findClasse.cl_nom} de l'année ${new Date(as_d).getFullYear()}-${new Date(as_f).getFullYear()}
                            </h3>
                            <p>Nombres de passants : ${out.p}</p>
                            <p>Nombres de redoublants : ${out.r}</p>
                            <p>Nombres d'elèves : ${getClasseNote.length}</p>
                            <p>Pourcentage des passants : ${((out.p / getClasseNote.length) * 100) || 0} %</p>
                        </div>
                    `,
                    bottom: `
                        <div id="content">
                            <table id="table">
                                <thead>
                                    <tr>
                                        <th>N°</th>
                                        <th>Prenom</th>
                                        <th>Nom</th>
                                        <th>Matricule</th>
                                        <th>Moyenne Annuel</th>
                                        <th>Appréciation</th>
                                    </tr>
                                </thead>
                                <tbody>${content}</tbody>
                            </table>
                        </div>
                    `

                }
            }
            const currentTemplate = template(view, globalNoteStyle)
            const pdf = await generatePdf(currentTemplate, { format: "A4", margin: { bottom: 5, top: 5 } })
            if (pdf) {
                res.set("Content-Type", "application/pdf")
                res.send(pdf)
                res.end()
            }
        } catch (error) { return next(err) }
    },
    getMultipleBulletin: async (req, res, next) => {
        try {
            const { clId } = req.params
            const { t, a } = req.query
            const findClasse = await classeModel.findByPk(clId)
            if (!findClasse) return next(createError(400, "classe introuvable"))
            const { et_id, cl_id } = findClasse
            const findEtab = await etabModel.findByPk(et_id)
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            let globalView = ""

            const qclasseEl = `
                select el_id,
                el_prenom ||' '||el_nom nom,el_mat,cl_nom,
                concat(extract(year from as_d),'-',extract(year from as_f)) annee
                from inscriptions 
                join eleves using(el_id)
                join classes using(cl_id)
                join ascolaires using(as_id)
                where cl_id=${clId} 
            `
            const getElMg = `
            select el_id,no_id,n.as_id,ma_nom,ms_coef coef,
            round(no_classe::numeric(4,2),2) no_classe,
            round(no_compo::numeric(4,2),2) no_compo,
            concat(extract(year from as_d),'-',extract(year from as_f)) annee,
            periode,round(((no_compo*2+no_classe)/3)::numeric(4,2),2) mg,
            round((((no_compo*2+no_classe)/3)*ms_coef)::numeric(1000,2),2) mg_coef
                    from notes n
                        join ascolaires using(as_id) 
                        join inscriptions using(el_id) 
                        join classes using(cl_id) 
                        join matieres using(ma_id) 
                        join matseries using(se_id,ma_id)
                            where cl_id=${cl_id} and n.periode='${t}' and n.as_id=${a}
                            order by ms_coef desc
            `
            const getClMg = `
            select 
            rank() over (order by round((sum(((no_compo*2+no_classe)/3)*ms_coef)/sum(ms_coef))::numeric(1000,2),2) desc) as rang,
            round(sum(((no_compo*2+no_classe)/3)*ms_coef)::numeric(1000,2),2) total,c.et_id,el_id,sum(ms_coef) sum_coef,
            round((sum(((no_compo*2+no_classe)/3)*ms_coef)/sum(ms_coef))::numeric(1000,2),2) mg
                from notes n 
                            join ascolaires using(as_id)
                            join etabs using(et_id)
                            join inscriptions using(el_id)
                            join classes c using(cl_id)
                            join eleves using(el_id)
                            join matseries using(ma_id,se_id)
                            where periode='${t}' and n.as_id=${a} and cl_id=${cl_id}
                            group by el_id,el_prenom,el_nom,el_mat,cl_nom,c.et_id,as_d,as_f,cl_id
                            order by mg desc
            `

            const getClasseEl = await sequelize.query(qclasseEl, { type: sequelize.QueryTypes.SELECT })
            const getClasseElMg = await sequelize.query(getElMg, { type: sequelize.QueryTypes.SELECT })
            if (getClasseElMg.length === 0) return res.sendFile(path.join(__dirname, "../pages", "bulletin.html"))
            const getClasseElMgGlobal = await sequelize.query(getClMg, { type: sequelize.QueryTypes.SELECT })
            const maxMg = getClasseElMgGlobal.sort((a, b) => a.total - b.total > 0)[0].mg

            getClasseEl.forEach(async (d) => {
                const findMg = getClasseElMgGlobal.find(e => e.el_id === d.el_id)
                if (!findMg) return null
                const { mg, total, rang, sum_coef } = findMg
                const content = getClasseElMg
                    .filter(e => (e.el_id === d.el_id)).map(({ ma_nom, coef, no_classe, no_compo, mg, mg_coef }) => (
                        `
                        <tr>
                            <td>${ma_nom}</td>
                            <td>${coef}</td>
                            <td>${no_classe}</td>
                            <td>${no_compo}</td>
                            <td>${mg}</td>
                            <td>${mg_coef}</td>
                        </tr>
                    `
                    )).join("")
                const view = {
                    header: {
                        left: `
                        <p>M.E.N.A</p>
                        <p>${findEtab.et_aca}</p>
                        <p>${findEtab.et_cap}</p>
                        <p>*******************</p>
                        <h4>${findEtab.et_nom}</h4>
                        <p>${findEtab.et_dev}</p>
                        <p>Tel : ${findEtab.et_tel}</p>
                    `,
                        right: `
                        <p>REPUBLIQUE DU MALI</p>
                        <p>UN PEUPLE - UN BUT - UNE FOIE</p>
                        <div style="margin:5px;">
                            ${checkFileSync(findEtab.et_url) ? `<img id="logo" src=${findEtab.et_url} alt="" />` : ""}
                        </div>

                    `
                    },
                    main: {
                        top: `
                          <div id="infos">
                                <h3 style="text-align:center;">Bulletins des notes de l'elève</h3>
                                <h3>Composition du : ${t === "t1" ? "1er Trimestre" : t === "t2" ? "2e Trimestre" : "3e Trimestre"}</h3>
                                <p>Nom : ${d.nom}</p>
                                <p>Matricule : ${d.el_mat}</p>
                                <p>Classe : ${d.cl_nom}</p>
                                <p>Année Scolaire : ${d.annee}</p>
                        </div>`,
                        bottom: `
                        <div id="content">
                            <table id="table">
                                <thead>
                                    <tr>
                                        <th>Matiere</th>
                                        <th>Coef</th>
                                        <th>Note Classe</th>
                                        <th>Note Compo</th>
                                        <th>Moyenne</th>
                                        <th>Moyenne Coef</th>
                                    </tr>
                                </thead>
                                <tbody>${content}</tbody>
                            </table>
                            <div id="content-bottom">
                                <p>Total : ${Math.round(total)}</p>
                                <p>T ( Coef ) : ${sum_coef}</p>
                                <p>Rang : ${rang} sur ${getClasseEl.length} elève(s)</p>
                                <p>Moyenne du 1 er (ère) : ${maxMg}</p>
                                <p>Moyenne de l'elève : ${mg}</p>
                            </div>
                            <div id="content-footer">
                                <h4>Proviseur</h4>
                                <h4>Parent</h4>
                            </div>
                        </div>
                    `
                    },
                }
                const currentTemplate = template(view, globalBulletinStyle)
                globalView += currentTemplate
            })

            const getPdf = await generatePdf(globalView, { format: "A4" })
            if (getPdf) {
                res.set("Content-Type", "application/pdf")
                res.send(getPdf)
                res.end()
            }
        } catch (err) { return next(err) }
    },
    getMultipleEleveCard: async (req, res, next) => {
        try {
            const { clId } = req.params
            const findClasse = await classeModel.findByPk(clId)
            if (!findClasse) return next(createError(400, "classe introuvable"))
            const { et_id, cl_id } = findClasse
            const findEtab = await etabModel.findByPk(et_id)
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            let globalView = ""
            const query = `
            select  concat(el_prenom,' ',el_nom) nom,el_mat mat,date_naiss,lieu_naiss,el_pere,el_mere,
            concat(se_niveau,' Année') classe,concat(extract(year from as_d),' ',extract(year from as_f)) annee
                        from inscriptions
                            join classes using(cl_id) 
                            join ascolaires using(as_id) 
                            join eleves e using(el_id) 
                            join series using(se_id) 
                                where cl_id=${cl_id} order by nom`
            const { et_aca, et_nom, et_cap, et_tel } = findEtab
            const getClasseEl = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            getClasseEl.forEach(d => {
                const view = {
                    header: {
                        left: `
                            <p>M.E.N.A</p>
                            <p>${et_aca}</p>
                            <p>${et_cap}</p>
                            <img id="mali__logo" src=${photoMali} />
                    `,
                        right: `
                            <p>REPUBLIQUE DU MALI</p>
                            <p>UN PEUPLE - UN BUT - UNE FOIE</p>
                    `
                    },
                    main: {
                        top: `
                            <h4>Ecole : ${et_nom}</h4>
                            <p>Tel : ${et_tel}</p>
                        `,
                        bottom: `
                        <div id="content">
                                <p>Nom: ${d.nom}</p>
                                <p>Matricule : ${d.mat}</p>
                                <p>Né le ${new Date(d.date_naiss).toLocaleDateString()} à ${d.lieu_naiss}</p>
                                <p>Classe : ${d.classe}</p>
                                <p>Père : ${d.el_pere}</p>
                                <p>Mère : ${d.el_mere}</p>
                                <p>Année Scolaire : ${d.annee}</p>
                        </div>
                    `
                    }
                }
                const currentView = template(view, globalCardStyle)
                globalView += currentView
            })
            const pdf = await generatePdf(globalView, {
                printBackground: true,
                width: "380px",
                height: "250px",
                pageRanges: `1-${getClasseEl.length}`,
            })
            if (pdf) {
                res.set("Content-Type", "application/pdf")
                res.send(pdf)
                res.end()
            }
        } catch (err) { return next(err) }
    },
}

module.exports = docCtrl