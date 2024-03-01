'use strict';
var express = require('express');
var vmeste = express.Router();
var request = require('request');
var urlNew= 'http://mivmeste2015.ru/news';
//var mysql = require('promise-mysql');
//var jwt = require('jsonwebtoken');
//const config = require('../All/credentials.js');
//var connection;
//var dataConn = {
//    host: 'localhost',
//    user: 'autogie1_newsprv',
//    password: 'red668483',
//    database: 'autogie1_newsprv'
//};

/* Проверка пользователя*/
vmeste.post('/', function (req, res) {
    console.log(req.body.link);
    request(req.body.link, function (error, response, body) {
        if (!error) {
            return res.send({ success: true, message: 'Success', vest: body });
        } else {
            return res.send({ success: true, message: 'Success', vest: error });
        }

    });
});

module.exports = vmeste;