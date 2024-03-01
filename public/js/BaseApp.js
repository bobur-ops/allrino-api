'use strict';

//два массива, рубрики, подрубрики
//name: имя, id: с базы данных, red: цвет на экране, 
//div id рубрики, countFirms: количество фирм в рубрике или подрубрике
//countsub: количество подрубрики в рубрике
//два массива для фирм, один с информацией - firmsArr, 
//другой для подробной информации - firmsInfo = [];
//stat - скрепка допинформ.
//var firms = [];
//Вспомагательные переменные firmsAll - количество фирм, lastIdDiv - последний ID, lastPosDiv - последняя позиция
var firmsAll, vids, lastIdDiv, lastIdSub, lastPosDiv, lastPosSub, lastFirm, lastIdFirm, lastPosFirm;
var token, urlToken;
//пути к GRUD операциям
var urlIns = '/admin/ins'; //Создание (create)	INSERT
var urlRead = '/admin/read'; //Чтение (read)	SELECT
var urlUp = '/admin/up'; //Редактирование (update)	UPDATE
var urlDel = '/admin/del'; //Удаление (delete)	DELETE
var urlupall = '/admin/upall'; //Обновление всех записей в таблице
var urlinsall = '/admin/insall'; //Добавление нескольких записей в таблице
//Названия таблиц
var divTab = 'spravkadiv', subTab = 'spravkasub', firmsTab = 'spravkafirms', vidsTab = 'spravkavids', banersTab = 'spravkabaners';
var foo;

$$(window).on('load', function () {
    token = localStorage.getItem('token');
    curIdSub = 256;
    myVue.curIdSub = 256;
    let promis = [];
    setTimeout(() => {
        //myVue.$f7.preloader.show('Идет загрузка сайта...');
    }, 500)

    //получаем таблицу рубрик
    promis.push(Framework7.request.promise.postJSON(urlRead, { token: token, table: divTab })
            .then(function (data) {
                divArr = JSON.parse(data.data.base);
            divArr = sortArr(divArr, 'pos', 0);
            lastPosDiv = divArr[divArr.length - 1].pos - 1;
            for (let i = 0; i < divArr.length; i++) {
                //заполняем лист рубрик
                Div.push(divArr[i]);
            }
            curDiv=divArr[0];
                        indexDiv = 0;
            return true;
        }).catch(function (error) {
            console.log(error);
        }));

    //получаем таблицу подрубрик
    promis.push(Framework7.request.promise.postJSON(urlRead, { token: token, table: subTab })
        .then(function (data) {
            subArr = JSON.parse(data.data.base);
            if (subArr.length !== 0) {
                lastIdSub = subArr[subArr.length - 1].id + 1;
                subArr = sortArr(subArr, 'pos', 1);
                lastPosSub = subArr[subArr.length - 1].pos + 1;
                for (let i = 0; i < subArr.length; i++) {
                    //заполняем лист рубрик
                    Sub.push(subArr[i]);
                }
            }
            return true;
        }));
    //получаем таблицу виды
    promis.push(Framework7.request.promise.postJSON(urlRead, { token: token, table: vidsTab })
        .then(function (data) {
            vidsArr = JSON.parse(data.data.base);
            Vids.length = 0;
            for (let i = 0; i < vidsArr.length; i++) {
                Vids[vidsArr[i].id] = vidsArr[i];
                VidsAll.push(vidsArr[i]);
            }
            VidsAll = sortArr(VidsAll, 'name', 1);
            return true;
        }));
    //получаем таблицу фирм
    promis.push(Framework7.request.promise.postJSON(urlRead, { token: token, table: firmsTab })
        .then(function (data2) {
            let data = data2.data;
            firmsArr = JSON.parse(data.base);
            sortArr(firmsArr, 'name');
            setTimeout(function () {
                for (let i = 0; i < firmsArr.length; i++) {
                    if (firmsArr[i].actual_date === '') { firmsArr[i].actual_date = (new Date(0, 0, 1)).toISOString(); }
                    Firms.push(firmsArr[i]);
                }
                setMainBan();
            }, 50);
            SubFirms(curIdSub);
            let str = $$("#div").children()[0];
            myVue.indexDiv = 0;
            let str2 = $$(str).children()[myVue.indexDiv];
            $$(str2).addClass('lineFill');
            return true;
        }));
    Promise.all(promis).then(results => {
        myVue.$f7.dialog.close();
        $$('.bod').animate({
            opacity: 1
        }, 10);
    }).catch((err) => {
        console.log('Ошибка = ' + err.message);
        myVue.$f7.dialog.close();
    });
});

