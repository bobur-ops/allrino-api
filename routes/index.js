'use strict';
var express = require('express');
var index = express.Router();
const config = require('../All/credentials.js');
const test = config.test;  //  true если запускается локальная тестовая база
var jwt = require('jsonwebtoken');
var mysql = require('promise-mysql');
var xl = require('excel4node'); //модуль для екселя
const fs = require("fs");
var request = require('request');
// Подключаем модуль multi-geocoder
var MultiGeocoder = require('multi-geocoder');
var geocoder = new MultiGeocoder({ provider: 'yandex-cache', coordorder: 'latlong' });
var provider = geocoder.getProvider();
var getRequestParams = provider.getRequestParams;
provider.getRequestParams = function () {
    var result = getRequestParams.apply(provider, arguments);
    result.apikey = 'e699252d-1879-4e01-8583-00ad94cdef76';
    return result;
};


// todo перед отправкой на сервер, меняем значение на false
let local = false;

var connection;
//новая база
var newBase = {
    host: 'localhost',
    user: 'autogie1_newsprv',
    password: 'red668483',
    database: 'autogie1_newsprv'
};
//старая база
var oldBase = {
    host: 'localhost',
    user: 'autogie1_avsprav',
    password: '1qFFdcMTtKL',
    database: 'autogie1_avsprav'
};
if (test) {
    newBase.user = oldBase.user = 'root';
    newBase.password = oldBase.password = '991efa6945';
}
//Читаем таблицу с сайта
index.post('/azs/loadAll', function (req, res) {
    let table = 'azs';
    mysql.createConnection(azsBase).then(function (conn) {
        var result = conn.query('SELECT * FROM ??', table);
        conn.end();
        return result;
    }).then(function (table) {
        res.json({ success: true, message: 'Success', base: table });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        res.send('Ошибка соеденения с базой ' + error);
        console.log('для задачи чтения ' + error);
    });
});

//Изменяем запись в таблицe
index.post('/azs/save', function (req, res) {
    let table = 'azs';
    let id = 1;
    console.log('изменяем запись в таблице = ' + table);
    mysql.createConnection(azsBase).then(function (conn) {
        var result = conn.query('UPDATE ?? SET ? WHERE `id` = ?', [table, req.body, id]);
        conn.end();
        return result;
    }).then(function (rec) {
        var result = false;
        res.json({ success: true, message: 'Success', rec: JSON.stringify(rec) });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        console.log(error);
        res.send('Ошибка соеденения с базой ' + error);
    });
});



/* Начальная страница */
index.get('/', function (req, res) {
    console.log("Вход на сайт Автосправка");
    res.sendFile('index.html', { root: __dirname });
});

/* Начальная страница для мобильного */
index.get('/mobile', function (req, res) {
    console.log("Вход на мобильную версию сайта Автосправка");
    res.sendFile('mobile.html', { root: __dirname });
});

/* Начальная страница, пароль для входа в админку*/
index.get('/enter', function (req, res) {
    console.log("Вход в парольную форму");
    res.sendFile('adminEnter.html', { root: __dirname });
});

index.get('/admin*', function (req, res, next) {
    console.log("Вход в админку");
    const token = req.query.token;
    if (!token) {
        res.json({ success: false, message: "No token provided" });
    }
    else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                console.log("Token invalid: " + err);
                res.json({ success: false, message: "Token invalid: " + err });
            }
            else {
                req.decoded = decoded;
            }
        });
    }
    console.log('Токен прошел');
    next();
});

index.get('/admin', function (req, res) {
    console.log('admin');
    res.sendFile('admin.html', { root: __dirname });
});

//Имитируем загрузку страницы
index.get('/page', function (req, res) {
    console.log(req.query.pod);
    res.json({ message: 'Success' });
});

//Выгружаем базу для приложения
index.post('/admin/app', function (req, res) {
    // token: token, str: base, main: firmsMainBaners, filelist: fileList, baners: baners 
    console.log('Выгружаем базу для приложения');
    const path = require('path');
    let folderPath = path.join(__dirname, '../base/');
    fs.writeFileSync(folderPath + 'all.json', req.body.str, "utf8");
    folderPath = path.join(__dirname, '../baners/');
    fs.writeFileSync(folderPath + 'firmlist.json', req.body.main, "utf8");
    fs.writeFileSync(folderPath + 'baners.txt', req.body.baners, "utf8");
    fs.writeFileSync(folderPath + 'filelist.txt', req.body.filelist, "utf8");
    
    res.json({ success: true, message: 'Success', main: req.body.main, fileList: req.body.filelist });
});



