(() => {
    'use strict'

    // USER OBJECT
    let obj_user = {
        // USER INPUTS
        ipt_address: document.getElementById('user_address')
    },
        obj_password = {
            ipt_password: document.getElementById('user_password')
        },
        // TIMEOUT
        timeout = null,
        // AUTOCOMPLETE LIST
        ul_autocomplete = document.querySelector('.autocomplete-items'),
        // AUTOCOMPLETE COMPONENT
        com_address = document.querySelector('.autocomplete div'),
        // AUTOCOMPLETE ITEM FUNCTIONS
        autocompleteSelected = element => {
            obj_user.ipt_address.value = element.innerText;
            ul_autocomplete.innerHTML = '';
        },
        // DIALOG
        dialog = document.getElementById('app_dialog'),
        // SNACKBAR
        snackbar = document.getElementById('app_snackbar'),
        // SPINNER
        spinner = document.getElementById('app_loading'),
        // USER NAME INPUT
        ipt_name = document.getElementById('user_name'),
        // USER EMAIL INPUT
        ipt_email = document.getElementById('user_email'),
        // CEP INPUT
        ipt_cep = document.getElementById('app_cep'),
        // PROFILE COMPONENTS
        com_profile = document.querySelector('.mdl-card__actions'),
        // RETURN BUTTON
        btn_return = document.getElementById('app_return'),
        // HELP BUTTON
        btn_help = document.getElementById('app_help'),
        // UPDATE USER PASSWORD BUTTON
        btn_updatePassword = document.getElementById('app_updatePassword'),
        // UPDATE USER INFO BUTTON
        btn_updateInfo = document.getElementById('app_updateInfo'),
        // ADDRESS BY CEP BUTTON
        btn_addressByCep = document.getElementById('app_addressByCep'),
        // ADDRESS BY LOCATION BUTTON
        btn_addressByLocation = document.getElementById('app_addressByLocation'),
        // LOCATION OPTIONS
        locationOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

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
                                    com_profile.children[3].classList.add('is-dirty');
                                    ipt_name.value = data.respTemplate.name;
                                    com_profile.children[4].classList.add('is-dirty');
                                    ipt_email.value = data.respTemplate.email;
                                    com_address.classList.add('is-dirty');
                                    obj_user.ipt_address.value = data.respTemplate.address;
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
    btn_updatePassword.addEventListener('click', () => {
        // CHECK USER INPUTS
        let count = 0;
        for (let i in obj_password) {
            if (obj_password[i].value === '') {
                count++;
            }
        }
        if (count > 0) {
            appShowSnackBar(snackbar, 'Favor preencher os campos obrigatórios (*)');
            return;
        }
        // CHECK NEW PASSWORD INPUT
        if (!/^[a-zA-Z0-9_.-]*$/.test(obj_password.ipt_password.value)) {
            obj_password.ipt_password.value = '';
            appShowSnackBar(snackbar, 'Nova senha inválida');
            return;
        }
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            let str_auth = localStorage.getItem('auth'),
                obj_auth = JSON.parse(str_auth),
                password = {
                    id: obj_auth.id,
                    new: obj_password.ipt_password.value.trim()
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

    // UPDATE USER INFO EVENT
    btn_updateInfo.addEventListener('click', () => {
        // CHECK USER INPUTS
        let count = 0;
        for (let i in obj_user) {
            if (obj_user[i].value === '') {
                count++;
            }
        }
        if (count > 0) {
            appShowSnackBar(snackbar, 'Favor preencher os campos obrigatórios (*)');
            return;
        }
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            let str_auth = localStorage.getItem('auth'),
                obj_auth = JSON.parse(str_auth),
                user = {
                    id: obj_auth.id,
                };
            appShowLoading(spinner, spinner.children[0]);
            geocode(platform, obj_here)
                .then(location => {
                    let coord = location.response.view[0].result[0],
                        position = {
                            lat: coord.location.displayPosition.latitude.toFixed(6),
                            lng: coord.location.displayPosition.longitude.toFixed(6)
                        };
                    user.coordinates = `${position.lat}, ${position.lng}`;
                    // NODE.JS API setUserData
                    fetch('/data', {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${obj_auth.token}`
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
                                btn_ok() { window.location = 'map.html'; }
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