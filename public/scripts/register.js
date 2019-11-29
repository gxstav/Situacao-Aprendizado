(() => {
    'use strict'

    // USER OBJECT
    let obj_user = {
        // USER INPUTS
        ipt_name: document.getElementById('user_name'),
        ipt_password: document.getElementById('user_password'),
        ipt_email: document.getElementById('user_email')
    },
        // DIALOG
        dialog = document.getElementById('app_dialog'),
        // SNACKBAR
        snackbar = document.getElementById('app_snackbar'),
        // PASSWORD ICON
        icon = document.getElementById('icon_showPassword'),
        // SPINNER
        spinner = document.getElementById('app_loading'),
        // RETURN BUTTON
        btn_return = document.getElementById('app_return'),
        // HELP BUTTON
        btn_help = document.getElementById('app_help'),
        // REGISTER BUTTON
        btn_register = document.getElementById('app_register'),
        // SHOW PASSWORD SWITCH
        swi_showPassword = document.getElementById('app_showPassword');
    
    const showPasswordChanged = () => {
        // CHECK SHOW PASSWORD CHECKBOX
        if (swi_showPassword.checked === true) {
            obj_user.ipt_password.type = 'text';
            icon.innerHTML = 'visibility';
        }
        else {
            obj_user.ipt_password.type = 'password';
            icon.innerHTML = 'visibility_off';
        }
    };

    // RETURN EVENT
    btn_return.addEventListener('click', () => {
        window.location = 'index.html';
    });

    // HELP EVENT
    btn_help.addEventListener('click', () => {
        appShowDialog({
            element: dialog,
            title: 'Ajuda',
            message: 'Preencha os campos obrigatórios (*). Insira um nome de usuário e uma senha para obter acesso no aplicativo. Use um email verdadeiro.',
            btn_ok() { appHideDialog(dialog); }
        });
    });

    // SHOW PASSWORD EVENT
    swi_showPassword.addEventListener('change', () => {
        showPasswordChanged();
    });

    // CONFIRM USING ENTER
    document.getElementById('user_email').addEventListener("keyup" , (event) => { 
        if(event.keyCode === 13){
            event.preventDefault()
            btn_register.click()
        }});
    
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
            appShowSnackBar(snackbar, 'Preencha os campos obrigatórios (*)');
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
                email: obj_user.ipt_email.value.trim()
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
        }
        else {
            appShowSnackBar(snackbar, 'Sem internet');
        }
    });
})();