//Берем старую базу и преобразовываем ее в новую
index.post('/admin/old', function (req, res) {
    var tabFirma = 'spravka_catalog';
    var tabSub = 'spravka_catalog_section';
    var tabVid = 'spravka_vids';
    var table;
    var Vid = [], Div = [], Sub = [], FirmsAll = [];//временные хранилища 
    var promise = []; var multAdr = [], FirmsEnd = [];
    //Загружаем старую базу данных
    //загрузка видов 
    promise.push(mysql.createConnection(oldBase).then(function (conn) {
        let tempVid = conn.query('SELECT * FROM ??', [tabVid]);
        conn.end();
        return tempVid;
    }).then(function (tempVid) {
        for (let k = 0; k < tempVid.length; k++) {
            if (tempVid[k] !== undefined) {
                Vid.push(tempVid[k]);
            }
        }
        return true;
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        console.log(error);
        return res.send('Ошибка соеденения со старой базой3 ' + error);
    }));
    //загрузка рубрик и подрубрик 
    promise.push(mysql.createConnection(oldBase).then(function (conn) {
        let DivSub = conn.query('SELECT * FROM ??', [tabSub]);
        conn.end();
        return DivSub;
    }).then(function (DivSub) {
        for (let k = 0; k < DivSub.length; k++) {
            if (DivSub[k] !== undefined) {
                if (DivSub[k].parent === 0) {
                    Div.push(DivSub[k]);
                } else {
                    Sub.push(DivSub[k]);
                }
            }
        }
        return true;
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        console.log(error);
        return res.send('Ошибка соеденения со старой базой ');
    }));
    //загрузка фирм 
    promise.push(mysql.createConnection(oldBase).then(function (conn) {
        let firms = conn.query('SELECT * FROM ??', [tabFirma]);
        conn.end();
        return firms;
    }).then(function (firms) {
        let pic = 0;
        var adr = [];
        for (let i = 0; i < firms.length; i++) {
            if (firms[i].address === '' || firms[i].address === '-' || firms[i].address === '.') {
                multAdr.push([{ adres: '', long: null, latid: null, city: '', tel1: firms[i].phones, what1: false, dop1: firms[i].phone1_comment, tel2: firms[i].dop_phones, what2: false, dop2: firms[i].phone2_comment, tel3: firms[i].fax, what3: false, dop3: firms[i].phone3_comment }]);
                adr.push('multAdr');
            } else {
                multAdr.push([{ adres: firms[i].address, long: firms[i].longitude, latid: firms[i].latitude, city: 'Томск', tel1: firms[i].phones, what1: false, dop1: firms[i].phone1_comment, tel2: firms[i].dop_phones, what2: false, dop2: firms[i].phone2_comment, tel3: firms[i].fax, what3: false, dop3: firms[i].phone3_comment }]);
                if(firms[i].longitude !== '') {
                    adr.push('multAdr');
                } else {
                adr.push('Томск, ' + firms[i].address);
                }
            }
            FirmsAll.push(firms[i]);
        }
        var promisesGeo = [];
        //собираем адреса и геокодируем их
        for (let i = 0; i < adr.length; i++) {
            if(adr[i] !== 'multAdr') {
                        var ter = geocoder.geocode([adr[i]])
                .then(function (res) {
                    if (res.errors.length !== 0) {
                        multAdr[i][0].long = null;
                        multAdr[i][0].latid = null;
                    } else {
                        multAdr[i][0].long = res.result.features[0].geometry.coordinates[1];
                        multAdr[i][0].latid = res.result.features[0].geometry.coordinates[0];
                   }
                    return true;
                }).catch((err) => {
                   console.log(err);
                   return res.send('Ошибка в геокодирование '+ err);
                });
            }
            promisesGeo.push(ter);
        }
        return Promise.all(promisesGeo);
        //Записываем их в новом формате
    }).then(function (perechod) {

        //Загружаем банера и список фирм с банерами
        const path = require('path');
        // firmBan массив для банеров на главной
        let folderPath = path.join(__dirname, '../baners');
        let firmBan = JSON.parse(fs.readFileSync(folderPath + '/firmlist.json', "utf8"));
        for (let i = 0; i < FirmsAll.length; i++) {
            let st = 0;
            FirmsAll[i].address = JSON.stringify(multAdr[i]);
            FirmsAll[i].action = JSON.stringify({ fill: FirmsAll[i].action, show: FirmsAll[i].prioritet_show, begin: new Date(), end: new Date() });
            //Записываем банера
            if (FirmsAll[i].picture !== null && FirmsAll[i].picture !== undefined && FirmsAll[i].picture !== '') {
                let pathAll = folderPath + '/' + FirmsAll[i].picture.split('.jpg')[0] + 'small.svg';
                //записываем банера на основе данных из базы
                let ban = fs.readFileSync(pathAll, "utf8");
                let banRez = '<svg' + ban.split('<svg')[1];
              
                //Если главный банер записывем в main true
                for (let key in firmBan.firmsId) {
                    if (firmBan.firmsLink[key] === FirmsAll[i].id + '') {
                        FirmsAll[i].baner = JSON.stringify({ baner: banRez, show: FirmsAll[i].banner_show, begin: new Date(), end: new Date(), main: true, pos: st });
                        break;
                    } else {
                        FirmsAll[i].baner = JSON.stringify({ baner: banRez, show: FirmsAll[i].banner_show, begin: new Date(), end: new Date(), main: false, pos: -1 });
                        st++;
                    }
                }
            } else {
                //записываем банера на главной если у них нет внутренних банеров
                let st = 0;
                for (let key in firmBan.firmsId) {
                    if (firmBan.firmsLink[key] === FirmsAll[i].id + '') {

                        let pathAll = folderPath + '/' + firmBan.firmsBaner[key] + 'small.svg';
                        //записываем банера на основе данных из базы
                        let ban = fs.readFileSync(pathAll, "utf8");
                        let banRez = '<svg' + ban.split('<svg')[1];
                                                FirmsAll[i].baner = JSON.stringify({ baner: banRez, show: FirmsAll[i].banner_show, begin: new Date(), end: new Date(), main: true, pos: st });
                        break;
                    } else {
                        FirmsAll[i].baner = JSON.stringify({ baner: '', show: FirmsAll[i].banner_show, begin: new Date(), end: new Date(), main: false, pos: -1 });
                        st++;
                    }
                }
            }
            let info;
            //убираем html теги
            if (FirmsAll[i].info !== '' && FirmsAll[i].info !== undefined && FirmsAll[i].info !== null) {
                info = FirmsAll[i].info.replace(/\<.*?>/g, '');
                info = info.replace('&nbsp;', ' ');
                info = info.replace('&laquo;', ' ');
                info = info.replace('&raquo;', ' ');
                info = info.replace('&quot;', ' ');
                info = info.replace('&quot;', ' ');
            } else { info = ''; }
            if (FirmsAll[i].website !== '' && FirmsAll[i].website[0] !== 'h' && FirmsAll[i].website[0] !== 'w') {
                FirmsAll[i].website = 'http://' + FirmsAll[i].website;
            }
            FirmsAll[i].stat = JSON.stringify({ fill: FirmsAll[i].stat, show: FirmsAll[i].paper_show, begin: new Date(), end: new Date() });
            FirmsAll[i].info = JSON.stringify({ fill: info, show: FirmsAll[i].info_show, begin: new Date(), end: new Date() });
            FirmsAll[i].photo = JSON.stringify({ dir: '', show: FirmsAll[i].photo_show, begin: new Date(), end: new Date() });
            FirmsAll[i].print = '';
            if (FirmsAll[i].actual_date === null || FirmsAll[i].actual_date === undefined) { FirmsAll[i].actual_date = (new Date()).toISOString(); }
            if (FirmsAll[i].last_edit === null || FirmsAll[i].last_edit === undefined) { FirmsAll[i].last_edit = (new Date()).toISOString(); }
            if (FirmsAll[i].prioritet === '') { FirmsAll[i].prioritet_show = ''; }
            if (FirmsAll[i].prioritet_show !== '') { FirmsAll[i].print = FirmsAll[i].prioritet_show; } else { FirmsAll[i].prioritet = ''; }
            if (FirmsAll[i].red !== '') {
                if (FirmsAll[i].print === '') {
                    FirmsAll[i].print = FirmsAll[i].red;
                } else {
                    let str = FirmsAll[i].red.split(',');
                    let strNew = ',';
                    for (let k = 1; k < str.length - 1; k++) {
                        if (FirmsAll[i].prioritet_show.indexOf(',' + str[k] + ',') === -1) {
                            strNew = strNew + str[k] + ',';
                            if (FirmsAll[i].print === '') { FirmsAll[i].print = ','; }
                            FirmsAll[i].print = FirmsAll[i].print + str[k] + ',';
                        }
                    }
                    if (strNew !== ',') {
                        FirmsAll[i].red = strNew;
                    } else { FirmsAll[i].red = ''; }
                }
            }

            delete FirmsAll[i].longitude; delete FirmsAll[i].latitude; delete FirmsAll[i].phones; delete FirmsAll[i].phone1_comment; delete FirmsAll[i].stock_show;
            delete FirmsAll[i].dop_phones; delete FirmsAll[i].fax; delete FirmsAll[i].phone2_comment; delete FirmsAll[i].phone3_comment;
            delete FirmsAll[i].banner_show; delete FirmsAll[i].paper_show; delete FirmsAll[i].info_show; delete FirmsAll[i].photo_show;
            delete FirmsAll[i].predstav; delete FirmsAll[i].address1; delete FirmsAll[i].gis; delete FirmsAll[i].phone_type; delete FirmsAll[i].pos;
            delete FirmsAll[i].phone_type_2; delete FirmsAll[i].phone_type_3; delete FirmsAll[i].section_id; delete FirmsAll[i].picture;
        }
        for (let i = 0; i < FirmsAll.length; i++) {
            FirmsEnd.push(FirmsAll[i]);
        }
        return true;
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        console.log(error);
        return res.send('Ошибка соеденения со старой базой ');
    }));

    Promise.all(promise).then(result => {
        mysql.createConnection(newBase).then(function (conn) {
            connection = conn;
            conn.query('TRUNCATE TABLE spravkasub');
            conn.query('TRUNCATE TABLE spravkadiv');
            conn.query('TRUNCATE TABLE spravkavids');
            conn.query('TRUNCATE TABLE spravkafirms');

            for (let k = 0; k < Sub.length; k++) {
                conn.query('INSERT INTO spravkasub SET ?', [Sub[k]]);
            }
            return connection;
        }).then(function (conn) {
            connection = conn;
            for (let k = 0; k < Div.length; k++) {
                conn.query('INSERT INTO spravkadiv SET ?', [Div[k]]);
            }
            return connection;
        }).then(function (conn) {
            connection = conn;
            for (let k = 0; k < Vid.length; k++) {
                conn.query('INSERT INTO 	spravkavids SET ?', [Vid[k]]);
            }
            return connection;
        }).then(function (conn) {
            for (let k = 0; k < FirmsEnd.length; k++) {
                let timestamp = Date.parse(FirmsEnd[k].last_edit);
                if (isNaN(timestamp) === false) {
                    FirmsEnd[k].last_edit = new Date(timestamp);
                } else {
                    FirmsEnd[k].last_edit = new Date();
                }
                timestamp = Date.parse(FirmsEnd[k].actual_date);
                if (isNaN(timestamp) === false) {
                    FirmsEnd[k].actual_date = new Date(timestamp);
                } else {
                    FirmsEnd[k].actual_date = new Date();
                }
                conn.query('INSERT INTO spravkafirms SET ?', [FirmsEnd[k]]);
            }
            conn.end();
            return res.json({ success: true, message: 'Success' });
        }).catch(function (error) {
            if (connection && connection.end) connection.end();
            console.log(error);
            return res.send('Ошибка соеденения с новой базой ' + error);
        });
        return true;
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        console.log(error);
        return res.send('Ошибка соеденения со старой базой ');
    });
});

