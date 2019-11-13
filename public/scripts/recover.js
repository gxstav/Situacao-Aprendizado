(() => {
    'use strict'

    // USER OBJECT
    let obj_user = {
        // USER INPUT
        ipt_email: document.getElementById('user_email')
    },
        // DIALOG
        dialog = document.getElementById('app_dialog'),
        // SNACKBAR
        snackbar = document.getElementById('app_snackbar'),
        // SPINNER
        spinner = document.getElementById('app_loading'),
        // RETURN BUTTON
        btn_return = document.getElementById('app_return'),
        // HELP BUTTON
        btn_help = document.getElementById('app_help'),
        // RECOVER BUTTON
        btn_recover = document.getElementById('app_recover');

    // RETURN EVENT
    btn_return.addEventListener('click', () => {
        window.location = 'index.html';
    });

    // HELP EVENT
    btn_help.addEventListener('click', () => {
        appShowDialog({
            element: dialog,
            title: 'Ajuda',
            message: 'Favor informar seu e-mail de cadastro e clicar em RECUPERAR para receber um e-mail com seu nome de usuário e senha.',
            btn_ok() { appHideDialog(dialog); }
        });
    });

    // RECOVER EVENT
    btn_recover.addEventListener('click', () => {
        // CHECK USER INPUT
        if (obj_user.ipt_email.value === '') {
            appShowSnackBar(snackbar, 'Favor preencher o campo e-mail');
            return;
        }
        // CHECK E-MAIL INPUT
        if (!/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm.test(obj_user.ipt_email.value)) {
            obj_user.ipt_email.value = '';
            appShowSnackBar(snackbar, 'e-mail inválido');
            return;
        }
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            let user = {
                email: obj_user.ipt_email.value.trim(),
            };
            appShowLoading(spinner, spinner.children[0]);
            // NODE.JS API isRegistered
            fetch('/registered', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })
                .then(result => { return result.json() })
                .then(data => {
                    // IF THE user_email NOT EXISTS
                    if (data.respTemplate.length > 0) {
                        appHideLoading(spinner, spinner.children[0]);
                        appShowSnackBar(snackbar, data.respTemplate[0]);
                        return;
                    }
                    // NODE.JS API recoverUser
                    fetch('/recover', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(user)
                    })
                        .then(result => { return result.json() })
                        .then(data => {
                            appHideLoading(spinner, spinner.children[0]);
                            appShowDialog({
                                element: dialog,
                                title: data.title,
                                message: data.message,
                                btn_ok() { window.location = 'index.html'; }
                            });
                        })
                        .catch(err => {
                            console.error(err.message);
                            appHideLoading(spinner, spinner.children[0]);
                            appShowSnackBar(snackbar, 'Ocorreu um erro, por favor tente novamente');
                        })
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