//функция составляет список фирм по id подрубрики
function SubFirms(id, vtor) {
    let PriorFirms = [], RedFirms = [], BlackFirms = [];
    for (let i = 0; i < firmsArr.length; i++) {
        if (firmsArr[i].prioritet !== '') {
            if (firmsArr[i].prioritet_show.indexOf(',' + id + ',') !== -1) {
                PriorFirms.push(firmsArr[i]); continue;
            }
        }
        if (firmsArr[i].red !== '') {
            if (firmsArr[i].red.indexOf(',' + id + ',') !== -1) {
                RedFirms.push(firmsArr[i]); continue;
            }
        }
        if (firmsArr[i].black !== null && firmsArr[i].black !== '') {
            if (firmsArr[i].black.indexOf(',' + id + ',') !== -1) {
                BlackFirms.push(firmsArr[i]);
            }
        }
    }
    PriorFirms = sortArr(PriorFirms, 'prioritet');

    firmsSub.length = 0;
    for (let k = 0; k < PriorFirms.length; k++) {
        firmsSub.push(PriorFirms[k]);
    }
    for (let k = 0; k < RedFirms.length; k++) {
        firmsSub.push(RedFirms[k]);
    }
    for (let k = 0; k < BlackFirms.length; k++) {
        firmsSub.push(BlackFirms[k]);
    }
    if (vtor) {
        firmsSub = sortArr(firmsSub, 'date');
    }
    //выводим его на карту
    myVue.firmsSub = firmsSub;
    return firmsSub;
}

// фанкшион заполняет массив банеров на главной
function setMainBan() {
    mainBan.length = 0;
    for (let i = 0; i < Firms.length; i++) {
        if (JSON.parse(Firms[i].baner).main || JSON.parse(Firms[i].baner).main === 1) {
            let ban = JSON.parse(Firms[i].baner);
            let st = { baner: ban.baner, id: Firms[i].id, name: Firms[i].name, pos: ban.pos, begin: ban.begin, end: ban.end, main: ban.main, show: ban.show, banerMain: ban.banerMain }
            mainBan.push(st);
        }
    }
    sortArr(mainBan, 'pos', 1);
    for (let k = 0; k < mainBan.length; k++) {
        mainBan[k].pos = k;
    }
}


function moveArray(st, from, to) {
    let array = st;
    if (to === from) return array;
    var target = array[from];
    var increment = to < from ? -1 : 1;
    for (var k = from; k !== to; k += increment) {
        array[k] = array[k + increment];
    }
    array[to] = target;
    return array;
}
//Функция сортировки массива по ключу, ключи передаются в виде строки, направление сортировки - direct
function sortArr(A, key, direct, B) {
    if (B === undefined) {
        B = [];
        B.length = A.length;
    }
    let n = A.length; let foo, bar;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
            switch (key) {
                case 'date': {
                    bar = A[j + 1].actual_date;
                    foo = A[j].actual_date;
                    break;
                }
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
            if (foo > bar) { let t = A[j + 1]; A[j + 1] = A[j]; A[j] = t; let t2 = B[j + 1]; B[j + 1] = B[j]; B[j] = t2; }
        }
    }
    return A;    // На выходе сортированный по возрастанию массив A по ключу key.
}


