// inscription
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("inscription", {
        in_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        in_frais: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        el_id: { type: DataTypes.INTEGER, allowNull: false },
        cl_id: { type: DataTypes.INTEGER, allowNull: false },
        as_id: { type: DataTypes.INTEGER, allowNull: false },
    }, { createdAt: true, updatedAt: false })
}