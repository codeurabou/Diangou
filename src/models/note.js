// note
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("note", {
        no_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        no_compo: { type: DataTypes.REAL, allowNull: false, defaultValue: 0 },
        no_classe: { type: DataTypes.REAL, allowNull: false, defaultValue: 0 },
        periode: { type: DataTypes.CHAR(2), allowNull: false },
        el_id: { type: DataTypes.INTEGER, allowNull: false },
        ma_id: { type: DataTypes.INTEGER, allowNull: false },
        as_id: { type: DataTypes.INTEGER, allowNull: false },
    }, { createdAt: false, updatedAt: false })
}