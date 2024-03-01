'use strict';
var token, urlToken;
//пути к GRUD операциям
var urlRead = '/sait/read'; //Чтение (read)	SELECT
//Названия таблиц
var divTab = 'spravkadiv', subTab = 'spravkasub', firmsTab = 'spravkafirms', vidsTab = 'spravkavids', banersTab = 'spravkabaners';
var foo; var baseCange = false; //изменилась база или нет
var indexHover = -1; //index фирмы под курсором 

$$(window).on('load', function () {
    token = localStorage.getItem('token');
            myVue.$f7.dialog.preloader('Идет загрузка...');
    //localforage.clear();
    Framework7.request.promise.postJSON('/sait/time', {})
        .then(function (data) {
            let st = data.data;
            let timeBase = st.time;
            console.log(timeBase);
            timeBase = new Date();
            let StoreTimeBase;
            //Загружаем дату изменения базы на сервере и сохраняем ее, либо сравниваем с сохраненной
            if (localStorage.getItem("timeBase")) {
                StoreTimeBase = JSON.parse(localStorage.getItem("timeBase"));
                if (StoreTimeBase !== timeBase) {
                    localStorage.setItem("timeBase", JSON.stringify(timeBase));
                } else {
                    baseCange = true;
                    return Promise.reject(baseCange);
                }
            } else {
                localStorage.setItem("timeBase", JSON.stringify(timeBase));
            }
            //получаем таблицу рубрик
            return Framework7.request.promise.postJSON(urlRead, { table: divTab })
                .then(function (data) {
                    let divArr = JSON.parse(data.data.base);
                    divArr = sortArr(divArr, 'pos', 0);
                    for (let i = 0; i < divArr.length; i++) {
                        if (divArr[i].display === '1') {
                            Div.push(divArr[i]);
                        }
                    }
                    //получаем таблицу подрубрик
                    return Framework7.request.promise.postJSON(urlRead, { table: subTab })
                        .then(function (data) {
                            let subArr = JSON.parse(data.data.base);
                            subArr = sortArr(subArr, 'pos', 0);
                            for (let i = 0; i < subArr.length; i++) {
                                if (subArr[i].display === '1') {
                                    Sub.push(subArr[i]);
                                }
                            }
                            //получаем таблицу видов деятельности
                            return Framework7.request.promise.postJSON(urlRead, { table: vidsTab })
                                .then(function (data) {
                                    let vidsArr = JSON.parse(data.data.base);
                                    for (let i = 0; i < vidsArr.length; i++) {
                                        Vids[vidsArr[i].id] = vidsArr[i];
                                    }
                                    //получаем таблицу фирм
                                    return Framework7.request.promise.postJSON(urlRead, { table: firmsTab })
                                        .then(function (data) {
                                            let firmsArr = JSON.parse(data.data.base);
                                            let k = 0;
                                            sortArr(firmsArr, 'name');
                                            for (let i = 0; i < firmsArr.length; i++) {
                                                if (firmsArr[i] !== undefined && firmsArr[i].display === '1' && firmsArr[i].name !== undefined ) {
                                                    let isVid=true;
                                                    try {
                                                       let foo = vidsArr[firmsArr[i].vid].name;
                                                                              
                                                      } catch (err) {
                                                          isVid = false;
                                                 }
                                                 if(!isVid) {
                                                    firmsArr[i].vid =  116;
                                                }
                                                    
                                                    Firms.push(firmsArr[i]);
                                                    if (JSON.parse(firmsArr[i].baner).main === 1 || JSON.parse(firmsArr[i].baner).main === true) {
                                                        
                                                        mainFirms.push(firmsArr[i]);
                                                        mainBan.push(JSON.parse(firmsArr[i].baner));
                                                        mainIndex.push(k);
                                                        k++;
                                                    }
                                                }
                                            }
                                            //Создаем массивы подрубрик для фирм
                                            firmaSubs.length = 0;
                                            for (let m = 0; m < Firms.length; m++) {
                                                let subs = Firms[m].red + Firms[m].prioritet_show + Firms[m].black;
                                                subs = subs.replace(',,', ',');
                                                let Fsub = subs.split(',');
                                                Fsub.shift(); Fsub.pop();
                                                Fsub.sort(function (a, b) { return a - b; });
                                                let fSubTemp = [];
                                                for (let i = 0; i < Fsub.length; i++) {
                                                    for (let k = 0; k < Sub.length; k++) {
                                                        if (Sub[k].id === Number(Fsub[i])) {
                                                            let foo = { id: Sub[k].id, parrent: Sub[k].parent, name: Sub[k].name, red: Sub[k].red };
                                                            fSubTemp.push(foo); break;
                                                        }
                                                    }
                                                }
                                                firmaSubs.push(fSubTemp);
                                            }
                                            //составляем массив подрубрик по рубрикам
                                            divSubs.length = 0;
                                            SubIndex.length = 0;
                                            for (let m = 0; m < Div.length; m++) {
                                                let temp = [], ret = [];
                                                for (let k = 0; k < Sub.length; k++) {
                                                    if (Sub[k].parent === Div[m].id) {
                                                        temp.push(Sub[k]);
                                                        ret.push(k);
                                                    }
                                                }
                                                sortArr(temp, 'pos', 1, ret);
                                                divSubs.push(temp);
                                                SubIndex.push(ret);
                                            }

                                            //составляем массив фирм по подрубрикам divColFirms, subColFirms
                                            subFirms.length = 0;
                                            for (let m = 0; m < Sub.length; m++) {
                                                let subFirm = GetSubFirms(Sub[m].id);
                                                subColFirms.push(subFirm.length);
                                                subFirms.push(subFirm);
                                            }
                                            let col = 0;
                                            for (let k = 0; k < divArr.length; k++) {
                                                col = 0;
                                                for (let i = 0; i < subColFirms.length; i++) {
                                                    if (Div[k] != undefined) {
                                                        if (Sub[i].parent === Div[k].id) {
                                                            col += subColFirms[i];
                                                        }
                                                    }
                                                }
                                                divColFirms.push(col);
                                            }
                                            sortArr(mainBan, 'pos', 1, mainFirms, mainIndex);
                                            for (let k = 0; k < myVue.mainFirms.length; k++) {
                                                myVue.CurFirms.push(myVue.mainFirms[k]);
                                            }
                                            console.log('Загрузили новые данные');
                                            setMap(myVue.mainFirms, '', false); //выводим банера на главные со списком 
                                            myVue.$f7.dialog.close();
                                            $$('.bod').animate({ opacity: 1 }, 2000);
                                        });
                                });
                        });
                });
        }).catch(function (err) {
            console.log(err);
            myVue.$f7.dialog.close();
            if (baseCange) {
                let resul = [];
                resul.push(Store('Div', Div, '')); resul.push(Store('Sub', Sub, '')); resul.push(Store('Vids', Vids, '')); resul.push(Store('SubIndex', SubIndex, ''));
                resul.push(Store('Firms', Firms, '')); resul.push(Store('subFirms', subFirms, '')); resul.push(Store('firmaSubs', firmaSubs, ''));
                resul.push(Store('divSubs', divSubs, '')); resul.push(Store('mainFirms', mainFirms, '')); resul.push(Store('mainBan', mainBan, ''));
                Promise.all(resul).then(result => {
                    myVue.Div = result[0]; myVue.Sub = result[1]; myVue.Vids = result[2]; myVue.SubIndex = result[3]; myVue.Firms = result[4];
                    myVue.subFirms = result[5]; myVue.firmaSubs = result[6]; myVue.divSubs = result[7]; myVue.mainFirms = result[8];
                    myVue.mainBan = result[9];
                    Div = myVue.Div; Sub = myVue.Sub; Vids = myVue.Vids; SubIndex = myVue.SubIndex; Firms = myVue.Firms;
                    subFirms = myVue.subFirms; firmaSubs = myVue.firmaSubs; divSubs = myVue.divSubs;
                    mainFirms = myVue.mainFirms; mainBan = myVue.mainBan;
                    for (let k = 0; k < myVue.mainFirms.length; k++) {
                        myVue.CurFirms.push(myVue.mainFirms[k]);
                    }
                    setMap(myVue.mainFirms, '', false); //выводим банера на главные со списком 

                    $$('.bod').animate({
                        opacity: 1
                    }, 1000);
                });
                console.log('Загрузили старые данные');
            } else { console.log('Общая ошибка = ' + err + ' попробуйте еще раз.'); }
        });
    });

