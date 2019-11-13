(() => {
    'use strict'

    // SERVICEWORKER
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').then(registration => {
                console.log('ServiceWorker registrado com sucesso: ', registration.scope);
            }, function (err) {
                console.error('Sem suporte para ServiceWorker: ', err);
            });
        })
    }


    // USER OBJECT
    let obj_user = {
        // USER INPUTS
        ipt_name: document.getElementById('user_name'),
        ipt_password: document.getElementById('user_password')
    },
        // DIALOG
        dialog = document.getElementById('app_dialog'),
        // SNACKBAR
        snackbar = document.getElementById('app_snackbar'),
        // SPINNER
        spinner = document.getElementById('app_loading'),
        // LOGIN COMPONENTS
        com_login = document.querySelector('.mdl-card__actions'),
        // HELP BUTTON
        btn_help = document.getElementById('app_help'),
        // SHOW PASSWORD SWITCH
        swi_showPassword = document.getElementById('app_showPassword'),
        // REMIND ME SWITCH
        swi_remindMe = document.getElementById('app_remindMe'),
        // LOGIN BUTTON
        btn_login = document.getElementById('app_login'),
        // REGISTER BUTTON
        btn_register = document.getElementById('app_register'),
        // FORGOT PASSWORD BUTTON
        btn_forgotPassword = document.getElementById('app_forgotPassword'),
        // SHOW PASSWORD FUNCTION
        showPasswordChanged = () => {
            // CHECK SHOW PASSWORD CHECKBOX
            if (swi_showPassword.checked === true) {
                obj_user.ipt_password.type = 'text';
            }
            else {
                obj_user.ipt_password.type = 'password';
            }
        };

    // WINDOW EVENT TO FILL USER INFO / REMIND ME
    window.addEventListener('load', () => {
        // CHECK LOCALSTORAGE remind_me
        if (localStorage.hasOwnProperty('remind_me')) {
            let str_remindMe = localStorage.getItem('remind_me'),
                obj_remindMe = JSON.parse(str_remindMe);
            // FILL USER NAME
            com_login.children[0].classList.add('is-dirty');
            obj_user.ipt_name.value = obj_remindMe.name;
            // CHECK PASSWORD SWITCH
            if (obj_remindMe.show_password === true) {
                com_login.children[2].classList.add('is-checked');
                swi_showPassword.checked = true;
                showPasswordChanged();
            }
            // CHECK REMIND ME SWITCH
            if (obj_remindMe.remind_me === true) {
                com_login.children[3].classList.add('is-checked');
                swi_remindMe.checked = true;
            }
        }
    });

    // REGISTER EVENT
    btn_register.addEventListener('click', () => {
        window.location = 'register.html';
    });

    // FORGOT PASSWORD EVENT
    btn_forgotPassword.addEventListener('click', () => {
        window.location = 'recover.html';
    });

    // HELP EVENT
    btn_help.addEventListener('click', () => {
        appShowDialog({
            element: dialog,
            title: 'Ajuda',
            message: 'Favor preencher seu nome de usuário e senha para entrar na aplicação, caso ainda não possua um cadastro favor clicar em CADASTRAR. Se você esqueceu sua senha favor clicar em RECUPERAR CADASTRO.',
            btn_ok() { appHideDialog(dialog); }
        });
    });

    // SHOW PASSWORD EVENT
    swi_showPassword.addEventListener('change', () => {
        showPasswordChanged();
    });

    // REMIND ME EVENT
    swi_remindMe.addEventListener('change', () => {
        // CHECK REMIND ME CHECKBOX
        if (swi_remindMe.checked === true) {
            // CHECK USER INPUTS
            if (obj_user.ipt_name.value !== '' && obj_user.ipt_password.value !== '') {
                let obj_remindMe = {
                    name: obj_user.ipt_name.value,
                    show_password: swi_showPassword.checked,
                    remind_me: swi_remindMe.checked
                },
                    str_remindMe = JSON.stringify(obj_remindMe);
                localStorage.setItem('remind_me', str_remindMe);
            }
        }
        else {
            localStorage.clear();
        }
    });

    // LOGIN EVENT
    btn_login.addEventListener('click', () => {
        // CHECK USER INPUTS
        let count = 0;
        for (let i in obj_user) {
            if (obj_user[i].value === '') {
                count++;
            }
        }
        if (count > 0) {
            appShowSnackBar(snackbar, 'Favor preencher corretamente os campos');
            return;
        }
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            let user = {
                name: obj_user.ipt_name.value.trim(),
                password: obj_user.ipt_password.value.trim()
            };
            appShowLoading(spinner, spinner.children[0]);
            // NODE.JS API userLogin
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })
                .then(result => { return result.json() })
                .then(data => {
                    if (!data.hasOwnProperty('token')) {
                        appHideLoading(spinner, spinner.children[0]);
                        appShowSnackBar(snackbar, data.message);
                        return;
                    }
                    let obj_auth = {
                        token: data.token,
                        id: data.id
                    },
                        str_auth = JSON.stringify(obj_auth);
                    localStorage.setItem('auth', str_auth);
                    window.location = 'map.html';
                })
                .catch(err => {
                    console.error(err.message);
                    appHideLoading(spinner, spinner.children[0]);
                    appShowSnackBar(snackbar, 'Ocorreu um erro, por favor tente novamente');
                })
        }
        else {
            appShowSnackBar(snackbar, 'Sem internet');
        }
    });
})();