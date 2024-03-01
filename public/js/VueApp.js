'use strict';

var Sub = [], Div = [], Vids = [], Firms = [], firmsSub = [], firmsArr = [],
    vidsArr = [], VidsAll = [], divArr, subArr, firma = {}, mainBan = [],
    StatFirma = { Prior: 0, Red: 0, Black: 0, Act: 0, Ban: 0, Info: 0, Stat: 0, print: 0 },
    FillFirma = { action: '', info: '', stat: '', photo: '', baner: '' };
var MapFirms = { address: [''], name: ['Я тут'], id: [0], index: [0], coordinates: [null, null], color: ['islands#greenIcon'] };//Массив для карты
var SearchFirms = []; // фирмы найденные в поисковике
var sait = false; //если фальш, то админка
var firmSubs = []; // массив подразделов фирмы
var accord = 0;//какая рубрика открыта, 0 - никакая, появляются банера
var accordFirma = 0;//какая фирма открыта, 0 - никакая
var starClick = false; //нажимали ли в течении полусекунды на звезду
var SubDivTemp = {}, SubDivTemp2 = {}; //временная переменная, для редактирования рубрик и подрубрик
var DateExcel = ''; //время последней выгрузки ексел файла
var selFiltr = '0'; //выбор фильтрации фирм для 4 колонки
var ActAlfa = true, ActAlfa2 = true; //переменная указывает какой порядок сортировки фирм по актуальности или алфавиту, 3 и 4 столбец
var curDiv = {}, curSub = {}; //временные переменные для хранения текущего рубрику и рубрики
// переменная для указания, включен ли режим для перемещения полосок
var sortable = 'Измененить позиции', sortableSub = 'Измененить позиции', sortableBan = 'Измененить позиции';
//Текущие выделенные полоски
var curIdSub, curIdDiv = 220, indexDiv, indexSub, curIdFirm, indexFirm, subVis = false, divVis = false;
//Текущие выделенные полоски в редактировании фирмы
var curIdSubFirm, curIdDivFirm = 220, indexDivFirm;
//текущий приоритет выбранного рубрики  фирмы в редактировании фирмы 
//1 = красный, 2 = красный, 3 = черный, 4 - просто красный, 5 - просто черный, subFirmaId - текущий id подрубрику
var subFirma, subFirmaId;
//Массив хранящая в себе адрес вместе с данными, ладитудой, лонгтитудой и так далее
var multAdr = [{ adres: '', long: '', latid: '', city: '', tel1: '', dop1: '', tel2: '', dop2: '', tel3: '', dop3: '' }];
//Добавление или редактирование рубрик, подрубрик по id
var editDiv = -1, editSub = -1, titulDiv = '', titulSub = '', titulFirma = '', curVid = '',
    visDiv = false, visSub = false, visFirm = false, dblClick = false, beginDiv = {}, beginSub = {};
var $$ = Dom7;
Framework7.use(Framework7Vue);

