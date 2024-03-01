'use strict';
var express = require('express');
var router = express.Router();
var mysql = require('promise-mysql');
var jwt = require('jsonwebtoken');
const config = require('../All/credentials.js');
const test = config.test;  //  true если запускается локальная тестовая база
var connection;
var dataConn = {
    host: 'localhost',
    user: 'autogie1_newsprv',
    password: 'red668483',
    database: 'autogie1_newsprv'
};
if (test) {
    dataConn.user = 'root';
    dataConn.password = '991efa6945';
}
var id;
/* Проверка пользователя*/
router.post('/', function (req, res) {
    console.log("Проверка пользователя " + req.body.login + ' = ' + req.body.pass);
    mysql.createConnection(dataConn).then(function (conn) {
        var result = conn.query('SELECT  * FROM users where `Login`= ?', [req.body.login]);
        conn.end();
        return result;
    }).then(function (rows) {
        var result = false;
        if (rows.length !== 0) {
            if (rows[0].Pass === req.body.pass) {
                var id = rows[0].id;
                const token = jwt.sign({
                    userId: id
                }, config.secret, { expiresIn: '5h' });
                console.log('Success');
                return res.json({ success: true, message: 'Success', token: token });
            } else {
                return res.json('Неверный пароль');
            }
        }
        else {
            return res.send('Нет такого логина');
        }
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        //logs out the error
        console.log(error);
        res.send('Ошибка соеденения с базой');
    });
});
module.exports = router;