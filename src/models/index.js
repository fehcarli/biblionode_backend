'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const db = {};

let sequelize;

if (env === 'production') {
    const { DATABASE_URL } = process.env;
    const dbUrl = url.parse(DATABASE_URL);
    const username = dbUrl.auth.substr(0, dbUrl.auth.indexOf(':'));
    const password = dbUrl.auth.substr(
      dbUrl.auth.indexOf(':') + 1,
      dbUrl.auth.length
    );
    const dbName = dbUrl.path.slice(1);
    const host = dbUrl.hostname;
    const { port } = dbUrl;
    config.host = host;
    config.port = port;
    sequelize = new Sequelize(dbName, username, password, config);
}

if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.usuarios = require("./usuarios")(sequelize, Sequelize);
db.pessoas = require("./pessoas")(sequelize, Sequelize);
db.roles = require("./roles")(sequelize, Sequelize);
db.generos = require("./generos")(sequelize, Sequelize);
db.livros = require("./livros")(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;