// ascolaire
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("ascolaire", {
        as_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        as_d: { type: DataTypes.DATEONLY, allowNull: false },
        as_f: { type: DataTypes.DATEONLY, allowNull: false },
        et_id: { type: DataTypes.INTEGER, allowNull: false },
        disabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    }, { createdAt: false, updatedAt: false })
}