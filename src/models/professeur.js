// professeur
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("professeur", {
        pr_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        pr_prenom: { type: DataTypes.STRING(60), allowNull: false },
        pr_nom: { type: DataTypes.STRING(30), allowNull: false },
        pr_sexe: { type: DataTypes.CHAR(1), allowNull: false },
        pr_ecivil: { type: DataTypes.CHAR(1), allowNull: false },
        pr_sal: { type: DataTypes.INTEGER, allowNull: false },
        pr_con: { type: DataTypes.STRING(64) },
        pr_type: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: "p" },
        pr_adr: { type: DataTypes.STRING(200) },
        et_id: { type: DataTypes.INTEGER, allowNull: false }
    }, { createdAt: false, updatedAt: false })
}