// ==UserScript==
// @name         AddClientDirectoryToPyrus
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Скрипт для добавления юр.лиц в справочник
// @author       You
// @match        https://dxbx.ru/index*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dxbx.ru
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (window.location.href.indexOf('/edit/legalperson/') == -1) {
        return;
    }

    function strToObj(str){
        var obj = {};
        if(str&&typeof str ==='string'){
            var objStr = str.match(/\{(.)+\}/g);
            eval("obj ="+objStr);
        }
        return obj
    }

    var token;
    var response_data;
    var login = 'bot@532d0850-3d57-49b4-b1d8-c6f7a6c81a8b';
    var password = 'YS9acI1KF9I9CqXQyJ~pM3aYGqZIsoNJKx65y5p97dRfHRBRnqato8~MAr~1vhWKYTClmA5S8OmJ3d6kF2kSdacJjbVhP3J1';

    function getToken(login, password){
        var url = new URL('https://api.pyrus.com/v4/auth');
        url.searchParams.set('login', login);
        url.searchParams.set('security_key', password);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `${url}`, false);
        xhr.send();
        if (xhr.status != 200) {
            return alert(`Ошибка ${xhr.status}: ${xhr.statusText}`); // пример вывода: 404: Not Found
        } else {
            response_data = xhr.responseText;
            token = strToObj(response_data).access_token;
            return token;
        }
    }

    var fill = function(){
        var nav = document.getElementsByClassName('header smaller lighter grey')[0];
        var addClientDirectoryToPyrus = document.createElement('button');
        addClientDirectoryToPyrus.innerHTML = "Добавить клиента в справочник пайрус";
        addClientDirectoryToPyrus.setAttribute('target', '_blank');
        addClientDirectoryToPyrus.style.marginTop = '5px';
        addClientDirectoryToPyrus.style.marginLeft = '5px';
        nav.appendChild(addClientDirectoryToPyrus);

        addClientDirectoryToPyrus.onclick = function(){

            token = getToken(login, password);
            var manualid = '45252';
            var url = 'https://api.pyrus.com/v4/catalogs/' + manualid; //менять справочник туть
            var getting_manual;


            //Получаем текущий справочник
            var xhr = new XMLHttpRequest();
            xhr.open('GET', `${url}`, false);
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            try {
                xhr.send();
                if (xhr.status != 200) {
                    alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
                } else {
                    response_data = xhr.responseText;
                    getting_manual = response_data;

                }
            } catch(err) {
                alert("Запрос не удался");
            }

            //Получаем данные со страницы
            var ul_name = document.getElementById('id_name').value;
            var ul_company = document.getElementById('select2-id_company-container').title;
            var ul_id = window.location.href.split('legalperson/')[1];
            var ul_kpp = document.getElementById('id_kpp').value;
            var ul_addID = document.getElementById('id_additionalIdentifier').value;
            var ul_inn = document.getElementById('id_inn').value;

            //Обновляем справочник
            var catalog = JSON.parse(getting_manual);
            catalog = {
                'catalog_headers': catalog.catalog_headers,
                'apply': true,
                'items': catalog.items                
            }

            var i, isExists = false;
            // Удалим все item_id из items
            for (i = 0; i < catalog.items.length; i++) {
                catalog.items[i] = {
                    'values': catalog.items[i].values
                }
            }
            // и заменим названия каталогов на строки
            for (i = 0; i < catalog.catalog_headers.length; i++) {
                catalog.catalog_headers[i] = catalog.catalog_headers[i].name;
            }

        for (i = 0; i < catalog.items.length; i++) {
            var catLP = catalog.items[i].values;
            if (catLP[0] == ul_id) { //ID
                isExists = true;
                break;
            }
        }

            if (!isExists) {
                catalog.items.push({
                    'values': [ul_id, ul_name, ul_company, ul_inn, ul_kpp, ul_addID]
                });
                var json = JSON.stringify(catalog);
                xhr = new XMLHttpRequest();
                xhr.open('POST', `${url}`, false);
                xhr.setRequestHeader("Authorization", "Bearer " + token);
                xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                try {
                    xhr.send(json);
                    if (xhr.status != 200) {
                        alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
                    } else {
                        alert('Добавлен новый элемент справочника');
                        response_data = xhr.responseText;
                        getting_manual = response_data;

                    }
                } catch(err) {
                    alert("Запрос не удался");
                }
            } else {
                alert('ЮЛ с таким ID уже есть в справочнике');
            }




        }

    }
    window.onload = setTimeout(fill, 1000);

})();