// Init Vue App
var myVue = new Vue({
    // App Root Element
    el: '#app',

    // App root data 
    data() {
        return {
            Sub, Div, Firms, curIdDiv, Vids, curIdSub, curIdFirm, indexDiv, indexSub, indexFirm, titulFirma,
            titulDiv, sortable, sortableSub, titulSub, firmsArr, firma, subVis, divVis, firmsSub, subFirma,
            subFirmaId, curIdSubFirm, curIdDivFirm, indexDivFirm, dblClick, curVid, VidsAll, StatFirma,
            multAdr, mainBan, DateExcel, selFiltr, ActAlfa, ActAlfa2, SubDivTemp, SubDivTemp2, sortableBan,
            FillFirma, accord, firmSubs, sait, accordFirma, starClick, SearchFirms, curDiv, curSub,
            f7params: {
                // Array with app routes
                routes: [],
                // App Name
                name: 'My App',
                // App id
                id: 'com.myapp.test'
                // ...
            }
        };
    },


    // App root methods
    methods: {
        // индикатор загрузки
        PageInit: function () {

        },
        //добавление или удаление вида деятельности
        addVid: function () {
            let self = this;
            let text = 'Вид деятельности сохранён';
            if ($$('#btnNewVid').text() === 'Добавить') {
                let ter = {};
                for (let key in VidsAll[10]) {
                    ter[key] = VidsAll[10][key];
                  }
                ter.id=Vids.length-1;
                ter.name=myVue.curVid;
                ter.display = '1';
                ter.pos = Vids.length-1;
                ter.last_edit=new Date();
                for (let key in ter) {
                    VidsAll[VidsAll.length-1][key] = ter[key];
                    Vids[Vids.length-1][key] = ter[key];
                  }
                Framework7.request.promise.postJSON('/admin/up', { token: token, table: vidsTab, rec: JSON.stringify(ter) })
                    .then(function (data2) {
                        console.log(data2);
                        let data = JSON.parse(data2.data);
                        console.log(data);
                      }).catch(function (err) {
                        console.log('Ошибка запроса вставки в таблицу ' + vidsTab + '  ' + err.message);
                    });
                ter.id=Vids.length;
                ter.name='';
                ter.display = '1';
                ter.pos = Vids.length;
                ter.last_edit=new Date();
                Framework7.request.promise.postJSON(urlIns, { token: token, table: vidsTab, rec: JSON.stringify(ter) })
                    .then(function (data2) {
                        console.log(data2);
                        let data = JSON.parse(data2.data);
                        console.log(data);
                      }).catch(function (err) {
                        console.log('Ошибка запроса вставки в таблицу ' + vidsTab + '  ' + err.message);
                    });
              } 
            // else {
            //     text = 'Вид деятельности удалён';
            //     $$('#btnNewVid').text('Добавить');
            //     Framework7.request.promise.postJSON(urlDel, { token: token, table: vidsTab, id: firma.vid })
            //         .then(function (data) {
            //             for (let k = 0; k < VidsAll.length; k++) {
            //                 if (VidsAll[k].id + '' === firma.vid) {
            //                     VidsAll.splice(k, 1);
            //                     break;
            //                 }
            //             }
            //         }).catch(function (err) {
            //             console.log('Ошибка запроса удаления поля из таблицы ' + vidsTab + '  ' + err.message);
            //         });
            // }
            setTimeout(function () {
                myVue.curVid = '';
            }, 100);

            let toast = self.$f7.toast.create({
                text: text,
                position: 'center',
                closeTimeout: 2000
            });
            toast.open();

        },
        //Конвертирование вида 
        convertToVids:  function () {
            let vidRec =[];
            console.log('vid aaaaaaaa === ');
            let ret = Array.from({ length: 119 }, (v, i) =>  i); 
            ret = ret.reverse();
            for(let k=0; k<119; k++) {
                let ter = {};
            let st=-1;
                
                    for(let i=0; i<VidsAll.length; i++) {

                   if(VidsAll[i].id === k) {
                   st = i;
                    break;     
                    } else { st=-1; }
                }
                
                  if(st !== -1) {
                 let curVid = VidsAll[st]; 
                 for (let key in VidsAll[st]) {
                    ter[key] = VidsAll[st][key];
                  }
                   vidRec.push(ter); 
                    }
                    else {
                        for (let key in VidsAll[10]) {
                            ter[key] = VidsAll[10][key];
                          }
                        ter.id=k;
                        ter.name='';
                        vidRec.push(ter); 
                 }
            };
                
                console.log(vidRec);
               Framework7.request.promise.postJSON('/admin/delAll', {token: token, table: 'spravkavids'})
               .then(function (data2) {
                console.log(data2);
                let data = data2.data;
               console.log(data);
               Framework7.request.promise.postJSON(urlinsall, { token: token, table: 'spravkavids', rec: JSON.stringify(vidRec) })
                                .then(function (data2) {
                        let data = data2.data;
                    console.log('urlupall = ');
                    console.log(data);
                  });
               });
    
                       
            // let toast = self.$f7.toast.create({
            //     text: 'Конвертирование прошло успешно',
            //     position: 'center',
            //     closeTimeout: 2000
            // });
            // toast.open();
        },
        //Нажатие на рубрику в редактировании фирмы
        setDivFirma: function (id, index) {
            let per;
            for (let i = 0; i < subArr.length; i++) {
                if (id === subArr[i].parent) {
                    per = subArr[i].id;
                    break;
                }
            }
            myVue.curIdDivFirm = id; myVue.curIdSubFirm = per; myVue.indexDivFirm = index;
            curDiv = Div[index];
        },
        //Нажатие на подрубрику
        setSub: function (id, index) {
            SearchFirms.length = 0;
            myVue.curIdSub = id; myVue.indexSub = index;
            curSub = Sub[index];
            myVue.ActAlfa = true;
            SubFirms(id);
        },
        //Нажатие на рубрику
        setDiv: function (id, index) {
            SearchFirms.length = 0;
            let self = this;
            let per, ind;
            let str = $$("#div").children()[0];
            let str2 = $$(str).children()[myVue.indexDiv];
            $$(str2).removeClass('lineFill');
            str2 = $$(str).children()[index];
            $$(str2).addClass('lineFill');
            if (myVue.accord === id) {
                $$(str2).removeClass('lineFill');
                myVue.curIdSub = -1;
                myVue.indexSub = -1;
                myVue.accord = 0;
            } else {
                self.$f7.accordion.open(str2);
                myVue.accord = id;
                if (sait) {
                    myVue.indexSub = -1;
                    myVue.curIdSub = -1;
                } else {
                    for (let i = 0; i < subArr.length; i++) {
                        if (id === subArr[i].parent) {
                            per = subArr[i].id;
                            ind = i;
                            break;
                        }
                    }
                    myVue.indexSub = ind;
                    myVue.curIdSub = per;
                    SubFirms(per);
                }
            }
            myVue.curIdDiv = id;
            myVue.indexDiv = index;
            curDiv = Div[index];
        },

        //Добавление фирмы
        addFirma: function () {
                        myVue.titulFirma = 'Добавление фирмы';
            $$('#delFirma').hide();
            for (var key in Firms[0]) { firma[key] = ''; }
            firma.action = JSON.stringify({ fill: '', show: '', begin: new Date(), end: new Date() });
            firma.actual_date = (new Date()).toISOString();
            firma.last_edit = (new Date()).toISOString();
            $$('#baner').html('');
            $$('#banerMain').html('');
            $$('#out').html('');
            $$('#outMain').html('');
            myVue.multAdr.length = 1;
            FillFirma.action = { fill: '', show: '', begin: new Date(), end: new Date() };
            firma.action = JSON.stringify(FillFirma.action);
            FillFirma.stat = { fill: '', show: '', begin: new Date(), end: new Date() };
            firma.stat = JSON.stringify(FillFirma.stat);
            FillFirma.info = { fill: '', show: '', begin: new Date(), end: new Date() };
            firma.info = JSON.stringify(FillFirma.info);
            FillFirma.photo = { dir: '', show: '', begin: new Date(), end: new Date() };
            firma.photo = JSON.stringify(FillFirma.photo);
            FillFirma.baner = { baner: '', show: '', begin: new Date(), end: new Date(), main: false, pos: -1, banerMain: '' };
            firma.baner = JSON.stringify(FillFirma.baner);
            myVue.multAdr[0].adres = ''; myVue.multAdr[0].long = null; myVue.multAdr[0].latid = null;
            myVue.multAdr[0].city = 'Томск'; myVue.multAdr[0].tel1 = ''; myVue.multAdr[0].dop1 = '';
            myVue.multAdr[0].tel2 = ''; myVue.multAdr[0].dop2 = ''; myVue.multAdr[0].tel3 = '';
            myVue.multAdr[0].dop3 = ''; myVue.multAdr[0].what1 = false; myVue.multAdr[0].what2 = false; myVue.multAdr[0].what3 = false;
            myVue.firma.display = '1'; myVue.firma.name = '';
            myVue.firma.vid = 0;
            SetStatFirma();
            initCoord();
            this.createPopupFirma('.firma-popup');
        },
        //Нажатие на редактирование в меню списка фирм
        editFirma: function (id, index) {
            myVue.curIdFirm = id;
            getFirma(myVue.curIdFirm);
            myVue.titulFirma = 'Редактирование фирмы';
            $$('#delFirma').show();
            FillFirma.action = JSON.parse(myVue.firma.action);
            FillFirma.stat = JSON.parse(myVue.firma.stat);
            FillFirma.info = JSON.parse(myVue.firma.info);
            FillFirma.baner = JSON.parse(myVue.firma.baner);
            setTimeout(() => {
                if (FillFirma.baner.baner !== '') {
                $$('#baner').html(FillFirma.baner.baner);
                $$('#out').html(FillFirma.baner.baner);
                } else {
                $$('#baner').html('');
                 $$('#out').html('');
                }
                if (FillFirma.baner.banerMain === '') {
                    $$('#banerMain').html('');
                $$('#outMain').html('');
            }else {
                $$('#banerMain').html(FillFirma.baner.banerMain);
                 $$('#outMain').html(FillFirma.baner.banerMain);
                }
                $$('#file').val('');
                $$('#fileMain').val('');
            }, 100);
            FillFirma.photo = JSON.parse(myVue.firma.photo);
            myVue.multAdr = JSON.parse(myVue.firma.address);
            SetStatFirma();
            $$('.dateFirma').text(formatDate(myVue.firma.actual_date));
            initCoord();
            dblClick = false;
            this.createPopupFirma('.firma-popup');
        },
        //Нажатие на удаление в меню списка фирм
        deleteFirma: function () {
            var self = this;
            this.$f7.dialog.confirm('Удалить фирму ' + myVue.firma.name + '?', 'Внимание!', function () {
                Framework7.request.promise.postJSON(urlDel, { token: token, table: firmsTab, id: myVue.firma.id })
                    .then(function (data) {
                        let ind;
                        for (let k = 0; k < firmsArr.length; k++) {
                            if (firmsArr[k].id === myVue.curIdFirm) {
                                ind = k; break;
                            }
                        }
                        firmsArr.splice(ind, 1);
                        for (let k = 0; k < Firms.length; k++) {
                            if (Firms[k].id === myVue.curIdFirm) {
                                ind = k; break;
                            }
                        }
                        Firms.splice(ind, 1);
                        SubFirms(myVue.curIdSub);
                        self.popupFirma.close(false);
                    });
                    // .then(function (err) {
                    //     console.log('Ошибка запроса удаления ' + err);
                    // });
            });
        },

        //Сортировка по алфавиту или актуальности в рубрике фирм из подрубрик
        sortAct: function (stat) {
            const self = this;
            self.$f7.preloader.show();
            if (stat) {
                myVue.ActAlfa = !myVue.ActAlfa;
                if (myVue.ActAlfa) {
                    SubFirms(myVue.curIdSub, false);
                } else {
                    SubFirms(myVue.curIdSub, true);
                }
            } else {
                if (myVue.ActAlfa2) {
                    sortArr(myVue.Firms, 'date');
                } else {
                    sortArr(myVue.Firms, 'name');
                }
                myVue.ActAlfa2 = !myVue.ActAlfa2;
            }
            self.$f7.preloader.hide();
        },

        //Нажатие на сохранение в редакторе фирмы
        saveFirma: function (btn) {
            var self = this;
            let ret = (new Date()).toISOString();
            let str = {};
            myVue.firma.last_edit = ret.slice(0, 10);
            let text = '';
            if (myVue.firma.name === '') {
                text = 'Не введено название фирмы';
            }
            if (myVue.multAdr[0].tel1 === '') {
                text = 'Не введен первый телефон';
            }
            if (myVue.firma.red === '' && myVue.firma.prioritet === '' && myVue.firma.black === '') {
                text = 'Не выбран ни одна подрубрика';
            }
            if (text !== '') {
                var toast = self.$f7.toast.create({
                    text: text,
                    position: 'center',
                    closeTimeout: 2000
                });
                toast.open();
            } else {
                if (myVue.titulFirma === 'Добавление фирмы') {
                    text = '';
                    for (let k = 0; k < firmsArr.length; k++) {
                        if (firmsArr[k].name === myVue.firma.name) {
                            text = 'Такое название фирмы уже есть'; break;
                        }
                    }
                    if (text !== '') {
                        toast = self.$f7.toast.create({
                            text: text,
                            position: 'center',
                            closeTimeout: 2000
                        });
                        toast.open();
                    } else {
                        myVue.firma.address = JSON.stringify(myVue.multAdr);
                        myVue.firma.id = null;
                        myVue.firma.plat = '0';
                        firma = saveFirma;
                        myVue.firma.stat = JSON.stringify(FillFirma.stat);
                    myVue.firma.action = JSON.stringify(FillFirma.action);
                    myVue.firma.info = JSON.stringify(FillFirma.info);
                    myVue.firma.baner = JSON.stringify(FillFirma.baner);
                    myVue.firma.address = JSON.stringify(myVue.multAdr);
                    firma.vid=myVue.firma.vid;
                    Framework7.request.promise.postJSON(urlIns, { token: token, table: firmsTab, rec: JSON.stringify(myVue.firma) })
                            .then(function (data) {
                                if(data.data.message === 'Success') {
                                    console.log(JSON.parse(data.data.rec)[0]);
                                myVue.firma.id = JSON.parse(data.data.rec)[0].id;
                                firma.id = myVue.firma.id;
                                let tr = {}; for (let key in myVue.firma) tr[key] = myVue.firma[key];
                                firmsArr.push(tr);
                                sortArr(firmsArr, 'name');
                                Firms.length = 0;
                                setTimeout(function () {
                                    for (let i = 0; i < firmsArr.length; i++) {
                                        Firms.push(firmsArr[i]);
                                    }
                                    setMainBan();
                                    myVue.titulFirma = 'Редактирование фирмы';
                                    SubFirms(myVue.curIdSub);
                                }, 5);
                                if (btn === 'back') {
                                    self.popupFirma.close(false);
                                }
                                SubFirms(myVue.curIdSub);
                                var toast = self.$f7.toast.create({
                                    text: 'Новая фирма записана в базу данных',
                                    position: 'center',
                                    closeTimeout: 4000
                                });
                                toast.open();
                                window.location.reload();
                            } else {
                                var toast = self.$f7.toast.create({
                                    text: 'Не удалось записать фирму в базу данных, попробуйте позже',
                                    position: 'center',
                                    closeTimeout: 5000
                                });
                                toast.open();
                            }
                            })
                            .catch(function (err) {
                                console.log('Ошибка запроса вставки ' + err);
                            });
                    }
                    // изменение фирмы
                } else {
                    console.log('iiiiieeeeeeeeeeeeeee = ');
                    myVue.firma.stat = JSON.stringify(FillFirma.stat);
                    myVue.firma.action = JSON.stringify(FillFirma.action);
                    myVue.firma.info = JSON.stringify(FillFirma.info);
                    myVue.firma.baner = JSON.stringify(FillFirma.baner);
                    myVue.firma.address = JSON.stringify(myVue.multAdr);
                    Framework7.request.promise.postJSON(urlUp, { token: token, table: firmsTab, rec: JSON.stringify(myVue.firma) })
                        .then(function (data) {
                            console.log(data);
                            if(data.data.message === 'Success') {
                             let ind;
                            for (let k = 0; k < firmsArr.length; k++) {
                                if (firmsArr[k].id === myVue.curIdFirm) {
                                    ind = k; break;
                                }
                            }
                            firmsArr.splice(ind, 1);
                            let tr = {}; for (let key in myVue.firma) tr[key] = myVue.firma[key];
                            setTimeout(function () {
                                firmsArr.push(tr);
                                sortArr(firmsArr, 'name');
                                Firms.length = 0;
                                for (let i = 0; i < firmsArr.length; i++) {
                                    Firms.push(firmsArr[i]);
                                }
                                SubFirms(myVue.curIdSub);
                            }, 5);
                            if (btn === 'back') {
                                self.popupFirma.close(false);
                            }
                            SubFirms(myVue.curIdSub);
                            var toast = self.$f7.toast.create({
                                text: 'Фирма изменена в базе данных',
                                position: 'center',
                                closeTimeout: 4000
                            });
                            toast.open();
                            window.location.reload();
                        } else {
                            var toast = self.$f7.toast.create({
                                text: 'Не удалось записать фирму в базу данных, попробуйте позже',
                                position: 'center',
                                closeTimeout: 5000
                            });
                            toast.open();
                        }
                        }).catch(function (err) {
                            console.log('Ошибка запроса вставки ' + err);
                            console.log(err);
                        });
                }
            }

        },
        // нажатие на кнопку изменение позиции рубрик
        SortDiv: function () {
            var self = this;
            if (myVue.sortableSub === 'Закончить изменения') {
                var toast = self.$f7.toast.create({
                    text: 'Закончите изменения позиций подрубрик',
                    position: 'center',
                    closeTimeout: 2000
                });
                toast.open();
            } else {
                if (myVue.sortable === 'Измененить позиции') {
                    myVue.sortable = 'Закончить изменения';
                } else {
                    myVue.sortable = 'Измененить позиции';
                    Framework7.request.promise.postJSON(urlupall, { token: token, table: divTab, div: JSON.stringify(Div) })
                        .then(function (data) {
                            var toast = self.$f7.toast.create({
                                text: 'Изменения позиций сохранились',
                                position: 'center',
                                closeTimeout: 2000
                            });
                            toast.open();
                        }).catch(function (err) {
                            console.log('Ошибка запроса вставки ' + err);
                        });
                }
            }
        },
        // нажатие на кнопку изменение позиции подрубрик
        SortSub: function () {
            var self = this;
            if (myVue.sortable === 'Закончить изменения') {
                var toast2 = self.$f7.toast.create({
                    text: 'Закончите изменения позиций рубрик',
                    position: 'center',
                    closeTimeout: 2000
                });
                toast2.open();
            } else {
                if (myVue.sortableSub === 'Измененить позиции') {
                    myVue.sortableSub = 'Закончить изменения';
                } else {
                    myVue.sortableSub = 'Измененить позиции';
                    Framework7.request.promise.postJSON(urlupall, { token: token, table: subTab, div: JSON.stringify(Sub) })
                        .then(function (data) {
                            var toast = self.$f7.toast.create({
                                text: 'Изменения позиций сохранились',
                                position: 'center',
                                closeTimeout: 2000
                            });
                            toast.open();
                        }).catch(function (err) {
                            console.log('Ошибка запроса вставки ' + err);
                        });
                }
            }
        },
        //Перемещаем банеры
        onSortBan(e) {
            let from = e.from; let to = e.to;
            myVue.mainBan = moveArray(myVue.mainBan, from, to);
        },
        // нажатие на кнопку изменение позиции банеров
        SortBan: function () {
            if (myVue.sortableBan === 'Измененить позиции') {
                myVue.sortableBan = 'Закончить изменения';
            } else {
                myVue.sortableBan = 'Измененить позиции';
                let ret = 0;
                let cloneArray = JSON.parse(JSON.stringify(myVue.mainBan));
                for (let k = 0; k < cloneArray.length; k++) {
                    cloneArray[k].pos = ret;
                    ret++;
                }
                myVue.mainBan.length = 0;
                setTimeout(function () {
                    for (let k = 0; k < cloneArray.length; k++) {
                        myVue.mainBan.push(cloneArray[k]);
                    }
                }, 10);
            }
        },
        //Работа с банерами, сортировка и так далее 
        BanerSort: function () {
            setMainBan();
            this.createPopupBaner('.baner-popup');
        },
        //Сохранение позиций банеров
        saveBun: function () {
            var self = this;
            if (myVue.sortableBan === 'Закончить изменения') {
                var toast = self.$f7.toast.create({
                    text: 'Сначала сохрание позиции, нажав на "Закончить изменения"',
                    position: 'center',
                    closeTimeout: 2000
                });
                toast.open();
            } else {
                for (let i = 0; i < myVue.mainBan.length; i++) {
                    for (let k = 0; k < Firms.length; k++) {
                        if (Firms[k].id === myVue.mainBan[i].id) {
                            let st = JSON.parse(Firms[k].baner);
                            st.pos = myVue.mainBan[i].pos;
                            let ban = { baner: st.baner, banerMain: st.banerMain, pos: st.pos, show: st.show, begin: st.begin, end: st.end, main: st.main };
                            Firms[k].baner = JSON.stringify(ban);
                            break;
                        }
                    }
                }
                Framework7.request.promise.postJSON(urlupall, { token: token, table: firmsTab, div: JSON.stringify(Firms) })
                    .then(function (data2) {
                        let data = data2.data;
                        
                            //Собщение о сохранение позиций
                            var toast = self.$f7.toast.create({
                                text: 'Изменения позиций сохранились',
                                position: 'center',
                                closeTimeout: 2000
                            });
                            self.PopupBaner.close(false);
                            toast.open();
                        
                        return;
                    });
                    // .catch(function (err) {
                    //     console.log('Ошибка запроса вставки ' + err.message);
                    // });
            }
        },
        //Убрать банер из списка банеров
        delBan: function (i) {
            this.$f7.dialog.confirm('Удалить банер из списка?', 'Внимание!', function () {
                myVue.mainBan[i].pos = -1;
                myVue.mainBan[i].main = false;
                myVue.mainBan[i].banerMain='';
                for (let k = 0; k < Firms.length; k++) {
                    if (Firms[k].id === myVue.mainBan[i].id) {
                        let pt = JSON.parse(Firms[k].baner);
                        let ban = { baner: pt.baner, banerMain: pt.banerMain, pos: -1, show: pt.show, begin: pt.begin, end: pt.end, main: false };
                        Firms[k].baner = JSON.stringify(ban);
                        break;
                    }
                }
                let ret = 0;
                let st = JSON.parse(JSON.stringify(myVue.mainBan));
                myVue.mainBan.length = 0;
                for (let k = 0; k < st.length; k++) {
                    if (st[k].main) {
                        myVue.mainBan.push(st[k]);
                        myVue.mainBan[ret].pos = ret;
                        ret++;
                    }
                }
            });
        },
        //Нажатие на кнопку Добавление рубрики StatDiv 
        addDiv: function () {
            editDiv = -1; setDivNew(-1);
            myVue.titulDiv = 'Добавление рубрики';
            this.createPopupDiv('.Div-popup');
        },
        //Нажатие на кнопку Добавление подрубрики 
        addSub: function () {
            editSub = -1; setSubNew(-1);
            myVue.titulSub = 'Добавление подрубрики';
            this.createPopupSub('.Sub-popup');
        },
        //Нажатие на кнопку сохранить рубрики
        saveDiv: function () {
            var self = this;
            if (myVue.curDiv.name === '') {
                $$('#infoDiv').text('Не введено название');
                $$('#nameDiv').focus();
                setTimeout(function () {
                    $$('#infoDiv').text('');
                }, 2500);
            } else {
                // добавление рубрики
                if (editDiv === -1) {
                    Framework7.request.promise.postJSON(urlIns, { token: token, table: divTab, rec: JSON.stringify(myVue.curDiv) })
                        .then(function (data2) {
                            if(data.data.message === 'Success') {
                                                            lastPosDiv = lastPosDiv - 1;
                                curDiv = JSON.parse(data.rec)[0];
                                myVue.curDiv = JSON.parse(data.rec)[0];
                                myVue.Div.push(curDiv);
                                self.popupDiv.close(false);
                            } else {
                                alert('Ошибка запроса');
                            }
                            return;
                        }).catch(function (err) {
                            console.log('Ошибка запроса вставки ' + err);
                        });
                    // изменение рубрики
                } else {
                    Framework7.request.promise.postJSON(urlUp, { token: token, table: divTab, rec: JSON.stringify(myVue.curDiv) })
                        .then(function (data2) {
                            let data = data2.data;
                            if (data.message === 'Success') {
                                myVue.Div[indexDiv] = myVue.curDiv;
                                myVue.Div.splice();
                                self.popupDiv.close(false);
                            } else {
                                alert('Ошибка запроса');
                            }
                            return;
                        }).catch(function (err) {
                            console.log('Ошибка запроса изменения ' + err);
                        });
                }
            }
        },
        //Нажатие на кнопку сохранить подрубрику
        saveSub: function () {
            var self = this;
            if (myVue.curSub.name === '') {
                $$('#infoSub').text('Не введено название');
                setTimeout(function () {
                    $$('#infoSub').text('');
                }, 2500);
            } else {
                // добавление подрубрики
                if (editSub === -1) {
                    Framework7.request.promise.postJSON(urlIns, { token: token, table: subTab, rec: JSON.stringify(myVue.curSub) })
                        .then(function (data2) {
                            let data = data2.data;
                            if (data.message === 'Success') {
                                lastPosSub = lastPosSub + 1;
                                curSub = JSON.parse(data.rec)[0];
                                myVue.curSub = JSON.parse(data.rec)[0];
                                myVue.Sub.push(curSub);
                                self.popupSub.close(false);
                            } else {
                                alert('Ошибка запроса');
                            }
                            return;
                        }).catch(function (err) {
                            console.log('Ошибка запроса изменения ' + err);
                        });

                    // изменение подрубрики
                } else {
                    Framework7.request.promise.postJSON(urlUp, { token: token, table: subTab, rec: JSON.stringify(myVue.curSub) })
                        .then(function (data2) {
                            let data = data2.data;
                            if (data.message === 'Success') {
                                myVue.Sub[indexSub] = myVue.curSub;
                                myVue.Sub.splice();
                                self.popupSub.close(false);
                            } else {
                                alert('Ошибка запроса');
                            }
                            return;
                        }).catch(function (err) {
                            console.log('Ошибка запроса изменения ' + err.message);
                        });
                }
            }
        },

        //Отмена изменения рубрику
        closeDiv: function () {
            for (let key in SubDivTemp) {
                myVue.Div[indexDiv][key] = SubDivTemp[key];
            }
        },
        //Отмена изменения подрубрики
        closeSub: function () {
            for (let key in SubDivTemp2) {
                myVue.Sub[indexSub][key] = SubDivTemp2[key];
            }
        },
        //удаление рубрику
        delDiv: function (index, id) {
            this.$f7.dialog.confirm('Удалить рубрику?', 'Внимание!', function () {
                Framework7.request.promise.postJSON(urlDel, { token: token, table: divTab, id: id })
                    .then(function (data2) {
                        let data = data2.data;
                        if (data.message === 'Success') {
                            myVue.Div.splice(index, 1);
                        } else {
                            alert('Ошибка запроса');
                        }
                    }).catch(function (err) {
                        console.log('Ошибка запроса вставки ' + err.message);
                    });
            });
        },
        //удаление подрубрики
        delSub: function (index, id) {
            this.$f7.dialog.confirm('Удалить подрубрику?', 'Внимание!', function () {
                Framework7.request.promise.postJSON(urlDel, { token: token, table: subTab, id: id })
                    .then(function (data2) {
                        let data = data2.data;
                        if (data.message === 'Success') {
                            myVue.Sub.splice(index, 1);
                        } else {
                            alert('Ошибка запроса');
                        }
                    }).catch(function (err) {
                        console.log('Ошибка запроса вставки ' + err);
                    });
            });
        },
        //Редактирование рубрику
        editDiv: function (index, id) {
            editDiv = id;
            indexDiv = index;
            setDivNew(index);
            myVue.titulDiv = 'Редактирование рубрику';
            setTimeout(() => { this.createPopupDiv('.Div-popup'); }, 50);

        },
        //Редактирование подрубрики
        editSub: function (index, id) {
            editSub = id;
            indexSub = index;
            setSubNew(indexSub);
            this.createPopupSub('.Sub-popup');
            myVue.titulSub = 'Редактирование рубрики';
        },
        //Перемещаем рубрики
        onSortDiv(e) {
            var fromDiv = e.from; var toDiv = e.to;
            var per = Div[fromDiv].pos;
            Div[fromDiv].pos = Div[toDiv].pos;
            if (fromDiv < toDiv) {
                for (let k = toDiv - 1; k > fromDiv; k--) {
                    Div[k + 1].pos = Div[k].pos;
                }
                Div[fromDiv + 1].pos = per;
            } else {
                for (let k = toDiv; k < fromDiv - 1; k++) {
                    Div[k].pos = Div[k + 1].pos;
                }
                Div[fromDiv - 1].pos = per;
            }
            var st = [];
            for (let k = 0; k < Div.length; k++) {
                st[k] = Div[k];
            }
            st = sortArr(st, 'pos', 0);
            myVue.Div.splice(0);
            for (let k = 0; k < st.length; k++) {
                myVue.Div.push(st[k]);
            }
        },
        //Перемещаем подрубрики
        onSortSub(e) {
            var fromDiv = e.from; var toDiv = e.to;
            var terSub = [];
           for (let k = 0; k < Sub.length; k++) {
                if (Sub[k].parent === curDiv.id) {
                    terSub.push(Sub[k]);
                }
            }
           var per = terSub[fromDiv].pos;
            terSub[fromDiv].pos = terSub[toDiv].pos;
            if (fromDiv < toDiv) {
                for (let k = toDiv - 1; k > fromDiv; k--) {
                    terSub[k + 1].pos = terSub[k].pos;
                }
                terSub[fromDiv + 1].pos = per;
            } else {
                for (let k = toDiv; k < fromDiv - 1; k++) {
                    terSub[k].pos = terSub[k + 1].pos;
                }
                terSub[fromDiv - 1].pos = per;
            }
            var st = [];
            for (let k = 0; k < terSub.length; k++) {
                st[k] = terSub[k];
            }
            st = sortArr(st, 'pos', 1);
            let z = 0;
            for (let k = 0; k < Sub.length; k++) {
                if (Sub[k].parent === curDiv.id) {
                    myVue.Sub.splice(k, 1, st[z]);
                    z++;
                }
            }
        },
        //показать рубрику
        disDiv: function (index, id) {
            editDiv = id;
            indexDiv = index;
            setDivNew(index);
            if (curDiv.display === '1') {
                curDiv.display = '0';
            } else {
                curDiv.display = '1';
            }
            myVue.Div.splice(index, 1, curDiv);
            UpRec(divTab, curDiv);
        },
        //показать подрубрику
        disSub: function (index, id) {
            editSub = id;
            indexSub = index;
            setSubNew(index);
            if (curSub.display === '1') {
                curSub.display = '0';
            } else {
                curSub.display = '1';
            }
            myVue.Sub.splice(index, 1, curSub);
            UpRec(subTab, curSub);
        },

        //убрать видимость display рубрик
        DivVis: function () {
            if (this.divVis) {
                this.divVis = false;
            } else {
                this.divVis = true;
            }
        },
        //убрать видимость display подрубрик
        SubVis: function () {
            if (this.subVis) {
                this.subVis = false;
            } else {
                this.subVis = true;
            }
        },

        //Раскрасить рубрики
        redDiv: function (index, id) {
            editDiv = id;
            indexDiv = index;
            setDivNew(index);
            if (curDiv.red === '1') {
                curDiv.red = '0';
            } else {
                curDiv.red = '1';
            }
            myVue.Div.splice(index, 1, curDiv);
            UpRec(divTab, curDiv);
        },
        //Раскрасить подрубрику
        redSub: function (index, id) {
            editSub = id;
            indexSub = index;
            setSubNew(index);
            if (curSub.red === '1') {
                curSub.red = '0';
            } else {
                curSub.red = '1';
            }
            myVue.Sub.splice(index, 1, curSub);
            UpRec(subTab, curSub);
        },

        clickBase: function () {
            this.$f7.request.get("http://autogie1.bget.ru/onloadSpravka.php?id=KeyArray", function (all) {
                begin(all);
            }), function (err) {
                alert('Ошибка связи = ' + err);
                console.log(err);
            };
        },
        //обновление файла ексел
        clickExcel: function (sost) {
            var self = this;
            Framework7.request.promise.postJSON('/admin/excel', { token: token })
                .then(function (data2) {
                    let data = data2.data;
                    if (data.message === 'Success') {
                        var ret = new Date();
                        myVue.DateExcel = '';
                        if (ret.getDate() < 10) { myVue.DateExcel = '0'; }
                        myVue.DateExcel = myVue.DateExcel + ret.getDate() + '.';
                        if (ret.getMonth() + 1 < 10) { myVue.DateExcel = myVue.DateExcel + '0'; }
                        myVue.DateExcel = myVue.DateExcel + (ret.getMonth() + 1) + '.' + ret.getFullYear();
                        var toast = self.$f7.toast.create({
                            text: 'Excel файл обновлен',
                            position: 'center',
                            closeTimeout: 2500
                        }); toast.open();
                    } else {
                        alert('Ошибка запроса');
                    }
                }).catch(function (err) {
                    console.log('Ошибка запроса вставки ' + err.message);
                });
        },
        //клик по чекбоксу при выборе в печать
        setcheck: function (id, parent) {
            setTimeout(function () {
                if (myVue.firma.print === null || myVue.firma.print === '' || myVue.firma.print === undefined) { myVue.firma.print = ','; }
                if (myVue.firma.print.indexOf(',' + id + ',') !== -1) {
                    myVue.firma.print = myVue.firma.print.replace(',' + id, '');
                }
                else { myVue.firma.print = myVue.firma.print + id + ','; }
                SetStatFirma();
            }, 10);
        },
        //выставляем id рубрики при нажатие на него в редактировании фирмы
        SetSubFirma: function (id, parent) {
            myVue.subFirma = 0;
            myVue.subFirmaId = id;
            if (myVue.firma.prioritet_show.indexOf(',' + id + ',') !== -1 && myVue.firma.prioritet === '46') myVue.subFirma = 1;
            if (myVue.firma.prioritet_show.indexOf(',' + id + ',') !== -1 && myVue.firma.prioritet === '47') myVue.subFirma = 2;
            if (myVue.firma.prioritet_show.indexOf(',' + id + ',') !== -1 && myVue.firma.prioritet === '48') myVue.subFirma = 3;
            if (myVue.firma.prioritet_show.indexOf(',' + id + ',') !== -1 && myVue.firma.prioritet === '49') myVue.subFirma = 4;
            if (myVue.firma.prioritet_show.indexOf(',' + id + ',') !== -1 && myVue.firma.prioritet === '50') myVue.subFirma = 5;
            if (parent !== 0) myVue.curIdDivFirm = parent;
            if (myVue.subFirma === 0) {
                if (myVue.firma.red !== undefined && myVue.firma.red.indexOf(',' + id + ',') !== -1) myVue.subFirma = 6;
            }
            if (myVue.firma.black !== undefined && myVue.firma.black.indexOf(',' + id + ',') !== -1) myVue.subFirma = 7;
        },
        //Меняем приоритет в зависимости от  id рубрики и выбранной кнопки up - 1,2,3,4,5, del true - удаляем предыдущее сосотояние
        up: function (up, id, del) {
            if (del) {
                switch (myVue.subFirma) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5: myVue.firma.prioritet_show = myVue.firma.prioritet_show.replace(',' + id, '');
                        myVue.firma.print = myVue.firma.print.replace(',' + id, '');
                        myVue.firma.red = myVue.firma.red.replace(',' + id, ''); break;
                    case 6: myVue.firma.red = myVue.firma.red.replace(',' + id, ''); break;
                    case 7: myVue.firma.black = myVue.firma.black.replace(',' + id, ''); break;
                }
                SetStatFirma();
            }
            if (myVue.firma.print === null || myVue.firma.print === '' || myVue.firma.print === undefined) { myVue.firma.print = ','; }
            if (myVue.firma.prioritet_show === '') { myVue.firma.prioritet_show = ','; }
            if (myVue.firma.red === '') { myVue.firma.red = ','; }
            if (myVue.firma.black === '') { myVue.firma.black = ','; }
            switch (up) {
                case 0:
                    if (myVue.firma.print.indexOf(',' + id) !== -1) {
                        myVue.firma.print = myVue.firma.print.replace(',' + id, '');
                    }; break;
                case 1: myVue.firma.prioritet_show = myVue.firma.prioritet_show + id + ',';
                    myVue.firma.print = myVue.firma.print + id + ',';
                    myVue.firma.prioritet = '50'; break;
                case 2: myVue.firma.prioritet_show = myVue.firma.prioritet_show + id + ',';
                    myVue.firma.print = myVue.firma.print + id + ',';
                    myVue.firma.prioritet = '49'; break;
                case 3: myVue.firma.prioritet_show = myVue.firma.prioritet_show + id + ',';
                    myVue.firma.print = myVue.firma.print + id + ',';
                    myVue.firma.prioritet = '48'; break;
                case 4: myVue.firma.prioritet_show = myVue.firma.prioritet_show + id + ',';
                    myVue.firma.print = myVue.firma.print + id + ',';
                    myVue.firma.prioritet = '47'; break;
                case 5: myVue.firma.prioritet_show = myVue.firma.prioritet_show + id + ',';
                    myVue.firma.print = myVue.firma.print + id + ',';
                    myVue.firma.prioritet = '46'; break;
                case 6: myVue.firma.red = myVue.firma.red + id + ','; myVue.firma.print = myVue.firma.print + id + ','; break;
                case 7: myVue.firma.black = myVue.firma.black + id + ','; break;
            }
            SetStatFirma();
        },
        //Любые изменения при редактировании фирмы
        change: function () {
            SetStatFirma();
        },

        //выгружает данные для приложения
        convertToApp: function() {
            var self = this;
            self.$f7.dialog.confirm('Выгрузить? ', 'Внимание! Если вы ничего не меняли, лучше не выгружать.', function () {
                              // for (let k = 0; k < Vids.length; k++) {
                //     if (Vids[k] !== null && Vids[k] !== undefined) {
                //         console.log(Vids[k]);
                //         VidsOtp.push(Vids[k]);
                //     }
                // }
                // for (let k = 0; k < Div.length; k++) {
                //     if (Div[k].display === '1') {
                //         DivOtp.push(Div[k]);
                //     }
                // }
                // for (let k = 0; k < Sub.length; k++) {
                //     if (Sub[k].display === '1') {
                //         SubOtp.push(Sub[k]);
                //     }
                // }
                // for (let k = 0; k < Firms.length; k++) {
                //     if (Firms[k].display === '1') {
                //         FirmsOtp.push(Firms[k]);
                //         let i = FirmsOtp.length - 1;
                //         delete FirmsOtp[i].last_edit; delete FirmsOtp[i].actual_date;
                //         if (JSON.parse(FirmsOtp[i].info).fill === '' && JSON.parse(FirmsOtp[i].info).show === '') {
                //             FirmsOtp[i].info = '';
                //         }
                //         if (JSON.parse(FirmsOtp[i].action).fill === '' && JSON.parse(FirmsOtp[i].action).show === '') {
                //             FirmsOtp[i].action = '';
                //         }
                //         if (JSON.parse(FirmsOtp[i].stat).fill === '' && JSON.parse(FirmsOtp[i].stat).show === '') {
                //             FirmsOtp[i].stat = '';
                //         }
                //         if (JSON.parse(FirmsOtp[i].baner).baner === '' && JSON.parse(FirmsOtp[i].baner).show === '') {
                //             FirmsOtp[i].baner = '';
                //         }
                //         if (JSON.parse(FirmsOtp[i].photo).dir === '' && JSON.parse(FirmsOtp[i].photo).show === '') {
                //             FirmsOtp[i].photo = '';
                //         }
                //     }
                // }
                                // let base = JSON.stringify({ vids: VidsOtp, div: DivOtp, sub: SubOtp, firms: FirmsOtp });

let All=[], VidsOtp = [], DivOtp = [],  FirmsOtp = [];
for (let k = 0; k < VidsAll.length; k++) { 
    if (VidsAll[k] !== null && VidsAll[k] !== undefined) {
                 VidsOtp.push(VidsAll[k]);
             }
  }
  for (let k = 0; k < Div.length; k++) {
         if (Div[k].display === '1') {
            Div[k].parent=''+Div[k].parent;
            Div[k].red=''+Div[k].red;
            Div[k].pos=''+Div[k].pos;
            Div[k].id=''+ Div[k].id;
             DivOtp.push(Div[k]);
         }
     }
     for (let k = 0; k < Sub.length; k++) {
        if (Sub[k].display === '1') {
            Sub[k].parent=''+Sub[k].parent;
            Sub[k].red=''+Sub[k].red;
            Sub[k].pos=''+Sub[k].pos;
            Sub[k].id=''+Sub[k].id;
            DivOtp.push(Sub[k]);
        }
    }
    let pic=100;
                for (let k = 0; k < Firms.length; k++) {
                   
                 if (firmsArr[k] !== undefined && firmsArr[k].display === '1' && firmsArr[k].name !== undefined ) {
                     
                 let st={};
                 let isVid=true;
                 try {
                    let foo = vidsArr[firmsArr[k].vid].name;
                                           
                   } catch (err) {
                       isVid = false;
              }
              if(isVid) {
                 st.vid=Firms[k].vid;
             } else {st.vid =  116; }
                 st.id=''+Firms[k].id;
                 st.fio=Firms[k].fio;
                 st.name=Firms[k].name;
                 st.email=Firms[k].email;
                 st.website='';
                 if(Firms[k].website !== '' ) {

                 let webst = (Firms[k].website).split('https://');
                 if(webst.length >1) {
                  st.website=webst[1];
                 }
                 webst = (Firms[k].website).split('http://');
                 if(webst.length >1) {
                  st.website=webst[1];
                 }
                 }
                 st.rezhim=Firms[k].rezhim;
                 st.display=Firms[k].display;
                 let adr=(JSON.parse(Firms[k].address)[0]);
                 st.address= adr.adres;
                 st.longitude=adr.long;
                 st.latitude=adr.latid;
                 st.phones=adr.tel1;
                 st.phone1_comment=adr.dop1;
                 st.fax=adr.tel2;
                 st.phone3_comment=adr.dop2;
                 st.dop_phones=adr.tel3;
                 st.phone2_comment=adr.dop3;
                 st.name_org=Firms[k].name_org;
                 st.con_phone=Firms[k].con_phone;
                 st.prioritet=Firms[k].prioritet;
                 let baner=JSON.parse(Firms[k].baner);
                 if(baner.baner !== '' ) {
           pic++;
        st.picture = ''+pic;
        }  else {st.picture='';}
        if(baner.main) {
            pic++;
         } 
        st.banner_show=baner.show;
        st.red=Firms[k].red;
                 st.black=Firms[k].black;
                 st.prioritet_show=Firms[k].prioritet_show;
                 let info=JSON.parse(Firms[k].info);
                    st.info=info.fill;   
                    st.info_show=info.show;
                    let action=JSON.parse(Firms[k].action);
                    
                    st.action=action.fill;   
                    st.paper_show=action.show;
                        let stat=JSON.parse(Firms[k].stat);
                        st.stat=stat.fill;   
                    st.stock_show=stat.show;
                    let photo=JSON.parse(Firms[k].photo);
                    st.photo_show=photo.show;
           
            if(st.prioritet_show !== ''  )    {
                if(st.black !=='') {
                    st.black =st.black+ st.prioritet_show.substr(1);
                } else { st.black =st.black+ st.prioritet_show;}
              }
                   FirmsOtp.push(st);
}}
let banNo=[];

banNo.push({"id":"64","name":"заглушка)","display":"","pos":"30","picture":"407.jpg","last_edit":"1508642418","link":""});
banNo.push({"id":"65","name":"заглушка)","display":"","pos":"30","picture":"407.jpg","last_edit":"1508642418","link":""});
All.push({});
All.push({});
All.push({data: banNo});
All.push({data: FirmsOtp});
All.push({data: DivOtp});
All.push({data: VidsOtp});
let base = JSON.stringify(All);
let fileList='';
let baners='';
let firmsMain=[];
pic=100;
for (let k = 0; k < Firms.length; k++) { 
    let baner=JSON.parse(Firms[k].baner);
     
    if(baner.baner !== '' ) {
        pic++;
    baners = baners + baner.baner;
    Firms[k].picture=''+pic;
   fileList=fileList + pic+'small.svg'+'\n'; 
    } 
    if(baner.main) {
        pic++;
        baners = baners+baner.banerMain; 
        fileList=fileList+pic+'.svg'+'\n';
let ban = JSON.parse(Firms[k].baner);
let st={pic: pic, id: Firms[k].id, name: Firms[k].name, pos: ban.pos}
firmsMain.push(st);
    }
}
    sortArr(firmsMain, 'pos', 1);
        let firmsBaner={}, firmsLink={}, firmsId={};
        for (let k = 0; k < firmsMain.length; k++) {
        let p=firmsMain[k].name;
  
        firmsBaner[p]=''+firmsMain[k].pic;
        firmsLink[p]=''+firmsMain[k].id;
        firmsId[p]=''+firmsMain[k].id;
            }
               let firmsMainBaners={'firmsBaner': firmsBaner, 'firmsLink': firmsLink, 'firmsId': firmsId};
       
            Framework7.request.promise.postJSON('/admin/app', { token: token, str: base, main: JSON.stringify(firmsMainBaners), filelist: fileList, baners: baners })
                    .then(function (data) {
                        var toast = self.$f7.toast.create({
                            text: 'Выгрузка завершилась успешно',
                            position: 'center',
                            closeTimeout: 4500
                        }); toast.open();
                    }).catch(function (error) {
                        console.log(error);
                    });
            });
        },

        //берем из старой базы данные, преобразуем и вставляем её в новую,
        clickOld: function (sost) {
            var self = this;
            
                this.$f7.dialog.confirm('Заменить базу? ', 'Внимание! Текущая база будет заменена из старой базы!', function () {
                    Framework7.request.promise.post('/admin/old', { token: token })
                        .then(function (data) {
                            console.log(data);
                            var toast = self.$f7.toast.create({
                                text: 'Новая база из старой обновлена',
                                position: 'center',
                                closeTimeout: 4500
                            }); toast.open();
                            //setTimeout(" location.reload(true)", 4500);
                        }).catch(function (error) {
                            console.log(error);
                        });
                });
                    },
        //Обновляем карту при смене адреса
        mapSee: function (index) {
            myVue.firma.address = JSON.stringify(myVue.multAdr);
            initCoord();
        },
        //Добавляем новый адрес
        mapAdd: function () {
            myVue.multAdr.push({ adres: '', long: null, latid: null, city: 'Томск', tel1: '', dop1: '', tel2: '', dop2: '', tel3: '', dop3: '' });
            myVue.firma.address = JSON.stringify(myVue.multAdr);
        },
        //Удаляем адрес
        mapDel: function (index) {
            if (myVue.multAdr.length < 2) {
                var toast = this.$f7.toast.create({
                    text: 'Это единственный адрес',
                    position: 'center',
                    closeTimeout: 2500
                });
                toast.open();
            } else {
                myVue.multAdr.splice(index, 1);
                myVue.firma.address = JSON.stringify(myVue.multAdr);
                initCoord();
            }
        },

        //Добавляем банер для просмотра, main = true, работаем с банером на главной странице
        showPic: function (object, main) {
            var file = object.files[0];
            var reader = new FileReader();
            reader.onload = function () {
                let ban = reader.result;
                ban = ban.replace('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><!-- Creator: CorelDRAW 2018 (64-Bit) -->', '');
                main ? $$('#outMain').html(ban) : $$('#out').html(ban);
            };
            reader.readAsText(file);
        },

      
        //Добавляем банер в фирму, main = true, работаем с банером на главной странице
        addPic: function (main) {
            let self = this;
            let  html = '';
            let title='#baner';
            if(main) {
                html = $$('#outMain').html();
                if (html !== '') {
                    FillFirma.baner.banerMain = html;
              }
             title='#banerMain';
             FillFirma.baner.pos = mainBan.length; 
             FillFirma.baner.main = true;
        } else {
            html = $$('#out').html();
            if (html !== '') {
                FillFirma.baner.baner = html;
             }
        }
        firma.baner = JSON.stringify(FillFirma.baner);
          setTimeout(() => {
                $$(title).html(html);
            }, 50);
        },
        //Убираем банер из фирмы, main = true, работаем с банером на главной странице
        delPic: function (main) {
            if(main) {
                FillFirma.baner.banerMain = '';
             FillFirma.baner.pos = -1;
            FillFirma.baner.main = false;
            $$('#banerMain').html('');
            $$('#fileMain').val('');
            } else {
            FillFirma.baner.baner = '';
            $$('#baner').html('');
            $$('#file').val('');
            }
         firma.baner = JSON.stringify(FillFirma.baner);
        },
        //Клик на рубрике в вспомогательных функциях при редактировании фирмы
        SetVsp: function (id, vsp, parent) {
            let direct = true;
            var self = this;
            switch (vsp) {
                case 'banner_show':
                    if (FillFirma.baner.show.indexOf(',' + id + ',') !== -1) { direct = false; }
                    if (direct) {
                        if ($$("#baner").html() !== '') {
                            if (FillFirma.baner.show === '') { FillFirma.baner.show = ','; }
                            FillFirma.baner.show = FillFirma.baner.show + id + ',';
                            FillFirma.baner.baner = $$("#baner").html();
                        } else {
                            var toast = self.$f7.toast.create({
                                text: 'Выберите сначала файл для банера',
                                position: 'center',
                                closeTimeout: 2500
                            });
                            toast.open();
                        }
                    } else {
                        if (parent !== 0) myVue.curIdDivFirm = parent;
                        FillFirma.baner.show = FillFirma.baner.show.replace(',' + id, '');
                        if (FillFirma.baner.show === ',') { FillFirma.baner.show = ''; }
                    }
                    myVue.firma.baner = JSON.stringify(FillFirma.baner);
                    break;
                case 'info_show':
                    if (FillFirma.info.fill !== '') {
                        if (FillFirma.info.show.indexOf(',' + id + ',') !== -1) { direct = false; }
                        if (direct) {
                            if (FillFirma.info.show === '') { FillFirma.info.show = ','; }
                            FillFirma.info.show = FillFirma.info.show + id + ',';
                        } else {
                            if (parent !== 0) myVue.curIdDivFirm = parent;
                            FillFirma.info.show = FillFirma.info.show.replace(',' + id, '');
                            if (FillFirma.info.show === ',') { FillFirma.info.show = ''; }
                        }
                        myVue.firma.info = JSON.stringify(FillFirma.info);
                    } else {
                        var toast2 = self.$f7.toast.create({
                            text: 'Введите информацию в поле',
                            position: 'center',
                            closeTimeout: 2500
                        });
                        toast2.open();
                    }
                    break;
                case 'paper_show':
                    if (FillFirma.stat.fill !== '') {
                        if (FillFirma.stat.show.indexOf(',' + id + ',') !== -1) { direct = false; }
                        if (direct) {
                            if (FillFirma.stat.show === '') { FillFirma.stat.show = ','; }
                            FillFirma.stat.show = FillFirma.stat.show + id + ',';
                        } else {
                            if (parent !== 0) myVue.curIdDivFirm = parent;
                            FillFirma.stat.show = FillFirma.stat.show.replace(',' + id, '');
                            if (FillFirma.stat.show === ',') { FillFirma.stat.show = ''; }
                        }
                        myVue.firma.stat = JSON.stringify(FillFirma.stat);
                    } else {
                        var toast3 = self.$f7.toast.create({
                            text: 'Введите статью в поле',
                            position: 'center',
                            closeTimeout: 2500
                        });
                        toast3.open();
                    }
                    break;
                case 'act_show':
                    if (FillFirma.action.fill !== '') {
                        if (FillFirma.action.show.indexOf(',' + id + ',') !== -1) { direct = false; }
                        if (direct) {
                            if (FillFirma.action.show === '') { FillFirma.action.show = ','; }
                            FillFirma.action.show = FillFirma.action.show + id + ',';
                        } else {
                            if (parent !== 0) myVue.curIdDivFirm = parent;
                            FillFirma.action.show = FillFirma.action.show.replace(',' + id, '');
                            if (FillFirma.action.show === ',') { FillFirma.action.show = ''; }
                        }
                        myVue.firma.action = JSON.stringify(FillFirma.action);
                    } else {
                        var toast4 = self.$f7.toast.create({
                            text: 'Введите акцию в поле',
                            position: 'center',
                            closeTimeout: 2500
                        });
                        toast4.open();
                    }
                    break;
            }
            SetStatFirma();
        },
        //открываем программно div-popup
        createPopupDiv(el) {
            if (!this.popupDiv) {
                this.popupDiv = this.$f7.popup.create({
                    el: el
                });
            }
            this.popupDiv.open(false);
        },
        //открываем программно baner-popup
        createPopupBaner(el) {
            if (!this.PopupBaner) {
                this.PopupBaner = this.$f7.popup.create({
                    el: el
                });
            }
            this.PopupBaner.open(false);
        },

        //открываем программно Sub-popup
        createPopupSub(el) {
            if (!this.popupSub) {
                this.popupSub = this.$f7.popup.create({
                    el: el
                });
            } else { this.popupSub.close(); }
            this.popupSub.open(false);

        },
        //Ставим актуальную дату
        ActFirma: function () {
            myVue.firma.actual_date = (new Date()).toISOString();
            let ret = (new Date()).toISOString();
            $$('.dateFirma').text(ret.slice(8, 10) + '-' + ret.slice(5, 7) + '-' + ret.slice(0, 4));

        },
        //открываем программно редактирования для фирм
        createPopupFirma(el) {
            const self = this;
            self.popupFirma = self.$f7.popup.create({
                on: {
                    open: function () {
                        console.log('popup');
                    }
                },
                el: el
            });
            self.popupFirma.open(false);
            if (!self.calendarFirma) self.createCalendar();
        },
        createCalendar() {
            const self = this;
            if (!self.calendarFirma) {
                self.calendarFirma = self.$f7.calendar.create({
                    inputEl: '#demo-calendar-modal',
                    openIn: 'auto',
                    value: [myVue.firma.actual_date],
                    header: true,
                    closeOnSelect: true,
                    dateFormat: 'dd MM yyyy',
                    monthNames: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
                    dayNamesShort: ['воск.', 'пон.', 'втор.', 'среда', 'четв.', 'пятн.', 'суб.'],
                    on: {
                        calendarClosed: function (calendar) {

                        }
                    }
                });
            }
        },

        onPageBeforeRemove() {
            const self = this;
            // Destroy popup when page removed
            if (self.calendarModal) self.calendarModal.destroy();
            if (self.popupFirma) self.popupFirma.destroy();
        }
    }
});

