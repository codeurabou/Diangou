// eleve
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("eleve", {
        el_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        el_mat: { type: DataTypes.STRING(200), allowNull: true },
        el_prenom: { type: DataTypes.STRING(60), allowNull: false },
        el_nom: { type: DataTypes.STRING(30), allowNull: false },
        el_pere: { type: DataTypes.STRING(90), allowNull: false },
        el_mere: { type: DataTypes.STRING(90), allowNull: false },
        el_tel: { type: DataTypes.STRING(64), allowNull: false },
        el_sexe: { type: DataTypes.CHAR(1), allowNull: false },
        el_type: { type: DataTypes.CHAR(2), allowNull: false },
        lieu_naiss: { type: DataTypes.STRING(200), allowNull: false },
        date_naiss: { type: DataTypes.DATEONLY, allowNull: false },
        el_url: { type: DataTypes.STRING, allowNull: true },
        et_id: { type: DataTypes.INTEGER, allowNull: false },
        disabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    }, { createdAt: false, updatedAt: false })
}