(() => {
    'use strict'

    // USER OBJECT
    let obj_user = {
        // USER INPUTS
        ipt_name: document.getElementById('user_name'),
        ipt_password: document.getElementById('user_password'),
        ipt_email: document.getElementById('user_email'),
        ipt_address: document.getElementById('user_address')
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
        // CEP INPUT
        ipt_cep = document.getElementById('app_cep'),
        // RETURN BUTTON
        btn_return = document.getElementById('app_return'),
        // HELP BUTTON
        btn_help = document.getElementById('app_help'),
        // REGISTER BUTTON
        btn_register = document.getElementById('app_register'),
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

    // DOCUMENT EVENT TO CLEAN AUTOCOMPLETE ITEMS
    document.addEventListener('click', () => {
        ul_autocomplete.innerHTML = '';
    });

    // AUTOCOMPLETE ADDRESS EVENT
    obj_user.ipt_address.addEventListener('keyup', () => {
        // CHECK ADDRESS INPUT
        if (obj_user.ipt_address.value !== '') {
            // CHECK ONLINE STATE
            if (navigator.onLine) {
                // CHECK TIMEOUT
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                timeout = setTimeout(() => {
                    ul_autocomplete.innerHTML = '';
                    let url_autocomplete = `https://autocomplete.geocoder.api.here.com/6.2/suggest.json?query=${encodeURIComponent(obj_user.ipt_address.value)}&app_id=${encodeURIComponent(platform.l)}&app_code=${encodeURIComponent(platform.i)}`;
                    fetch(`${url_autocomplete}`, {
                        method: 'GET'
                    })
                        .then(response => {
                            return response.json();
                        })
                        .then(data => {
                            if (data.hasOwnProperty('suggestions')) {
                                data.suggestions.map((item, index) => {
                                    // CHECK DATA LENGTH
                                    if (index < 4) {
                                        let address = item.address;
                                        // CHECK ADDRESS LENGTH
                                        if (Object.keys(address).length > 1) {
                                            // ADDRESS TEMPLATE
                                            let obj_template = {
                                                street: address.street !== undefined ? `${address.street}, ` : '',
                                                city: address.city !== undefined ? `${address.city}, ` : '',
                                                state: address.state !== undefined ? `${address.state}, ` : '',
                                                postalCode: address.postalCode !== undefined ? `${address.postalCode}, ` : ''
                                            },
                                                str_template = obj_template.street + obj_template.city + obj_template.state + obj_template.postalCode,
                                                li = document.createElement('li');
                                            li.innerText = str_template.substr(0, str_template.length - 2);
                                            // LI EVENT
                                            li.addEventListener('click', () => { autocompleteSelected(li) });
                                            ul_autocomplete.appendChild(li);
                                        }
                                    }
                                });
                            }
                        })
                        .catch(err => {
                            console.error(err.message);
                            appShowSnackBar(snackbar, 'Ocorreu um erro, por favor tente novamente');
                        })
                }, 1000);
            }
            else {
                appShowSnackBar(snackbar, 'Sem internet');
            }
        }
        else {
            ul_autocomplete.innerHTML = '';
        }
    });

    // RETURN EVENT
    btn_return.addEventListener('click', () => {
        window.location = 'index.html';
    });

    // HELP EVENT
    btn_help.addEventListener('click', () => {
        appShowDialog({
            element: dialog,
            title: 'Ajuda',
            message: 'Favor preencher os campos obrigatórios (*). Para preencher o endereço pode-se optar por informar um CEP conhecido e selecionar ENDEREÇO POR CEP ou selecionar ENDEREÇO POR LOCALIZAÇÃO para preencher o endereço com a localização atual.',
            btn_ok() { appHideDialog(dialog); }
        });
    });

    // REGISTER EVENT
    btn_register.addEventListener('click', () => {
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
        // CHECK USER NAME INPUT
        if (!/^[a-zA-Z0-9_.-]*$/.test(obj_user.ipt_name.value)) {
            obj_user.ipt_name.value = '';
            appShowSnackBar(snackbar, 'Nome de usuário inválido');
            return;
        }
        // CHECK PASSWORD INPUT
        if (!/^[a-zA-Z0-9_.-]*$/.test(obj_user.ipt_password.value)) {
            obj_user.ipt_password.value = '';
            appShowSnackBar(snackbar, 'Senha inválida');
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
                name: obj_user.ipt_name.value.trim(),
                password: obj_user.ipt_password.value.trim(),
                email: obj_user.ipt_email.value.trim(),
                address: obj_user.ipt_address.value.trim(),
                coordinates: ''
            };
            appShowLoading(spinner, spinner.children[0]);
            // NODE.JS API isAvailable
            fetch('/available', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })
                .then(result => { return result.json() })
                .then(data => {
                    // IF user PARAMS ARE NOT AVAILABLE
                    if (data.respTemplate.length > 0) {
                        appHideLoading(spinner, spinner.children[0]);
                        appShowSnackBar(snackbar, data.respTemplate[0]);
                        return;
                    }
                    let obj_here = {
                        searchText: obj_user.ipt_address.value.trim(),
                        jsonattributes: 1
                    };
                    geocode(platform, obj_here)
                        .then(location => {
                            let coord = location.response.view[0].result[0],
                                position = {
                                    lat: coord.location.displayPosition.latitude.toFixed(6),
                                    lng: coord.location.displayPosition.longitude.toFixed(6)
                                };
                            user.coordinates = `${position.lat}, ${position.lng}`;
                            // NODE.JS API createUser
                            fetch('/register', {
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

    // ADDRESS BY CEP EVENT
    btn_addressByCep.addEventListener('click', () => {
        // CHECK CEP INPUT
        if (ipt_cep.value === '') {
            appShowSnackBar(snackbar, 'Favor preencher o campo CEP');
            return;
        }
        if (!/^\d{8}$/.test(ipt_cep.value)) {
            ipt_cep.value = '';
            appShowSnackBar(snackbar, 'CEP inválido');
            return;
        }
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            // VIACEP WEBSERVICE - https://viacep.com.br/
            let url_cep = `https://viacep.com.br/ws/${encodeURIComponent(ipt_cep.value)}/json/`;
            appShowLoading(spinner, spinner.children[0]);
            fetch(url_cep, {
                method: 'GET'
            })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    // CHECK DATA CONTENT
                    if (data.hasOwnProperty('erro')) {
                        ipt_cep.value = '';
                        appHideLoading(spinner, spinner.children[0]);
                        appShowSnackBar(snackbar, 'CEP inválido');
                    }
                    else {
                        com_address.classList.add('is-dirty');
                        obj_user.ipt_address.value = `${data.logradouro}, ${data.localidade}, ${data.uf}, ${data.cep}`;
                        appHideLoading(spinner, spinner.children[0]);
                    }
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

    // ADDRESS BY LOCATION EVENT
    btn_addressByLocation.addEventListener('click', () => {
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            // CHECK BROWSER GEOLOCATION SUPPORT
            if ("geolocation" in navigator) {
                appShowLoading(spinner, spinner.children[0]);
                getPosition(locationOptions)
                    .then(response => {
                        let obj_position = {
                            latitude: response.coords.latitude.toFixed(6),
                            longitude: response.coords.longitude.toFixed(6)
                        },
                            obj_here = {
                                prox: `${obj_position.latitude}, ${obj_position.longitude}`, // THE ALTITUDE PARAMETER IS OPTIONAL (y,x,z)
                                mode: 'retrieveAddresses',
                                maxresults: '1',
                                jsonattributes: 1
                            };
                        reverseGeocode(platform, obj_here)
                            .then(location => {
                                let address = location.response.view[0].result[0].location.address;
                                // ADDRESS TEMPLATE
                                let obj_template = {
                                    street: address.street !== undefined ? `${address.street}, ` : '',
                                    city: address.city !== undefined ? `${address.city}, ` : '',
                                    state: address.state !== undefined ? `${address.state}, ` : '',
                                    postalCode: address.postalCode !== undefined ? `${address.postalCode}, ` : ''
                                },
                                    str_template = obj_template.street + obj_template.city + obj_template.state + obj_template.postalCode;
                                com_address.classList.add('is-dirty');
                                obj_user.ipt_address.value = str_template.substr(0, str_template.length - 2);
                                appHideLoading(spinner, spinner.children[0]);
                            })
                            .catch(err => {
                                console.error(err.message);
                                appHideLoading(spinner, spinner.children[0]);
                                appShowSnackBar(snackbar, 'Ocorreu um erro, por favor tente novamente');
                            })
                    })
                    .catch(err => {
                        // CHECK ERROR MESSAGE
                        if (err.message === 'User denied Geolocation') {
                            // CHECK BROWSER - MOZILLA ALLOWS TO REVOKE PERMISSIONS
                            if (navigator.userAgent.includes("Firefox")) {
                                appHideLoading(spinner, spinner.children[0]);
                                navigator.permissions.revoke({ name: 'geolocation' }).then(result => {
                                    report(result.state);
                                });
                            }
                            // OTHER BROWSERS NOT ALLOW TO REVOKE PERMISSIONS
                            else {
                                appHideLoading(spinner, spinner.children[0]);
                                appShowDialog({
                                    element: dialog,
                                    title: 'Erro',
                                    message: 'A permissão para localização foi negada, por favor acesse as configurações da aplicação para alterar.',
                                    btn_ok() { appHideDialog(dialog); }
                                });
                            }
                        }
                        else {
                            appHideLoading(spinner, spinner.children[0]);
                            appShowSnackBar(snackbar, 'Ocorreu um erro, por favor tente novamente');
                        }
                    })
            } else {
                appHideLoading(spinner, spinner.children[0]);
                appShowSnackBar(snackbar, 'Dispositivo sem suporte para localização');
            }
        }
        else {
            appShowSnackBar(snackbar, 'Sem internet');
        }
    });
})();