//Читаем таблицу из админки
index.post('/admin/read', function (req, res) {
    console.log('читаем таблицу = ' + req.body.table);
    var table;
    mysql.createConnection(newBase).then(function (conn) {
        var result = conn.query('SELECT * FROM ??', [req.body.table]);
        conn.end();
        return result;
    }).then(function (table) {
        res.json({ success: true, message: 'Success', base: JSON.stringify(table) });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        console.log(error);
        res.send('Ошибка соеденения с базой');
    });
});
//Загружаем время изменения базы
index.post('/sait/time', function (req, res) {
    var table;
    mysql.createConnection(newBase).then(function (conn) {
        var result = conn.query('SHOW TABLE STATUS');
        conn.end();
        return result;
    }).then(function (table) {
        let timeUp = table[1].Update_time;
        for (let k = 1; k < table.length - 1; k++) {
            if (timeUp < table[k].Update_time) {
                timeUp = table[k].Update_time;
            }
        }
        console.log(timeUp);
        res.json({ success: true, message: 'Success', time: timeUp });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        console.log('для задачи чтения времени ' + error);
        res.json({ success: false, message: error, });
    });
});

//Читаем таблицу с сайта
index.post('/sait/read', function (req, res) {
    let table;
    mysql.createConnection(newBase).then(function (conn) {
        var result = conn.query('SELECT * FROM ??', [req.body.table]);
        conn.end();
        return result;
    }).then(function (table) {
        res.json({ success: true, message: 'Success', base: JSON.stringify(table) });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        console.log('для задачи чтения ' + error);
    });
});
//Заменяем полностью таблицу
index.post('/admin/upall', function (req, res) {
    console.log('Заменяем таблицу = ' + req.body.table);
    var table;
    mysql.createConnection(newBase).then(function (conn) {
        var Div = JSON.parse(req.body.div);
        for (let k = 0; k < Div.length; k++) {
            var result = conn.query('UPDATE ?? SET ? WHERE `id` = ?', [req.body.table, Div[k], Div[k].id]);
        }
        conn.end();
        return result;
    }).then(function (rec) {
        res.json({ success: true, message: 'Success' });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        //logs out the error
        console.log(error);
        res.send('Ошибка соеденения с базой');
    });
});
//Добавляем запись в таблицу
index.post('/admin/ins', function (req, res) {
    console.log('Добавляем запись в таблицу = ' + req.body.table + ' запись = ' + JSON.parse(req.body.rec).name);
    var table;
    mysql.createConnection(newBase).then(function (conn) {
        var result = conn.query('INSERT INTO ?? SET ?', [req.body.table, JSON.parse(req.body.rec)]);
        result = conn.query('SELECT * FROM ?? WHERE `name`= ?', [req.body.table, JSON.parse(req.body.rec).name]);
        conn.end();
        return result;
    }).then(function (rec) {
        res.json({ success: true, message: 'Success', rec: JSON.stringify(rec) });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        //logs out the error
        console.log(error);
        res.send('Ошибка соеденения с базой');
    });
});