//функция запоминает или извлекает данные из локал сторедж
function Store(key, arr, act) {
    let ret = [];
    if (act === 'set') {
        return localforage.setItem(key, arr).then(function (value) {
            return value;
        }).catch(function (err) {
            console.log(err);
        });
    } else {
        return localforage.getItem(key).then(function (value) {
            return value;
        }).catch(function (err) {
            console.log(err);
        });
    }
}
//функция составляет список фирм по id подрубрики
function GetSubFirms(id) {
    let firmsSubArr = [];
    let PriorFirms = [], RedFirms = [], BlackFirms = [];
    let PriorFirmsInd = [], RedFirmsInd = [], BlackFirmsInd = [], FirmaInArr = [];
    for (let i = 0; i < Firms.length; i++) {
        if (Firms[i].prioritet !== '') {
            if (Firms[i].prioritet_show.indexOf(',' + id + ',') !== -1) {
                PriorFirmsInd.push(i);
                PriorFirms.push(Firms[i]); continue;
            }
        }
        if (Firms[i].red !== '') {
            if (Firms[i].red.indexOf(',' + id + ',') !== -1) {
                RedFirmsInd.push(i);
                RedFirms.push(Firms[i]); continue;
            }
        }
        if (Firms[i].black !== null && Firms[i].black !== '') {
            if (Firms[i].black.indexOf(',' + id + ',') !== -1) {
                BlackFirmsInd.push(i);
                BlackFirms.push(Firms[i]);
            }
        }
    }
    PriorFirms = sortArr(PriorFirms, 'prioritet', 1, PriorFirmsInd);
    for (let k = 0; k < PriorFirms.length; k++) {
        FirmaInArr.push(PriorFirmsInd[k]);
        firmsSubArr.push(PriorFirms[k]);
    }
    for (let k = 0; k < RedFirms.length; k++) {
        FirmaInArr.push(RedFirmsInd[k]);
        firmsSubArr.push(RedFirms[k]);
    }
    for (let k = 0; k < BlackFirms.length; k++) {
        FirmaInArr.push(BlackFirmsInd[k]);
        firmsSubArr.push(BlackFirms[k]);
    }
    FirmaIndex.push(FirmaInArr);
    //выводим его на карту
    //setMap(firmsSub, '');
    return firmsSubArr;
}