//Карта
// создаем карту, центр томска center: coord[0] = 56.5005; coord[1] = 84.98212
//ключ для гугла AIzaSyBso-Mdh9DUyCHLKroKAfcSZiGD6-Jv5Jg
//ключ  яндекс e699252d-1879-4e01-8583-00ad94cdef76
var myMap, OutClients, OutIndex;
function initMapSait(clients) {
    OutClients = clients;
    var coord = [];
    coord[0] = 56.5005; coord[1] = 84.98212;
    $$('#mapSait').empty();
    myMap = new ymaps.Map('mapSait', {
        center: coord,
        zoom: 14,
        controls: ['routeButtonControl', 'zoomControl', 'searchControl', 'trafficControl', 'geolocationControl']
    }, {
        searchControlProvider: 'yandex#search',
        balloonPanelMaxMapArea: 0,
        buttonMaxWidth: 300
    });


    var clientsPromises = [];
    //myMap.controls.add(button, { top: 5, right: 5 });
    for (var i = 0; i < clients.name.length; i++) {
        // Функции начнут выпоняться после завершения цикла и в этот моммент
        // будет clients.name.length. Обойти это можно или использованием ES6
        // или созданием новой функции.
        clientsPromises.push(loadClient(i));
    }

    // Ждем когда для всех клиентов или появятся метки или произойдет ошибка
    // геокодирования.
    ymaps.vow.Promise.all(clientsPromises)
        .then(function (clients) {
            if (clientsPromises.length > 1) {
                myMap.setBounds(myMap.geoObjects.getBounds());
            }
        });
    // Функция для геопозиционирования, если не работает Яндекс
    function getCurr(coordinates) {
        return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    resolve([pos.coords.latitude, pos.coords.longitude]);
                }, function (error) {
                    reject(coordinates);
                }, { maximumAge: 5000, timeout: 4000, enableHighAccuracy: true });
        });
    }

    function loadClient(clientIndex) {
        // Промис, который резолвится координатами клиента.
        var clientCoordinatesPromise;
        var coordinates = clients.coordinates[clientIndex];
        if (clientIndex === 0 && clients.name.length > 1) {
            clientCoordinatesPromise = getCurr(coordinates)
                .then(function (res) {
                    return res;
                }).catch(function (err) {
                    return coordinates;
                });
        } else {
            // Для унифицикации дальнейшего кода, если координаты уже есть,
            //  создаем зарезолвившийся ими промис.
            clientCoordinatesPromise = ymaps.vow.resolve(coordinates);
        }
        // Подписываемся на получение координат и создаем метку.
        return clientCoordinatesPromise
            .then(function (coordinates) {
                if (coordinates[0] === null) {
                    // Игнорируем клиентов без координат.
                    return null;
                }
                if (clients.name.length === 1) {
                    myMap.setCenter(coordinates, 14);
                    var point = new ymaps.Placemark(coordinates,
                        {
                            balloonContentHeader: clients.name[clientIndex]
                        },
                        {
                            preset: 'islands#redDotIcon', hideIconOnBalloonOpen: false,
                            balloonOffset: [0, -25]

                        });
                } else {
                    if (clientIndex === 0 && clients.name.length > 1) {
                        if (coordinates[0] === coord[0] && coordinates[1] === coord[1]) {
                            point = new ymaps.Placemark(coordinates,
                                {
                                    balloonContentHeader: 'Развязка',
                                    balloonContent: 'Пушкина - Комсомольский'
                                },
                                {
                                    preset: 'islands#blueDotIcon',
                                    hideIconOnBalloonOpen: false,
                                    balloonOffset: [0, -25]
                                });

                        } else {
                            point = new ymaps.Placemark(coordinates,
                                {
                                    balloonContentHeader: 'Я здесь',
                                    iconContent: 'Я'
                                },
                                {
                                    preset: 'islands#darkGreenIcon',
                                    hideIconOnBalloonOpen: false
                                });
                        }
                    } else {

                        point = new ymaps.Placemark(coordinates,
                            {
                                balloonContentHeader: clients.name[clientIndex],
                                balloonContent: 'Адрес: ' + clients.address[clientIndex].split('Томск, ')[1],
                                id: clients.id[clientIndex],
                                index: clients.index[clientIndex],
                                hideIconOnBalloonOpen: false,
                                balloonOffset: [0, -25],
                                // Размеры картинки балуна
                                balloonImageSize: [150, 150],
                                hintContent: clients.name[clientIndex]
                            },
                            {
                                preset: clients.color[clientIndex],
                                hideIconOnBalloonOpen: false,
                                balloonOffset: [0, -25]
                            });
                    }
                }
                myMap.geoObjects.add(point);

                // Клик по метке на карте
                point.events.add('click', function (e) {
                    let collection = ymaps.geoQuery(myMap.geoObjects);
                    // Цвет всех меток
                    for (let j = 0; j < collection.getLength(); j++) {
                        let currentPm = collection.get(j);
                        if (currentPm.properties._data.balloonContentHeader !== 'Я здесь') {
                            currentPm.options.set(
                                'preset', 'islands#blueIcon'
                            );
                        }
                    }
                    // Цвет текущей метки
                    if (e.get('target').properties._data.balloonContentHeader !== 'Я здесь') {
                        e.get('target').options.set('preset', 'islands#redIcon');
                        myMap.panTo(e.get('target').geometry.getCoordinates(), { useMapMargin: true });
                        let firmaId = e.get('target').properties._data.id;
                        let firmaIndex = e.get('target').properties._data.index;
                        let firmaName = e.get('target').properties._data.balloonContentHeader;
                        myVue.OpenFirma(firmaId, firmaIndex, firmaName);
                    }
                });

                // Можно вернуть дополнительную информацию.
                // Или вообще ничего не возвращать.
                return {};
            });
    }

}