//Вспомагательные функции
$$('.firma-popup').on('popup:open', function (e, popup) {
    popup.params.closeByBackdropClick = false;
});
//Функция для подсчета количества рубрик с красными, черными и т.д. 
//StatFirma = { Prior: 0, Red: 0, Black: 0, Act: 0, Ban: 0, Info: 0, Stat: 0, print: 0 };
function SetStatFirma() {
    myVue.StatFirma = { Prior: 0, Red: 0, Black: 0, Act: 0, Ban: 0, Info: 0, Stat: 0, print: 0 };
    if (myVue.firma.prioritet !== '' && myVue.firma.prioritet_show.split(",").length > 1) { myVue.StatFirma.Prior = myVue.firma.prioritet_show.split(",").length - 2; }
    let str = JSON.parse(myVue.firma.action);
    if (str.fill !== '' && str.show.split(",").length > 1) { myVue.StatFirma.Act = str.show.split(",").length - 2; }
    str = JSON.parse(myVue.firma.stat);
    if (str.fill !== '' && str.show.split(",").length > 1) { myVue.StatFirma.Stat = str.show.split(",").length - 2; }
    str = JSON.parse(myVue.firma.info);
    if (str.fill !== '' && str.show.split(",").length > 1) { myVue.StatFirma.Info = str.show.split(",").length - 2; }
    str = JSON.parse(myVue.firma.baner);
    if (str.fill !== '' && str.show.split(",").length > 1) { myVue.StatFirma.Ban = str.show.split(",").length - 2; }
    let k = 0; let tr = myVue.firma.red.split(",");
    for (let i = 0; tr.length > i; i++) {
        if (myVue.firma.prioritet_show.indexOf(tr[i]) === -1) { k++; }
    }
    myVue.StatFirma.Red = k;
    if (myVue.firma.black !== undefined && myVue.firma.black.split(",").length > 1) { myVue.StatFirma.Black = myVue.firma.black.split(",").length - 2; }
    if (myVue.firma.print !== null && myVue.firma.print !== undefined && myVue.firma.print.split(",").length > 1) { myVue.StatFirma.print = myVue.firma.print.split(",").length - 2; }
}
//Заполнение текущего Div, -1 для нового div, остальное для извлечение по id
function setDivNew(id) {
    if (id === -1) {
        myVue.curDiv = { id: '', name: '', red: '0', display: '1', pos: lastPosDiv, info: '', last_edit: (new Date()).toISOString() };
        curDiv = { id: '', name: '', red: '0', display: '1', pos: lastPosDiv, info: '', last_edit: (new Date()).toISOString() };
    } else {
        SubDivTemp = copyObj(Div[id]);
        myVue.curDiv = { id: Div[id].id, name: Div[id].name, red: Div[id].red, display: Div[id].display, pos: Div[id].pos, info: Div[id].info, last_edit: Div[id].last_edit };
        curDiv = { id: Div[id].id, name: Div[id].name, red: Div[id].red, display: Div[id].display, pos: Div[id].pos, info: Div[id].info, last_edit: Div[id].last_edit };
    }
}

