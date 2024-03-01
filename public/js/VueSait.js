'use strict';

//Массивы которые добавляются из базы
var Sub = [], Div = [], Vids = [], Firms = [];
var CurFirms = []; //текущий массив фирм для второй колонки
var statusFirm = 'ban'; //какой сейчас тип массива для второй колонки, 'ban' - банера, 'search' -с поисковика, 'sub' - подразделы
var divColFirms = []; //массив количества фирм в разделе
var subColFirms = []; //массив количества фирм в подразделе
var subFirms = []; //массив фирм для подрубрик 
var firmaSubs = []; //массив подрубрик для фирмы
var divSubs = []; //массив подрубрик для рубрики
var actionOpen = false; //переменная которая позволяет открывать или закрывать акцию, false - закрыть, true - открыть
var MapFirms = { address: [''], name: [''], id: [0], index: [0], coordinates: [null, null], color: [] };//Массив для карты
var mainFirms = []; var mainBan = []; // фирмы главных банеров
var mainIndex = []; // индексы в главном массиве главных банеров
var SubId = -1; // id в главном массиве подрубрик
var indexDiv = -1; // id в главном массиве подрубрик
var SubIndex = []; // индексы в главном массиве подрубрик
var FirmaIndex = []; // индексы в главном массиве фирм
var DefFirSub = []; // Текущий массив подразделов фирмы
var SearchFirms = -1; // фирмa найденные в поисковике
var accordDiv = -1;//какая рубрика открыта, -1 - никакая, появляются банера
var accordSub = -1;//какая подрубрика открыта, -1 - никакая, появляются банера
var accordFirma = -1;//какая фирма открыта, -1 - никакая
var FirIndex = 0;//какая фирма открыта, -1 - никакая
var starClick = false; //нажимали ли в течении полусекунды на звезду
var rightPan = 4; //что показывать при нажатии на меню и открытие правой панели
var userSpr = 0; // статус пользователя, 0 - незарегестрированный, 1 - регистрированный, 2 - админ
var stackIndex = 0; // стек действий, для контроля действий пользователя
//Массив хранящая в себе адрес вместе с данными, ладитудой, лонгтитудой и так далее
var multAdr = [{ adres: '', long: '', latid: '', city: '', tel1: '', dop1: '', tel2: '', dop2: '', tel3: '', dop3: '' }];
//Добавление или редактирование рубрик, подрубрик по id
var $$ = Dom7;
Framework7.use(Framework7Vue);
// Init Vue App
var myVue = new Vue({
    // App Root Element
    el: '#app',
    // App root data
    data() {
        return {
            Sub, Div, Vids, Firms, subFirms, firmaSubs, MapFirms, mainFirms, SearchFirms, accordDiv, accordSub, accordFirma,
            starClick, multAdr, userSpr, mainIndex, mainBan, divSubs, SubIndex, FirmaIndex, SubId, DefFirSub, FirIndex, CurFirms,
            actionOpen, statusFirm, rightPan, stackIndex, divColFirms, subColFirms,
            f7params: {
                // Array with app routes
                routes: [

                ],
                // App Name
                name: 'My App',
                // App id
                id: 'com.myapp.test',
                theme: 'aurora',
                touch: {
                    tapHold: false,
                    iosTouchRipple: false,
                    mdTouchRipple: false,
                    activeState: true,
                    tapHoldDelay: 250
                }
            }
        };
    },

    // App root methods
    methods: {
        // индикатор загрузки
        PageInit: function () {
            const self = this;
            $$('body').animate({
                opacity: 1
            }, 10);
        },
        //Показ toast
        toastShow: function (text) {
            const self = this;
            var toast = self.$f7.toast.create({
                text: text,
                position: 'center',
                closeTimeout: 3000
            }); toast.open();
        },
        //Нажатие кнопки запроса фирм
        OpenZapros: function () {
            myVue.rightPan = 2;
            this.$f7.panel.open($$('#rightPanel'));
            // <f7-panel right class="bod" id="rightPanel">

        },

        //Нажатие на подрубрику
        setSub: function (id, index, indexAll, state) {
            $$('#firms').scrollTop(0);
            if (myVue.accordDiv === 0) {
                myVue.actionOpen = true;
            } else { myVue.actionOpen = false; }
            myVue.statusFirm = 'sub';
            let self = this;
            myVue.accordFirma = -1;
            for (let k = 0; k < Sub.length; k++) {
                if (Sub[k].id === id) {
                    indexAll = k;
                }
            }
            myVue.indexSub = indexAll;
            myVue.accordSub = index;
            myVue.SubId = id;
            myVue.CurFirms.length = 0;
            for (let k = 0; k < myVue.subFirms[indexAll].length; k++) {
                myVue.CurFirms.push(myVue.subFirms[indexAll][k]);
            }
            setMap(myVue.subFirms[indexAll], '', true);
            if (myVue.CurFirms.length === 1) {
                let str2 = '#firma0';
                myVue.accordFirma = 0;
                setTimeout(function () {
                    self.$f7.accordion.open(str2);
                    self.$f7.accordion.close(str2);
                    self.$f7.accordion.open(str2);
                    $$(str2).addClass('S_lineFirmOpen');
                    setRed(myVue.CurFirms[0].id);
                }, 250);
            }
            //записываем данные в хистори, если нажимал пользователь, игнорируем если вызов был из хистори
            if (!state) { window.history.pushState({ id: id, index: indexAll, pod: 'Sub', stack: stackIndex, parent: Sub[indexAll].parent }, '/Sub?id=' + id + '&index=' + index); stackIndex++; }
        },
        //Нажатие на фирму в поисковике
        setFirmSearch: function (id, index, name) {
            myVue.statusFirm = 'search';
            myVue.CurFirms.length = 0;
            let self = this;
            myVue.CurFirms[0] = myVue.Firms[index];
            myVue.accordFirma = 0;
            if (myVue.accordDiv !== -1) {
                let str = $$("#div").children()[0];
                let str2 = $$(str).children()[myVue.accordDiv];
                $$(str2).removeClass('lineFill');
                self.$f7.accordion.close(str2);
                myVue.accordDiv = -1;
            }
            let str2 = '#firma0';
            setMap(myVue.CurFirms, '', false);
            setTimeout(function () {
                self.$f7.accordion.open(str2);
                self.$f7.accordion.close(str2);
                self.$f7.accordion.open(str2);
                $$(str2).addClass('S_lineFirmOpen');
                setRed(id);
            }, 150);
        },
        //Нажатие на подрубрику в поисковике
        setSubSearch: function (id, index, parent, state) {
            myVue.statusFirm = 'sub';
            let indexId;
            for (let k = 0; k < Div.length; k++) {
                if (parent === Div[k].id) {
                    indexId = k; break;
                }
            }
            myVue.accordDiv = -1;
            myVue.setDiv(parent, indexId, true);
            let subCur;
            for (let k = 0; k < divSubs[indexId].length; k++) {
                if (divSubs[indexId][k].id === id) {
                    subCur = k; break;
                }
            }
            setTimeout(function () {
                myVue.setSub(id, subCur, index, state);
            }, 10);
            //записываем данные в хистори, если нажимал пользователь, игнорируем если вызов был из хистори
            if (!state) { window.history.pushState({ id: id, index: index, pod: 'Sub', stack: stackIndex, parent: parent }, '/Sub?id=' + id + '&index=' + index); stackIndex++; }
        },
        //Нажатие на рубрику
        setDiv: function (id, index, state) {
            let self = this;
            myVue.accordSub = -1;
            let str = $$("#div").children()[0];
            $$('#div').scrollTop(0);
            let str2 = $$(str).children()[myVue.accordDiv];
            myVue.accordFirma = -1;
            if (myVue.accordDiv === index && myVue.accordDiv !== -1) {
                self.$f7.accordion.close(str2);
                myVue.accordDiv = -1;
                $$(str2).removeClass('lineFill');
            } else {
                str2 = $$(str).children()[index];
                self.$f7.accordion.open(str2);
                $$(str2).addClass('lineFill');
                myVue.accordDiv = index;
            }
            myVue.actionOpen === false;
            myVue.CurFirms.length = 0;
            myVue.statusFirm = 'ban';
            for (let k = 0; k < myVue.mainFirms.length; k++) {
                myVue.CurFirms.push(myVue.mainFirms[k]);
            }
            setMap(myVue.mainFirms, '', false);
            $$('#firms').scrollTo(0, 0);
            // if (!state && myVue.accordSub !== -1) { setMap(myVue.mainFirms, '', false); }
        },

        //Переход из карточки фирмы в подраздел по нажатию на подраздел
        OpenSubFirma: function (id, index) {
            const self = this;
            //закрываем все аккордеоны
            let str2 = '#firma' + myVue.accordFirma;
            self.$f7.accordion.close(str2);
            let str = $$("#div").children()[0];
            if (myVue.accordDiv !== -1) {
                str2 = $$(str).children()[myVue.accordDiv];
                self.$f7.accordion.close(str2);
                $$(str2).removeClass('lineFill');
            }
            myVue.accordFirma = -1;
            myVue.accordSub = -1;
            myVue.accordDiv = -1;
            //Открываем нужный аккордеон
            let temp, tempId;
            for (let k = 0; k < Sub.length; k++) {
                if (Sub[k].id === Number(id)) {
                    myVue.accordSub = k;
                    temp = Sub[k].parent;
                    break;
                }
            }
            for (let k = 0; k < Div.length; k++) {
                if (Div[k].id === temp) {
                    myVue.accordDiv = k;
                    break;
                }
            }
            str2 = $$(str).children()[myVue.accordDiv];
            $$(str2).addClass('lineFill');
            self.$f7.accordion.open(str2);
            let index2;
            for (let k = 0; k < divSubs[myVue.accordDiv].length; k++) {
                if (divSubs[myVue.accordDiv][k].id === Sub[myVue.accordSub].id) {
                    temp = Sub[myVue.accordSub].id;
                    index2 = k; break;
                }
            }
            myVue.setSub(temp, index2, myVue.accordSub);
        },
        //Закрытие аккордеона
        closeAccor: function (index) {
            myVue.actionOpen = false;
            const self = this;
            let strFirm = "#firms";
            let str, str2;
            if (myVue.accord === 0) {
                strFirm = "#firmsBan";
            }
            str = $$(strFirm).children()[0];
            str2 = $$(str).children()[index];
            $(str2).removeClass('S_lineFirmOpen');
            self.$f7.accordion.close(str2);
            setTimeout(function () {
                setRed(-1);
            }, 50);
        },
        //Нажатие на звездочку
        StarFirma: function (id, index, name) {
            myVue.toastShow('Функция в разработке');
        },

        //Нажатие на фирму для окрытия карточки предприятия или закрытия
        OpenFirma: function (id, index, name, state) {
            if (myVue.accordDiv === 0) {
                myVue.actionOpen = true;
            } else { myVue.actionOpen = false; }
            const self = this;
            $$('#firms').scrollTop(0);
            //если кликнули по звездочке, то возрат
            if (event !== undefined && event.type === 'click' && $$(event.target).hasClass('star')) { return true; }
            //Определяем элемент фирмы по которому кликнули
            // и скролим его наверх
            let str2 = '#firma' + index;
            for (let k = 0; k < Firms.length; k++) {
                if (Firms[k].id === id) {
                    myVue.FirIndex = k;
                    FirIndex = k;
                    break;
                }
            }
            if (myVue.accordFirma !== -1 && myVue.accordFirma === index && !state) {
                //закрываем акордеон фирмы
                myVue.accordFirma = -1;
                self.$f7.accordion.close(str2);
                $$(str2).removeClass('S_lineFirmOpen');
                $$('#firms').scrollTop(0);
                setTimeout(function () { setRed(-1); }, 50);
            } else {
                //открываем акордеон фирмы
                let pet = $$(str2).offset().top;
                let pet2 = $$('#firms').offset().top;
                if (pet2 > 1200) { pet2 = 1200; }
                $$('#firms').scrollTop((pet2 + pet - 233), 200);
                myVue.accordFirma = index;
                setTimeout(function () {
                    self.$f7.accordion.open(str2);
                    self.$f7.accordion.close(str2);
                    self.$f7.accordion.open(str2);
                    $$(str2).addClass('S_lineFirmOpen');
                    setRed(id);
                }, 150);
                //записываем данные в хистори, если нажимал пользователь, игнорируем если вызов был из хистори
                if (!state) {
                    if (myVue.accordSub !== -1) {
                        let indexAll = SubIndex[myVue.accordDiv][myVue.accordSub];
                        window.history.pushState({
                            id: Sub[indexAll].id, index: accordSub, pod: 'firma', stack: stackIndex,
                            parent: Sub[indexAll].parent, firmaId: id, firmaIndex: index, name: name
                        }, '/Firma?id=' + id + '&index=' + index); stackIndex++;
                    } else {
                        window.history.pushState({
                            id: -1, index: -1, pod: 'Div', stack: stackIndex,
                            parent: -1, firmaId: id, firmaIndex: index, name: name
                        }, '/Div?id=' + id + '&index=' + index); stackIndex++;
                    }
                }
            }
        },
        //Нажатие на кнопку показать карточку предприятия
        OpenCard: function (id) {
            myVue.actionOpen = false;
            for (let k = 0; k < Firms.length; k++) {
                if (Firms[k].id === id) {
                    myVue.FirIndex = k;
                    FirIndex = k;
                    break;
                }
            }
        },

        //обработка меню
        vspOpen: function (id, index, name) {
            if (userSpr === 0) {
                myVue.toastShow('Функция доступна только для зарегистрированных пользователей'); return;
            }
        }
        //end vue  
    }
});