//переносим один в другой
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
//Функция сортировки массива по ключу, ключи передаются в виде строки, направление сортировки - direct? B и С доп. Array
function sortArr(A, key, direct, B, C) {
    if (B === undefined) {
        B = [];
        B.length = A.length;
    }
    if (C === undefined) {
        C = [];
        C.length = A.length;
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
            if (foo > bar) {
                let t = A[j + 1]; A[j + 1] = A[j]; A[j] = t;
                let t2 = B[j + 1]; B[j + 1] = B[j]; B[j] = t2;
                let t3 = C[j + 1]; C[j + 1] = C[j]; C[j] = t3;
            }
        }
    }
    return A;    // На выходе сортированный по возрастанию массив A по ключу key.
}

//вывод на карту значков
function setMap(arr, name, sub) {
    let index = 0;
    MapFirms.address.length = 0;
    MapFirms.name.length = 0;
    MapFirms.index.length = 0;
    MapFirms.id.length = 0;
    MapFirms.color.length = 0;
    MapFirms.coordinates.length = 0;
    for (let i = 0; i < arr.length; i++) {
        let adress = JSON.parse(arr[i].address);
                for (let k = 0; k < adress.length; k++) {
            if (adress[k].adres === '-') {
                MapFirms.address[index] = '';
            } else {
                MapFirms.address[index] = adress[k].city + ', ' + adress[k].adres;
            }
            MapFirms.name[index] = arr[i].name;
            MapFirms.id[index] = arr[i].id;
            MapFirms.index[index] = i;
            MapFirms.coordinates[index] = [adress[k].latid, adress[k].long];
            MapFirms.color[index] = 'islands#blueIcon';
            if (sub) {
                let ind = 0;
                for (let s = 0; s < myVue.Firms.length; s++) {
                    if (myVue.Firms[s].id === arr[i].id) {
                        ind = s; break;
                    }
                }
                if (myVue.Firms[ind].red.indexOf(',' + myVue.SubId + ',') !== -1 || myVue.Firms[ind].prioritet_show.indexOf(',' + myVue.SubId + ',') !== -1) {
                    MapFirms.color[index] = 'islands#redIcon';
                }
            }
            if (myVue.accordDiv === 0 || myVue.statusFirm === 'ban') {
                MapFirms.color[index] = 'islands#redIcon';
            }
            index++;
        }
    }
    setTimeout(function () {
        initMapSait(MapFirms);
    }, 50);
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
        // будет clients.name.length. 
                clientsPromises.push(loadClient(i));
    }

    // Ждем когда для всех клиентов или появятся метки или произойдет ошибка геокодирования.
    ymaps.vow.Promise.all(clientsPromises)
        .then(function (clients) {
            if (clientsPromises.length > 1) {
                myMap.setBounds(myMap.geoObjects.getBounds());
            }
        });
    // Функция для геопозиционирования, если не работает Яндекс
    function getCurr(coordinates) {
        console.log(coordinates);
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
        
        // если надо геолокацию, включаем здесь
        // if (clientIndex === 0 && clients.name.length > 1) {
        //     clientCoordinatesPromise = getCurr(coordinates)
        //         .then(function (res) {
        //             return res;
        //         }).catch(function (err) {
        //             return coordinates;
        //         });
        // } else 
        {
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
                }
                let hin = '';
                if (myVue.accordDiv === 0 || myVue.statusFirm === 'ban') {
                    clients.color[clientIndex] = 'islands#redStretchyIcon';
                    hin = clients.name[clientIndex];
                }
                var point = new ymaps.Placemark(coordinates,
                    {
                        balloonContentHeader: clients.name[clientIndex],
                        balloonContent: 'Адрес: ' + clients.address[clientIndex].split('Томск, ')[1],
                        id: clients.id[clientIndex],
                        index: clients.index[clientIndex],
                        hideIconOnBalloonOpen: false,
                        balloonOffset: [0, -25],
                        // Размеры картинки балуна
                        balloonImageSize: [150, 150],
                        hintContent: clients.name[clientIndex],
                        iconContent: hin
                    },
                    {
                        preset: clients.color[clientIndex],
                        hideIconOnBalloonOpen: false,
                        balloonOffset: [0, -25]
                    });
                myMap.geoObjects.add(point);

                // Клик по метке на карте
                point.events.add('click', function (e) {
                    let collection = ymaps.geoQuery(myMap.geoObjects);
                    // Цвет всех меток
                    for (let j = 0; j < collection.getLength(); j++) {
                        let currentPm = collection.get(j);
                        if (myVue.accordDiv === 0 || myVue.statusFirm === 'ban') {
                            currentPm.options.set('preset', 'islands#redStretchyIcon');
                            currentPm.properties.set('iconContent', currentPm.properties._data.balloonContentHeader);
                        } else {
                            currentPm.options.set('preset', 'islands#blueIcon ');
                        }
                    }
                    // Цвет текущей метки
                    if (myVue.accordDiv === 0 || myVue.statusFirm === 'ban') {
                        e.get('target').properties.set('preset', 'islands#redStretchyIcon');
                    } else {
                        e.get('target').options.set('preset', 'islands#GreenIcon');
                    }
                    myMap.panTo(e.get('target').geometry.getCoordinates(), { useMapMargin: true });
                    let firmaId = e.get('target').properties._data.id;
                    let firmaIndex = e.get('target').properties._data.index;
                    let firmaName = e.get('target').properties._data.balloonContentHeader;
                    myVue.OpenFirma(firmaId, firmaIndex, firmaName);
                });

            
                return {};
            });
    }
}
// Функция для раскраски метки выбранной фирмы в банерах и акциях
function setPoint(index) {
    let collection = ymaps.geoQuery(myMap.geoObjects);
    for (let j = 0; j < collection.getLength(); j++) {
        let Pm = collection.get(j);
        if (Pm.properties._data.index === index || Pm.properties._data.index === myVue.accordFirma) {
            if (myVue.accordDiv === 0 || myVue.statusFirm === 'ban') {
                Pm.options.set('preset', 'islands#greenStretchyIcon');
            } else {
                Pm.options.set('preset', 'islands#greenIcon');
            }
            Pm.options.set({ "zIndex": 50 });
        } else {
            Pm.options.set({ "zIndex": 25 });
            if (myVue.accordDiv === 0 || myVue.statusFirm === 'ban') {
                Pm.options.set('preset', 'islands#redStretchyIcon');
            } else {
                Pm.options.set('preset', MapFirms.color[j]);
            }
        }
    }
}

