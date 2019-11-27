(() => {
    'use strict'

    let com_canvas = document.getElementById('vehicle_frame'),
        ctx = com_canvas.getContext("2d"),
        can_width = 180,
        can_height = 130,
        // HELP BUTTON
        btn_help = document.getElementById('app_help'),
        // RESCUE BUTTON
        btn_rescue = document.getElementById('app_rescue'),
        // RETURN BUTTON
        btn_return = document.getElementById('app_return'),
        // DIALOG
        dialog = document.getElementById('app_dialog'),
        // SNACKBAR
        snackbar = document.getElementById('app_snackbar'),
        // SPINNER
        spinner = document.getElementById('app_loading'),
        vehicle_description = document.getElementById('vehicle_description');

    let userIdVehicle;

    const formatDate = date => {
        let splitted = date.split('T')
        splitted[0] = splitted[0].split('-').reverse().join('/')
        splitted[1] = splitted[1].substr(0,8)
        return splitted.join(' - ')
    }

    // WINDOW EVENT TO CHECK AUTHENTICATION
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
                        if (!data.authenticated) {
                            window.location = 'index.html';
                        }
                    })
                    .catch(err => {
                        console.error(err.message);
                        window.location = 'index.html';
                    });
                if (localStorage.hasOwnProperty('vehicle')) {
                    let str_vehicle = localStorage.getItem('vehicle'),
                    obj_vehicle = JSON.parse(str_vehicle);
                    // NODE.JS API getvehicle
                    fetch(`/vehicle/${obj_vehicle.id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${obj_auth.token}`
                        }
                    })
                        .then(result => { return result.json() })
                        .then(data => {
                            // DATA ARRAYBUFFER TO BASE 64 STRING
                            let base64String = String.fromCharCode.apply(null, new Uint16Array(data.respTemplate.picture.data)),
                                vehicle_date = formatDate(data.respTemplate.date),
                                template = null,
                                // CREATES A IMAGE
                                img = new Image();
                            userIdVehicle = data.respTemplate.userId;
                            img.src = base64String;
                            // RESIZE THE IMAGE
                            img.onload = () => {
                                ctx.clearRect(0, 0, can_width, can_height);
                                com_canvas.width = can_width;
                                com_canvas.height = can_height;
                                // DRAW THE IMAGE ON CANVAS
                                ctx.drawImage(img, 0, 0, can_width, can_height);
                            },
                                img.onerror = err => console.error(err.message);

                            template = `Tipo: ${data.respTemplate.type}<br><br>
                            Marca: ${data.respTemplate.brand}<br><br>
                            Modelo: ${data.respTemplate.model}<br><br>
                            Ano: ${data.respTemplate.year}<br><br>
                            Cores: ${data.respTemplate.color}<br><br>
                            Data de Cadastro:  ${(vehicle_date).substr(0,vehicle_date.length - 3)}<br><br>
                            R$ ${data.respTemplate.value}<br><br>
                            Localização: ${data.respTemplate.address}<br><br>
                            Descrição: ${data.respTemplate.description}`;
                            vehicle_description.innerHTML = template;
                            appHideLoading(spinner, spinner.children[0]);

                        })
                        .catch(err => {
                            console.error(err.message);
                            appShowLoading(spinner, spinner.children[0]);
                            appShowSnackBar(snackbar, 'Ocorreu um erro, por favor tente novamente');
                        })
                }
                else {
                    window.location = 'index.html';
                }
            }
            else {
                window.location = 'index.html';
            }
        }
        else {
            window.location = 'index.html';
        }
    });

    // HELP EVENT
    btn_help.addEventListener('click', () => {
        appShowDialog({
            element: dialog,
            title: 'Ajuda',
            message: 'Favor verificar as informações do animal e se você for ajudar o mesmo, favor clicar no ícone de coração RESGATAR. Por favor só realize está operação se você realmente for ajudar o animal, pois ao fazer isso o mesmo será removido do banco de dados.',
            btn_ok() { appHideDialog(dialog); }
        });
    });

    // RETURN EVENT
    btn_return.addEventListener('click', () => {
        window.location = 'map.html';
    });

    // RESCUE EVENT
    btn_rescue.addEventListener('click', () => {
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            appShowDialog({
                element: dialog,
                title: 'Resgate',
                message: 'Por favor prossiga clicando em SIM para retirar o anúncio. Realize esta operação caso tenha vendido ou não possui mais interesse vender o veículo, pois ao fazer esta operação, o veículo será removido do banco de dados impossibilitando que outras pessoas encontrem-o.',
                btn_no() { appHideDialog(dialog); },
                btn_yes() {
                    let str_auth = localStorage.getItem('auth'),
                        obj_auth = JSON.parse(str_auth),
                        str_vehicle = localStorage.getItem('vehicle'),
                        obj_vehicle = JSON.parse(str_vehicle),
                        rescue = {
                            status: [1, obj_auth.id],
                            vehicleId: obj_vehicle.id
                        };
                if(obj_auth.id == userIdVehicle){
                    appShowLoading(spinner, spinner.children[0]);
                    // NODE.JS API rescue
                    fetch('/rescue', {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${obj_auth.token}`
                        },
                        body: JSON.stringify(rescue)
                    })
                        .then(result => { return result.json() })
                        .then(data => {
                            appHideLoading(spinner, spinner.children[0]);
                            appShowDialog({
                                element: dialog,
                                title: data.title,
                                message: data.message,
                                btn_ok() { window.location = 'map.html' }
                            });
                        })
                        .catch(err => {
                            console.error(err.message);
                            appHideLoading(spinner, spinner.children[0]);
                            appShowSnackBar(snackbar, 'Ocorreu um erro, por favor tente novamente');
                        });
                    }
                    else {
                        appShowSnackBar(snackbar, 'Apenas o usuário que criou o anúncio pode excluir!');
                    }
                }
            });
        }
        else {
            appShowSnackBar(snackbar, 'Sem internet');
        }
    });
})();
