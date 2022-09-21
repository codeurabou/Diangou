const express = require("express")
const app = express()
const cors = require('cors')
const { isAuth, isSync } = require("./db/sequelize")
const error = require("./middlewares/error")
const notFound = require("./middlewares/notFound")
const auth = require("./middlewares/auth")
const path = require("path")
require("dotenv").config()

const accept_url = process.env.NODE_ENV === "production" ? "https://diangou.onrender.com/api/v1" : "*"
app.use(cors({ origin: accept_url }))
app.use(express.json())
const base = '/api/v1'

app.use(express.static(path.join(__dirname, "../client/build")))
app.use("/file", express.static(path.join(__dirname, "uploads"), { fallthrough: true }))

isAuth()
isSync()

app.use(`${base}/docs`, require("./routes/document.routes"))
app.use(`${base}/users_auth`, require("./routes/auth.routes"))
app.use(`${base}/admins`, require("./routes/admin.routes"))

app.use(`${base}/etabs`, auth, require("./routes/etab.routes"))
app.use(`${base}/ascolaires`, auth, require("./routes/ascolaire.routes"))
app.use(`${base}/eleves`, auth, require("./routes/eleves.routes"))
app.use(`${base}/series`, auth, require("./routes/serie.routes"))
app.use(`${base}/classes`, auth, require("./routes/classe.routes"))
app.use(`${base}/inscriptions`, auth, require("./routes/inscription.routes"))
app.use(`${base}/profs`, auth, require("./routes/prof.routes"))
app.use(`${base}/matieres`, auth, require("./routes/matiere.routes"))
app.use(`${base}/notes`, auth, require("./routes/note.routes"))
app.use(`${base}/cours`, auth, require("./routes/cours.routes"))
app.use(`${base}/appels`, auth, require("./routes/appel.routes"))
app.use(`${base}/users`, auth, require("./routes/user.routes"))
app.use(`${base}/uploads`, require("./routes/upload.routes"))

app.use(error)
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../client/build/index.html")))
app.use(notFound)

module.exports = app