//Изменяем запись в таблицe
index.post('/admin/up', function (req, res) {
    console.log('изменяем запись в таблице = ' + req.body.table + ' запись = ' + JSON.parse(req.body.rec).name);
    var table;
    mysql.createConnection(newBase).then(function (conn) {
        var result = conn.query('UPDATE ?? SET ? WHERE `id` = ?', [req.body.table, JSON.parse(req.body.rec), JSON.parse(req.body.rec).id]);
        conn.end();
        return result;
    }).then(function (rec) {
        var result = false;
        res.json({ success: true, message: 'Success', rec: JSON.stringify(rec) });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        //logs out the error
        console.log(error);
        res.send('Ошибка соеденения с базой');
    });
});

//Удаляем запись в таблицу
index.post('/admin/del', function (req, res) {
    console.log('Удаляем запись в таблицу = ' + req.body.table + ' запись = ' + req.body.id);
    var table;
    mysql.createConnection(newBase).then(function (conn) {
        var result = conn.query('DELETE FROM ?? WHERE`id` =  ?', [req.body.table, req.body.id]);
        conn.end();
        return result;
    }).then(function (rec) {
        var result = false;
        res.json({ success: true, message: 'Success' });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        //logs out the error
        console.log(error);
        res.send('Ошибка соеденения с базой');
    });
});

