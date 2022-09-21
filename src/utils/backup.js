const backup = (_options = "des", model, attribute, id, cb) => {
    let message;
    if (!_options || _options === "des") {
        model.update({ disabled: true }, { where: { [attribute]: id } })
            .then(() => {
                message = "desactiver"
                cb(null, { message, options: _options })
            })
            .catch(err => cb(err))
    }
    else if (_options === "act") {
        model.update({ disabled: false }, { where: { [attribute]: id } })
            .then(() => {
                message = "activer"
                cb(null, { message, options: _options })
            })
            .catch(err => cb(err))
    }
    else {
        model.destroy({ where: { [attribute]: id } })
            .then(() => {
                message = "supprimer"
                cb(null, { message, options: _options })
            })
            .catch(err => cb(err))
    }
}
module.exports = backup