// Функция для раскраски метки выбранной фирмы
function setRed(id) {

    let collection = ymaps.geoQuery(myMap.geoObjects);
    for (let j = 0; j < collection.getLength(); j++) {
        let Pm = collection.get(j);
        Pm.options.set('preset', MapFirms.color[j]);
        Pm.balloon.close();
        Pm.options.set({ "zIndex": 50 });
        if (Pm.properties._data.id === id) {
            if (myVue.accordDiv === 0 || myVue.statusFirm === 'ban') {
                Pm.options.set('preset', 'islands#greenStretchyIcon');
            } else {
                Pm.options.set('preset', 'islands#greenIcon');
            }
            setTimeout(function () {
                Pm.balloon.open();
            }, 300);
            Pm.options.set({ "zIndex": 100 });
            // Переместим центр карты по координатам метки с учётом заданных отступов.
            // myMap.panTo(Pm.geometry.getCoordinates(), { useMapMargin: true });
            myMap.setCenter(Pm.geometry.getCoordinates());
        }
    }
}

// закрытие менюшних поповеров
$$(document).on('popover:close', '.popoverMenu', function () {
    myVue.popoverOpen2 = false;
    myVue.popoverOpen = false;
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
    if (starClick) { detail.prevent(false); return true; }
    $$(target).removeClass('S_lineFirmOpen');

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
        if (search !== undefined) {
            search.disable();
        }
    }, 200);
});
// курсор над фирмой
$$(document).on('mouseover', '.firma', function (event) {
    let index = Number(this.id.split('firma')[1]);
    if (indexHover === index) { return; }
    indexHover = index;
    setTimeout(function () {
        setPoint(index);
    }, 100);
});
// курсор ушел с фирмы
$$(document).on('mouseout', '.firma', function (event) {
    let index = Number(this.id.split('firma')[1]);
    indexHover = -1;
    setTimeout(function () {
        setPoint(-1);
    }, 100);
});
// нажатие на меню
$$('.enter').click(function () {
    $$('.popover-menu').toggleClass('dropR');
    $$('.enter').toggleClass('fonBlack');
});
$$('.enter2').click(function () {
    $$('.enter2').toggleClass('fonBlack');
    $$('.popover-menu2').toggleClass('dropR');
});