//Удаляем все записи в таблицу
index.post('/admin/delAll', function (req, res) {
    console.log('Удаляем записи в таблице = ' + req.body.table );
    var table;

    mysql.createConnection(newBase).then(function (conn) {
        var result = conn.query('DELETE FROM ??', [req.body.table]);
        conn.end();
        return result;
    }).then(function (rec) {
        var result = false;
        res.json({ success: true, message: 'Success' });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        
        console.log(error);
        res.send({'mess': 'Ошибка соеденения с базой', 'error': error});
    });
});


//Добавляем в таблицу несколько значений
index.post('/admin/insall', function (req, res) {
    console.log('Добавляем несколько записей в таблицу = ' + req.body.table);
    var Div = JSON.parse(req.body.rec);
    mysql.createConnection(newBase).then(function (conn) {
        for (let k = 0; k < Div.length; k++) {
            console.log(Div[k].name);
            var result = conn.query('INSERT INTO ?? SET ?', [req.body.table, Div[k]]);
        }
        conn.end();
        return result;
    }).then(function (rec) {
        res.json({ success: true, message: 'Success' });
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        //logs out the error
        console.log(error);
        res.send({'mess': 'Ошибка соеденения с базой', 'error': error});
    });
});

//Узнаем когда выгружался ексел
index.post('/admin/exceldata', function (req, res) {
    console.log('смотрим время изменения ексел');
    var path = "autospravka.xlsx";
    var fs = require('fs');
    fs.stat(path, function (err, stat) {
        res.json({ time: stat.ctime, success: true, message: 'Success' });

    });
});