//Заполнение текущего Sub, -1 для нового div, остальное для извлечение по id
function setSubNew(id) {
    if (id === -1) {
        myVue.curSub = { id: '', parent: curDiv.id, name: '', red: '0', display: '1', pos: lastPosSub, info: '', last_edit: (new Date()).toISOString() };
        curSub = { id: '', parent: curDiv.id, name: '', red: '0', display: '1', pos: lastPosSub, info: '', last_edit: (new Date()).toISOString() };
    } else {
        SubDivTemp2 = copyObj(Sub[id]);
        myVue.curSub = { id: Sub[id].id, parent: Sub[id].parent, name: Sub[id].name, red: Sub[id].red, display: Sub[id].display, pos: Sub[id].pos, info: Sub[id].info, last_edit: Sub[id].last_edit };
        curSub = { id: Sub[id].id, parent: Sub[id].parent, name: Sub[id].name, red: Sub[id].red, display: Sub[id].display, pos: Sub[id].pos, info: Sub[id].info, last_edit: Sub[id].last_edit };
    }
}

function UpRec(divTab, curDiv) {
    Framework7.request.promise.postJSON(urlUp, { token: token, table: divTab, rec: JSON.stringify(curDiv) })
        .then(function (data) {
            if (data.data.message === 'Success') {
                console.log('Запись дива успешна');
            } else {
                alert('Ошибка запроса');
            }
        }).catch((err) => {
            console.log(err);
            console.log('Ошибка запроса div = ' + err.message);
        });
}

