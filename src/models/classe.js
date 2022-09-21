// classe
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("classe", {
        cl_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        cl_nom: { type: DataTypes.STRING(100), allowNull: false },
        se_id: { type: DataTypes.INTEGER, allowNull: false },
        et_id: { type: DataTypes.INTEGER, allowNull: false },
        disabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    }, { createdAt: false, updatedAt: false })
}