//Выгрузка таблицы на сервер
index.post('/admin/excel', function (req, res) {
    console.log('write to excel');
    var conn;
    var Div, Sub, Vids, PriorFirms = [], RedFirms = [], BlackFirms = [];
    mysql.createConnection(newBase).then(function (connection) {
        conn = connection; return conn.query('SELECT * FROM spravkadiv');
    }).then(function (div) {
        Div = div;
        return conn.query('SELECT * FROM spravkasub');
    }).then(function (sub) {
        Sub = sub; return conn.query('SELECT * FROM spravkavids');
    }).then(function (vids) {
        Vids = vids; return conn.query('SELECT * FROM spravkafirms');
    }).then(function (firms) {
        conn.end();
        firms = sortArr(firms, 'name');
        var wb = new xl.Workbook({
            defaultFont: {
                size: 8,
                name: 'Arial'
            }
        });
        var ws = wb.addWorksheet('Выгрузка');
        //определяем стили
        var border = wb.createStyle({
            border: {
                left: { style: 'thin' },
                right: { style: 'thin' },
                top: { style: 'thin' },
                bottom: { style: 'thin' }
            }
        });
        let tem = ''; let k = 0;
        for (let i = 0; i < firms.length; i++) {
            if (tem !== firms[i].name) {
                k++;
                ws.cell(k + 3, 16).string(firms[i].name);
            }
            tem = firms[i].name;
        }
        ws.cell(1, 1, 2000, 16).style(border);
        var redStyle = wb.createStyle({ font: { color: '#FF0000', bold: true } }); //Красные
        var blueStyle = wb.createStyle({ font: { color: '#0076A3', bold: true } }); //синий
        var ItalicStyle = wb.createStyle({ font: { italics: true } }); //наклонный
        var BoldStyle = wb.createStyle({ font: { bold: true } }); //bold
        //Устанавливаем ширину колонок
        ws.column(1).setWidth(5); ws.column(2).setWidth(5); ws.column(3).setWidth(5); ws.column(4).setWidth(5);
        ws.column(5).setWidth(5); ws.column(6).setWidth(5); ws.column(7).setWidth(22); ws.column(8).setWidth(22);
        ws.column(9).setWidth(22); ws.column(10).setWidth(30); ws.column(11).setWidth(30); ws.column(12).setWidth(22);
        ws.column(13).setWidth(22); ws.column(14).setWidth(22); ws.column(15).setWidth(17); ws.column(16).setWidth(25);
        var fonStyle = wb.createStyle({ fill: { type: 'pattern', patternType: 'solid', fgColor: '#CCFFCC' } });
        //Создаем хеадер
        ws.cell(2, 1).string('№ п/п всего списка').style(fonStyle);
        ws.cell(2, 2).string('№ рубрик').style(fonStyle);
        ws.cell(2, 3).string('Наимен. Рубрики').style(fonStyle);
        ws.cell(2, 4).string('№ подрубрик').style(fonStyle);
        ws.cell(2, 5).string('Наимен. ПодРубрики').style(fonStyle);
        ws.cell(2, 6).string('Приоритет').style(fonStyle);
        ws.cell(2, 7).string('Наименование фирм VIP-блока').style(fonStyle);
        ws.cell(2, 8).string('Наименование прочих фирм').style(fonStyle);
        ws.cell(2, 9).string('Виды деятельности').style(fonStyle);
        ws.cell(2, 10).string('доп.информация').style(fonStyle);
        ws.cell(2, 11).string('адрес').style(fonStyle);
        ws.cell(2, 12).string('телефон 1').style(fonStyle);
        ws.cell(2, 13).string('телефон 2').style(fonStyle);
        ws.cell(2, 14).string('телефон 3').style(fonStyle);
        ws.cell(2, 15).string('сайт').style(fonStyle);
        //Порядок разделов по id
        var DivPor = [23, 40, 16, 57, 72, 6, 108, 231, 90, 214];
        var stroka = 2; //текущая строка? где записываются данные
        var temRed = '', temBl = ''; // для нахождения повторяющихся значений
        tem = '';
        Sub = sortArr(Sub, 'pos', 1);
        for (let k = 0; k < DivPor.length; k++) {
            stroka++;
            //записываем № и раздел
            ws.cell(stroka, 2).number(k + 1).style(blueStyle);
            let sViv, sVivRed, sVivBlack, sVivPrior;
            for (let i = 0; i < Div.length; i++) { if (Div[i].id === DivPor[k]) { sViv = i; break; } }
            ws.cell(stroka, 3).string(Div[sViv].name).style(blueStyle);
            var subStr = 0;
            var firmsArr = [];
            for (let m = 0; m < Sub.length; m++) {
                if (Div[sViv].id === Sub[m].parent) {
                    subStr++;
                    stroka++;
                    let substr;
                    //записываем № и подраздел
                    if (subStr < 10) {
                        substr = k + 1 + '.0' + subStr;
                    } else {
                        substr = k + 1 + '.' + subStr;
                    }
                    ws.cell(stroka, 4).string(substr).style(blueStyle);
                    ws.cell(stroka, 5).string(Sub[m].name).style(blueStyle);

                    firmsArr.length = 0;
                    firmsArr = SubFirms(Sub[m].id, firms);
                    tem = ''; temRed = ''; temBl = '';
                    for (let r = 0; r < firmsArr.length; r++) {
                        if (firmsArr[r].display === 1 || firmsArr[r].display === '1') {
                            stroka++;
                            if (firmsArr[r].vid !== '' && firmsArr[r].vid !== null) {
                                for (let i = 0; i < Vids.length; i++) { if (Vids[i].id === firmsArr[r].vid) { sVivPrior = i; break; } }
                                ws.cell(stroka, 9).string(Vids[sVivPrior].name);
                            }
                            //myVue.multAdr.push({ adres: '', long: null, latid: null, city: 'Томск', tel1: '', dop1: '', tel2: '', dop2: '', tel3: '', dop3: '' });
                            let adr = JSON.parse(firmsArr[r].address)[0];
                            ws.cell(stroka, 11).string(adr.adres);
                            let tel = adr.tel1.replace('+7 (3822) ', '');
                            if (adr.dop1 !== '' && adr.dop1 !== null) {
                                tel = tel + ' ' + adr.dop1;
                            }
                            ws.cell(stroka, 12).string(tel);
                            tel = adr.tel2.replace('+7 (3822) ', '');
                            if (adr.dop2 !== '' && adr.dop2 !== null) {
                                tel = tel + ' ' + adr.dop2;
                            }
                            ws.cell(stroka, 13).string(tel);
                            tel = adr.tel3.replace('+7 (3822) ', '');
                            if (adr.dop3 !== '' && adr.dop3 !== null) {
                                tel = tel + ' ' + adr.dop3;
                            }

                            ws.cell(stroka, 14).string(tel);
                            ws.cell(stroka, 15).string(firmsArr[r].website);
                            let show = JSON.parse(firmsArr[r].info);
                            if (show.show !== '' && show.show !== null && show.show.lastIndexOf(',' + Sub[m].id + ',') !== -1) {
                                ws.cell(stroka, 10).string(show.fill.replace(/<\/?[^>]+>/g, '')).style(ItalicStyle);
                            }
                            if (firmsArr[r].prioritet_show !== '' && firmsArr[r].prioritet_show !== null && firmsArr[r].prioritet_show.lastIndexOf(',' + Sub[m].id + ',') !== -1) {
                                ws.cell(stroka, 6).string(firmsArr[r].prioritet).style(redStyle);
                                ws.cell(stroka, 7).string(firmsArr[r].name).style(redStyle);
                                if (tem === firmsArr[r].name) {
                                    ws.cell(stroka - 1, 15).string('');
                                    ws.cell(stroka, 6).string('');
                                    ws.cell(stroka, 7).string('');
                                    ws.cell(stroka, 9).string('');
                                }
                                tem = firmsArr[r].name;
                                continue;
                            }
                            if (firmsArr[r].red !== '' && firmsArr[r].red !== null && firmsArr[r].red.lastIndexOf(',' + Sub[m].id + ',') !== -1 && firmsArr[r].prioritet_show.lastIndexOf(',' + Sub[m].id + ',') === -1) {
                                ws.cell(stroka, 7).string(firmsArr[r].name).style(redStyle);
                                if (temRed === firmsArr[r].name) {
                                    ws.cell(stroka - 1, 15).string('');
                                    ws.cell(stroka, 7).string('');
                                    ws.cell(stroka, 9).string('');
                                    ws.cell(stroka, 10).string('');
                                }
                                temRed = firmsArr[r].name;
                                continue;
                            }
                            if (firmsArr[r].black !== '' && firms[r].black !== null && firmsArr[r].black.lastIndexOf(',' + Sub[m].id + ',') !== -1) {
                                ws.cell(stroka, 8).string(firmsArr[r].name).style(BoldStyle);
                                if (firmsArr[r].plat === 0) {
                                    ws.cell(stroka, 13).string('');
                                    ws.cell(stroka, 14).string('');
                                    ws.cell(stroka, 15).string('');
                                }
                                if (temBl === firmsArr[r].name) {
                                    ws.cell(stroka - 1, 15).string('');
                                    ws.cell(stroka, 8).string('');
                                    ws.cell(stroka, 9).string('');
                                    ws.cell(stroka, 10).string('');
                                }
                                temBl = firmsArr[r].name;
                            }
                        }
                    }
                }
            }
        }


        //записываем в файл
        wb.write('autospravka.xlsx');
        res.json({ success: true, message: 'Success' });
        console.log('Good excel');
    }).catch(function (error) {
        if (connection && connection.end) connection.end();
        console.log(error);
        res.send('Ошибка соеденения с базой ' + error);
    });
});