// Функция для раскраски метки выбранной фирмы
function setRed(name) {
    let collection = ymaps.geoQuery(myMap.geoObjects);
    for (let j = 0; j < collection.getLength(); j++) {
        let Pm = collection.get(j);
        if (Pm.properties._data.balloonContentHeader !== 'Я здесь') {
            Pm.options.set('preset', 'islands#blueIcon');
            Pm.balloon.close();
            Pm.options.set({ "zIndex": 50 });
        }
        if (Pm.properties._data.balloonContentHeader === name) {
            Pm.options.set('preset', 'islands#redIcon');
            setTimeout(function () {
                Pm.balloon.open();
            }, 400);
            Pm.options.set({ "zIndex": 100 });
            // Переместим центр карты по координатам метки с учётом заданных отступов.
            myMap.panTo(Pm.geometry.getCoordinates(), { useMapMargin: true });
        }
    }
}

// отслеживание, нажатие на вид деятельности
$$(document).on('change', '#vid', function (el) {
    let selec = 'option[value="' + firma.vid + '"]';
    curVid = $$(selec).text();
    myVue.firma.vid = firma.vid;
    myVue.curVid = curVid;
    $$('#btnNewVid').text('Удалить');
});
// отслеживание, нажатие на вид деятельности
$$(document).on('focusin', '#vidStav', function (el) {
    $$('#btnNewVid').text('Добавить');
});

// отслеживание, кнопку нажали на звезде
$$(document).on('mousedown', '.star', function () {
    starClick = true;
    setTimeout(function () {
        starClick = false;
    }, 200);
});

// Предотвращение закрытие аккордеона при нажатие на звездочку
$$(document).on('accordion:beforeclose', '.S_Ftab', function (el) {
    if (starClick) { event.detail.prevent(false); return true; }
    $$(event.target).removeClass('S_lineFirmOpen');

});

// при вводе первого символа в поисковике появляется список
$$(document).on('input', '.MainSearch', function (el) {
    $$('.spisok').show();

});
// потеря фокуса поиска
$$(document).on('focusout', '.MainSearch', function (el) {
    let self = this;
    setTimeout(function () {
        $$('.spisok').hide();
        var search = myVue.$f7.searchbar.get(self);
        search.disable();
    }, 200);
});
