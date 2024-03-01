'use strict';

$$(window).on('load', function () {
    //разделяем две загрузки
    $$('body').animate({
        opacity: 1
    }, 300);
    if ($$("div").is(".info")) {
        $$('.info').html('');
    }
});

$$('#enter').on('click', function () {
    var token, urlToken;
    if (verifyField()) {
        Framework7.request.promise.postJSON("/enter", { login: $$('#login').val(), pass: $$('#pass').val() })
            .then(function (data) {
                let data2 = data.data;
                console.log(data2);
                if (data2.message === 'Success') {
                    localStorage.setItem('token', data2.token); // сохранили токен
                    token = data2.token;
                    urlToken = '/admin?token=' + data2.token;
                    window.location = urlToken;
                } else {
                    $$('.info').html(data2.message);
                    setTimeout(function () { $$('.info').html(''); }, 3000);
                }
            }).catch(function (err) {
                $$('.info').html(err);
                setTimeout(function () { $$('.info').html(''); }, 3000);
            });
    }
});

//проверка поля логина и пасс
function verifyField() {
    let TextRez = '';
    if ($$('#login').val() === '') {
        TextRez = 'Не заполнен логин<br>';
    }
    if ($$('#pass').val() === '') {
        TextRez = TextRez + 'Не заполнен пароль<br>';
    }
    if (TextRez !== '') {
        $$('.info').html(TextRez);
        setTimeout(function () { $$('.info').html(''); }, 3000);
        return false;
    } else {
        return true;
    }
}