//Копирование объекта без ссылки
function copyObj(variable) {
    var newVariable = {};
    for (var i in variable)
        newVariable[i] = variable[i];
    return newVariable;
}

//переводит в читаемый формат дату
function formatDate(ret) {
    return ret.slice(8, 10) + '-' + ret.slice(5, 7) + '-' + ret.slice(0, 4);
}

//выдает объект фирма без ссылки на текущую фирму
function getFirma(id) {
    firmsArr.some(function (obj) {
        if (obj.id === id) {
            for (var key in obj) {
                myVue.firma[key] = obj[key];
                firma[key] = obj[key];
            }
            return myVue.firma.name;
        }
    });
}


function begin(all) {
    all = JSON.parse(all);
    var firmsPer = all[3].data;
    vids = all[5].data;
    Framework7.request.promise.postJSON(urlinsall, { token: token, table: 'spravkavids', rec: JSON.stringify(vids) })
        .then(function (data) { console.log(''); })
        .then(function (err) {
            console.log('Ошибка запроса spravkavids ' + err);
        });

}

//иницилизируем координаты
function initCoord() {
    var clients = { address: [''], name: ['Я тут'], id: [0], coordinates: [null, null] };
    let vsp = 0;
    clients.coordinates[vsp] = [null, null];
    for (let i = 0; i < myVue.multAdr.length; i++) {
        if (myVue.multAdr[i].adres !== '') {
            if (myVue.multAdr[i].city === '') {
                myVue.multAdr[i].city = 'Томск';
            }
            clients.address[vsp] = myVue.multAdr[i].city + ', ' + myVue.multAdr[i].adres;
            clients.name[vsp] = myVue.multAdr[i].adres;
            clients.id[vsp] = vsp;
            if (myVue.multAdr[i].latid !== '' && myVue.multAdr[i].latid !== null) {
                clients.coordinates[vsp] = [myVue.multAdr[i].latid, myVue.multAdr[i].long];
            } else {
                clients.coordinates[vsp] = [null, null];
            }
        }
        vsp++;
    }
    let MyAdr = ''; var promises = [];
    var don = 0; var not = 0;
    for (let i = 0; i < clients.name.length; i++) {
        var request = Framework7.request.promise.json('https://geocode-maps.yandex.ru/1.x', {
            geocode: clients.address[i],
            lang: 'ru_RU',
            apikey: 'e699252d-1879-4e01-8583-00ad94cdef76',
            format: 'json'
        }).then(function (data) {
            console.log(data);
            //let data = JSON.parse(data2);
            var coord = data.data.response.GeoObjectCollection.featureMember['0'].GeoObject.Point.pos.split(' ');
            if (coord && coord[0] !== null && coord[1] !== null) {
                clients.coordinates[i][0] = coord[1];
                clients.coordinates[i][1] = coord[0];
                myVue.multAdr[i].latid = coord[1];
                myVue.multAdr[i].long = coord[0];
                don++;
            } else {
                clients.coordinates[i][1] = null;
                clients.coordinates[i][0] = null;
                not++;
            }
            return;
        }).catch(function (error) {
            console.log('error запроса гео ');
            console.log(error);
        });
        promises.push(request);
    }
    Promise.all(promises).then(function (results) {
        myVue.firma.address = JSON.stringify(myVue.multAdr);
        initMap(clients);
    }).catch(function (err) { console.log('ошибка = ' + err); });

}

