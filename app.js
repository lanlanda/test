'use strict';

//测试环境: TEST  正式环境: ONLINE
var ENV = 'ONLINE';

const Hapi = require('hapi');
const Inert = require('inert');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const ALY = require('aliyun-sdk');
const Sequelize = require('sequelize');

var sequelize;

if (ENV === 'ONLINE') {
    sequelize = new Sequelize('vr_ar_db', 'morefun', 'GuE0RcRDzY66TN21', {
        host: 'rm-vy11c089x8i1v9x3n.mysql.rds.aliyuncs.com',
        dialect: 'mysql',
        timezone: '+08:00'
    });
} else if (ENV === 'TEST') {
    sequelize = new Sequelize('vr_ar_test', 'morefun', 'GuE0RcRDzY66TN21', {
        host: 'rm-vy11c089x8i1v9x3n.mysql.rds.aliyuncs.com',
        dialect: 'mysql',
        timezone: '+08:00'
    });
} else {
    console.log('ENV is wrong! ', ENV);
}


sequelize.authenticate()
    .then(function (err) {
        console.log('Connection has been established successfully.');
    }).catch(function (err) {
        console.log('Unable to connect to the database:', err);
    });

//后添加 传图模块
var multiparty = require('multiparty');


const server = new Hapi.Server();
var memcached = '';
if (ENV === 'DEV') {
    server.connection({
        port: 3000
    });
} else {
    var con = fs.readFileSync('/acs/conf/env.properties', 'utf8');
    var res = con.match(/port.NODE_PORT=(.*)/);
    console.log(res[1]);

    server.connection({
        port: res[1]
    });

    memcached = ALY.MEMCACHED.createClient(11211, 'c2af5c26ccf04c90.m.jst.cnhzalicm10pub001jae001.ocs.aliyuncs.com', {
        username: 'c2af5c26ccf04c90',
        password: '123_Jae_ASD'
    });
}

server.app.memcached = memcached;
server.app.db = sequelize;
server.app.Sequelize = Sequelize;

//Load plugins and start server
server.register([
    Inert,
    require('./main'),
    require('./routes/skechers'),
    require('./routes/lorealBox'),
    require('./routes/newbalance'),
    require('./routes/bingxuejie'),
	require('./routes/friso')
], (err) => {

    if (err) {
        throw err;
    }

    // Start the server
    server.start((err) => {
        console.log('Server running at:', server.info.uri);
    });

});