// убрать дропменю если нажали в другом месте
$$(document).click(function (e) {
    if (!$$(e.target).parent().is('#enter')) {
        $$('.popover-menu').removeClass('dropR');
        $$('.enter').removeClass('fonBlack');
    }
    if (!$$(e.target).parent().is('#enter2')) {
        $$('.popover-menu2').removeClass('dropR'); $$('.enter2').removeClass('fonBlack');
    }

});

//функция для закрытия всех рубрик
function goHome() {
    let temp, tempId;
    if (myVue.accordDiv !== -1) {
        myVue.setDiv(-1, myVue.accordDiv, false);
    }
    myVue.accordDiv = -1;
    myVue.accordSub = -1;
    myVue.accordFirma = -1;
}

// нажатие на клавиши назад вперед в истории браузера
addEventListener("popstate", function (e) {
    if (e.state === null) { return; }
    if (!e.state.hasOwnProperty('stack')) { return; }
    if (stackIndex > e.state.stack) { stackIndex--; } else { stackIndex++; }
    if (e.state.pod === 'Sub') {
        myVue.setSubSearch(e.state.id, e.state.indexAll, e.state.parent, true);
    }
    if (e.state.pod === 'firma') {
        myVue.setSubSearch(e.state.id, e.state.indexAll, e.state.parent, true);
        setTimeout(function () {
            myVue.OpenFirma(e.state.firmaId, e.state.firmaIndex, e.state.name, true);
        }, 50);
    }
    if (e.state.pod === 'Div') {
        myVue.setDiv(-1, myVue.accordDiv, true);
        setTimeout(function () {
            myVue.OpenFirma(e.state.firmaId, e.state.firmaIndex, e.state.name, true);
        }, 250);
    }
}, false);