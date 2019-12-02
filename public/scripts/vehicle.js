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
        if (!localStorage.hasOwnProperty('dark-mode')){
            document.getElementById('dm-body').style.backgroundColor = "#EEE"
        }else{
            document.getElementById('dm-body').style.backgroundColor = "#010101"
        }
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
                            let str_auth = localStorage.getItem('auth'), obj_auth = JSON.parse(str_auth);
                            if(obj_auth.id !== data.respTemplate.userId){
                                btn_rescue.style.display = 'none';
                            }
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
                            let real = data.respTemplate.value;
                            
                            template = `<h2 style="text-align:left" margin-top: 0;>${data.respTemplate.brand} ${data.respTemplate.model}</h2>
                                        <h3 style="color:#FF9800; text-align:left;"> R$ ${data.respTemplate.value}</h3><br>
                                        <table style="border-collapse:collapse;border-spacing:0;table-layout: fixed; width: 237px" class="tg">
                                            <tr>
                                                <td style="font-family:Arial, sans-serif;font-size:14px;padding:0px 20px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:inherit;text-align:right;vertical-align:top"><i class="material-icons">date_range</i></td>
                                                <td style="font-family:Arial, sans-serif;font-size:14px;padding:0px 20px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:inherit;text-align:left;vertical-align:top">${data.respTemplate.year}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-family:Arial, sans-serif;font-size:14px;padding:0px 20px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:inherit;text-align:right;vertical-align:top"><i class="material-icons">palette</i></td>
                                                <td style="font-family:Arial, sans-serif;font-size:14px;padding:0px 20px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:inherit;text-align:left;vertical-align:top">${data.respTemplate.color}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-family:Arial, sans-serif;font-size:14px;padding:0px 20px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:inherit;text-align:right;vertical-align:top"><i class="material-icons">straighten</i></td>
                                                <td style="font-family:Arial, sans-serif;font-size:14px;padding:0px 20px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:inherit;text-align:left;vertical-align:top">${data.respTemplate.km} Km</td>
                                            </tr>
                                            <tr>
                                                <td style="font-family:Arial, sans-serif;font-size:14px;padding:0px 20px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:inherit;text-align:right;vertical-align:top"><i class="material-icons">local_gas_station</i></td>
                                                <td style="font-family:Arial, sans-serif;font-size:14px;padding:0px 20px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:inherit;text-align:left;vertical-align:top">${data.respTemplate.fuel}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-family:Arial, sans-serif;font-size:14px;padding:0px 20px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:inherit;text-align:right;vertical-align:top"><i class="material-icons">settings_applications</i></td>
                                                <td style="font-family:Arial, sans-serif;font-size:14px;padding:0px 20px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:inherit;text-align:left;vertical-align:top">${data.respTemplate.transmission}</td>
                                            </tr>
                                        </table><br>
                                        <h4>Localização</h4><p>${data.respTemplate.address}</p><br>
                                        <h4>Telefone para contato</h4> <p>${data.respTemplate.phone}</p><br>
                                        <h4>Email para contato</h4> <p>${data.respTemplate.email}</p><br>
                                        <h4>Descrição</h4> <p>${data.respTemplate.description}</p>
                                        <h4>Data de postagem</h4> <p>${(vehicle_date).substr(0,vehicle_date.length - 3)}</p>`;

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
            message: 'Você pode visualizar os detalhes do veículo, caso tenha interesse, clique no botão CONTACTAR. Caso você seja o dono do anúncio, você pode retirar-lo aqualquer momento.',
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
                title: 'Remover Anúncio',
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
            });
        }
        else {
            appShowSnackBar(snackbar, 'Sem internet');
        }
    });
})();
