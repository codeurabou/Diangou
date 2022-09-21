module.exports = (sequelize, DataTypes) => {
    return sequelize.define("etabserie", {
        es_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        es_etat: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: "0" },
        es_frais: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        es_sub: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        et_id: { type: DataTypes.INTEGER, allowNull: false },
        se_id: { type: DataTypes.INTEGER, allowNull: false },
    }, { createdAt: false, updatedAt: false })
}