//Загружаем дату изменения файла для приложения
index.get('/dateApp', function (req, res) {
    console.log('Смотрим дату');
    const path = require('path');
    let folderPath = path.join(__dirname, '../base/');
    let stat = fs.statSync(folderPath + 'firms.json').mtime;
    res.send(stat);
});

//Загружаем файл для приложения
index.get('/dataApp', function (req, res) {
    console.log('Выгружаем базу для приложения');
    const path = require('path');
    let folderPath = path.join(__dirname, '../base/');
    let soder = fs.readFileSync(folderPath + 'firms.json', req.body.str, "utf8");
    res.send(soder);
});

//функция составляет список фирм по id подраздела
function SubFirms(id, Firms) {
    let PriorFirms = [], RedFirms = [], BlackFirms = [], firmsArr = [];
    for (let i = 0; i < Firms.length; i++) {
        if (Firms[i].prioritet_show !== null && Firms[i].prioritet !== '' && Firms[i].prioritet !== null) {
            if (Firms[i].prioritet_show.indexOf(',' + id + ',') !== -1) {
                PriorFirms.push(Firms[i]); continue;
            }
        }
        if (Firms[i].red !== null && Firms[i].red !== '') {
            if (Firms[i].red.indexOf(',' + id + ',') !== -1) {
                RedFirms.push(Firms[i]); continue;
            }
        }
        if (Firms[i].black !== null && Firms[i].black !== '') {
            if (Firms[i].black.indexOf(',' + id + ',') !== -1) {
                BlackFirms.push(Firms[i]);
            }
        }
    }

    PriorFirms = sortArr(PriorFirms, 'prioritet');

    //sortArr(red, 'name'); sortArr(black, 'name');
    firmsArr.length = 0;
    for (let k = 0; k < PriorFirms.length; k++) {
        firmsArr.push(PriorFirms[k]);
    }
    for (let k = 0; k < RedFirms.length; k++) {
        firmsArr.push(RedFirms[k]);
    }
    for (let k = 0; k < BlackFirms.length; k++) {
        firmsArr.push(BlackFirms[k]);
    }
    return firmsArr;
}

//Функция сортировки массива по ключу, ключи передаются в виде строки, направление сортировки - direct
function sortArr(A, key, direct) {
    let n = A.length; let foo, bar;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
            switch (key) {
                case 'pos': {
                    if (direct === 1) {
                        bar = Number(A[j + 1].pos);
                        foo = Number(A[j].pos);
                    } else {
                        foo = Number(A[j + 1].pos);
                        bar = Number(A[j].pos);
                    }
                    break;
                }
                case 'id': {
                    foo = Number(A[j + 1].id);
                    bar = Number(A[j].id);
                    break;
                }
                case 'name': {
                    bar = A[j + 1].name;
                    foo = A[j].name;
                    break;
                }
                case 'prioritet': {
                    bar = A[j + 1].prioritet;
                    foo = A[j].prioritet;
                    break;
                }
            }
            if (foo > bar) { let t = A[j + 1]; A[j + 1] = A[j]; A[j] = t; }
        }
    }
    return A;    // На выходе сортированный по возрастанию массив A по ключу key.
}





module.exports = index;
