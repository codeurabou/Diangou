const fs = require("fs")
const fsPromises = require("fs/promises")
const { constants } = require("fs")
const multer = require("multer")
const path = require("path")

const MIMES_TYPES = { "image/jpg": "jpg", "image/jpeg": "jpg", "image/png": "png" }

const fileStroageEngine = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./src/uploads"),
    filename: (req, file, cb) => {
        const getFilename = file.originalname.split(".")[0].split(" ").join("_")
        const getExtension = MIMES_TYPES[file.mimetype]
        if (!getExtension) cb("invalide extension")
        cb(null, `${getFilename}_${Date.now()}.${getExtension}`)
    },
})
const checkFileSync = (fileUrl = "") => {
    if (!fileUrl) return
    let exist = true
    const getBaseName = fileUrl.split("/file/")[1]
    const resolvePath = path.resolve("src/uploads", getBaseName)
    try { fs.accessSync(resolvePath, constants.F_OK) }
    catch (err) { exist = false }
    return exist
}
const removeFile = (dir = "src/uploads", basename = "") => {
    const resolvePathName = path.resolve(dir, basename)
    const promises = new Promise((resolve, reject) => {
        fsPromises.unlink(resolvePathName)
            .then(data => resolve(data))
            .catch(err => reject(err))
    })
    return promises
}

const upload = multer({ storage: fileStroageEngine }).single("file")
module.exports = { upload, removeFile, checkFileSync }