//иницилизируем карту 
//var clients = { address: [''], name: ['Я тут'], id: [0], coordinates: [null, null] };
function initMap(clients) {
    $$('#map').html('');
    var coord = [];
    coord[0] = 56.5005; coord[1] = 84.98212;
    var myMap = new ymaps.Map("map", {
        center: coord,
        zoom: 24,
        controls: ['routeButtonControl', 'zoomControl', 'searchControl', 'trafficControl', 'geolocationControl']
    }, {
        balloonPanelMaxMapArea: 0,
        buttonMaxWidth: 300
    });
    // Ждем когда для всех клиентов или появятся метки или произойдет ошибка
    // геокодирования.
    var clientsPromises = [];
    for (var i = 0; i < clients.name.length; i++) {
        // Функции начнут выпоняться после завершения цикла и в этот моммент
        // будет clients.name.length. Обойти это можно или использованием ES6
        // или созданием новой функции.
        clientsPromises.push(loadClient(i));
    }
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

        // Для унифицикации дальнейшего кода, если координаты уже есть,
        //  создаем зарезолвившийся ими промис.
        clientCoordinatesPromise = ymaps.vow.resolve(coordinates);
        //}
        // Подписываемся на получение координат и создаем метку.
        return clientCoordinatesPromise
            .then(function (coordinates) {
                if (!coordinates) {
                    // Игнорируем клиентов без координат.
                    return null;
                }
                myMap.setCenter(coordinates, 14);
                var point = new ymaps.Placemark(coordinates,
                    {
                        balloonContentHeader: clients.name[clientIndex]
                    },
                    {
                        preset: 'islands#redDotIcon', hideIconOnBalloonOpen: false,
                        balloonOffset: [0, -25]
                    });
                myMap.geoObjects.add(point);
                // Можно вернуть дополнительную информацию.
                // Или вообще ничего не возвращать.
                return { point: point, additional: 42 };
            });
    }
}

