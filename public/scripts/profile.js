(() => {
    'use strict'

        // DIALOG
    let dialog = document.getElementById('app_dialog'),
        // SNACKBAR
        snackbar = document.getElementById('app_snackbar'),
        // SPINNER
        spinner = document.getElementById('app_loading'),
        // USER NAME INPUT
        ipt_name = document.getElementById('user_name'),
        // USER EMAIL INPUT
        ipt_email = document.getElementById('user_email'),
        // USER PASSWORD INPUT
        ipt_password = document.getElementById('user_password'),
        // RETURN BUTTON
        btn_return = document.getElementById('app_return'),
        // HELP BUTTON
        btn_help = document.getElementById('app_help'),
        // UPDATE USER PASSWORD BUTTON
        btn_confirm = document.getElementById('app_updatePassword'),
        // SHOW PASSWORD SWITCH
        swi_showPassword = document.getElementById('app_showPassword'),
        // PASSWORD ICON
        icon = document.getElementById('icon_showPassword');


    const showPasswordChanged = () => {
        // CHECK SHOW PASSWORD CHECKBOX
        if (swi_showPassword.checked === true) {
            ipt_password.type = 'text';
            icon.innerHTML = 'visibility';
        }
        else {
            ipt_password.type = 'password';
            icon.innerHTML = 'visibility_off';
        }
    };

    // ACTIVATE BUTTON ON INPUT
    ipt_password.addEventListener('input' , () =>{
        if (ipt_password.value.length > 0) { 
            btn_confirm.disabled = false
            btn_confirm.style = "background-color:#FF9800;color:#FFF"
        }
        else{
            btn_confirm.disabled = true
            btn_confirm.style = "background-color:#808080;"
        }
    })

    // SHOW PASSWORD EVENT
    swi_showPassword.addEventListener('change', () => {
        showPasswordChanged();
    });

    // WINDOW EVENT TO FILL USER INFO
    window.addEventListener('load', () => {
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            // CHECK LOCALSTORAGE auth
            if (localStorage.hasOwnProperty('auth')) {
                let str_auth = localStorage.getItem('auth'),
                    obj_auth = JSON.parse(str_auth);
                appShowLoading(spinner, spinner.children[0]);
                // NODE.JS API isAuthenticated
                fetch('/authenticated', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${obj_auth.token}`
                    }
                })
                    .then(result => { return result.json() })
                    .then(data => {
                        if (data.authenticated) {
                            // NODE.JS API getUser
                            fetch(`/data/${obj_auth.id}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${obj_auth.token}`
                                }
                            })
                                .then(result => { return result.json() })
                                .then(data => {
                                    ipt_name.value = data.respTemplate.name;
                                    ipt_email.value = data.respTemplate.email;
                                    appHideLoading(spinner, spinner.children[0]);
                                })
                                .catch(err => {
                                    console.error(err.message);
                                    window.location = 'index.html';
                                })
                        }
                    })
                    .catch(err => {
                        console.error(err.message);
                        window.location = 'index.html';
                    });
            }
            else {
                window.location = 'index.html';
            }
        }
        else {
            window.location = 'index.html';
        }
    });

    // RETURN EVENT
    btn_return.addEventListener('click', () => {
        window.location = 'map.html';
    });

    // HELP EVENT
    btn_help.addEventListener('click', () => {
        appShowDialog({
            element: dialog,
            title: 'Ajuda',
            message: 'Aqui é mostrado seus dados, no momento, apenas a SENHA pode ser alterada.',
            btn_ok() { appHideDialog(dialog); }
        });
    });

    // UPDATE USER PASSWORD EVENT
    btn_confirm.addEventListener('click', () => {
        // CHECK NEW PASSWORD INPUT
        if (!/^[a-zA-Z0-9_.-]*$/.test(ipt_password.value)) {
            ipt_password.value = '';
            appShowSnackBar(snackbar, 'Nova senha inválida');
            return;
        }
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            let str_auth = localStorage.getItem('auth'),
                obj_auth = JSON.parse(str_auth),
                password = {
                    id: obj_auth.id,
                    new: ipt_password.value.trim()
                };
            appShowLoading(spinner, spinner.children[0]);
            // NODE.JS API setUserPassword
            fetch('/password', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${obj_auth.token}`
                },
                body: JSON.stringify(password)
            })
                .then(result => { return result.json() })
                .then(data => {
                    appHideLoading(spinner, spinner.children[0]);
                    appShowDialog({
                        element: dialog,
                        title: data.title,
                        message: data.message,
                        btn_ok() { window.location = 'map.html'; }
                    });
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