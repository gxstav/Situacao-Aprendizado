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

    // INDEXED DB
    let request, db;
    if (!window.indexedDB) {
        console.error("Sem suporte para IndexedDB");
    }
    else {
        request = window.indexedDB.open("petResgate", 1);
        request.onerror = function (event) {
            console.error("Erro ao abrir o banco de dados", event);
        }
        request.onupgradeneeded = function (event) {
            console.log("Atualizando");
            db = event.target.result;
            var objectStore = db.createObjectStore("pets", { keyPath: "petId" });
        };
        request.onsuccess = function (event) {
            console.log("Banco de dados aberto com sucesso");
            db = event.target.result;
        }
    }

    // PET OBJECT
    let obj_pet = {
        // PET INPUTS
        ipt_nickname: document.getElementById('pet_nickname'),
        ipt_type: document.getElementsByName('pet_type'),
        ipt_color: document.getElementsByName('pet_color'),
        ipt_condition: document.getElementsByName('pet_condition'),
        ipt_description: document.getElementById('pet_description'),
        ipt_address: document.getElementById('pet_address')
    },
        obj_coordinate = null,
        // DIALOG
        dialog = document.getElementById('app_dialog'),
        // SNACKBAR
        snackbar = document.getElementById('app_snackbar'),
        // SPINNER
        spinner = document.getElementById('app_loading'),
        // ADDRESS DIV
        com_address = document.getElementById('div_address'),
        // HELP BUTTON
        btn_help = document.getElementById('app_help'),
        // REGISTER BUTTON
        btn_register = document.getElementById('app_register'),
        // CLUSTER BUTTON
        btn_cluster = document.getElementById('app_cluster'),
        bool_cluster = false,
        // FILTER BUTTON
        btn_filter = document.getElementById('app_filter'),
        div_filter = document.getElementById('app_divFilter'),
        // PICTURE BUTTON
        btn_picture = document.getElementById('pet_picture'),
        // PICTURE FRAME
        com_canvas = document.getElementById('pet_frame'),
        binaryString = null,
        ctx = com_canvas.getContext("2d"),
        can_width = 180,
        can_height = 130,
        // MENU COMPONENTS
        com_menu = document.querySelector('.mdl-navigation'),
        // SECTIONS
        com_sections = document.querySelectorAll('main section'),
        // TABS
        com_tabs = document.querySelectorAll('.mdl-layout__tab-bar a'),
        // FLOAT BUTTON
        btn_float = document.getElementById('app_float'),
        // UL
        ul_petList = document.querySelector('.pet_list'),
        // WINDOW CONTENT FOR MATERIAL DESIGN LITE
        windowContent = document.querySelector('.mdl-layout__content'),
        // GET PET TYPE
        getPetType = el_group => {
            let _type = null;
            [...el_group].map(item => {
                if (item.checked) {
                    _type = item.value;
                }
            });
            return _type;
        },
        getPetColor = el_group => {
            let _color = [];
            [...el_group].map(item => {
                if (item.checked) {
                    _color.push(item.value);
                }
            });
            return _color.toString();
        },
        // DISPLAY CONTENT
        displayContent = el_id => {
            [...com_tabs].map((item, index) => {
                if (item.id === el_id) {
                    com_sections[index].style.display = 'block';
                }
                else {
                    com_sections[index].style.display = 'none';
                }
            })
        },
        // CREATES THE LIST
        createList = (el_list, data) => {
            el_list.innerHTML = '';
            let template = '';
            data.map(item => {
                let pet_date = item.date.substr(0, item.date.length - 14).split('-');
                switch (item.type) {
                    case 'Gato':
                        template += `<li class="mdl-list__item mdl-list__item--two-line" id="${item.petId}">
                        <span class="mdl-list__item-primary-content">
                            <i class="material-icons mdl-list__item-icon" style="color:#546EFD;">pets</i>
                            <span>${item.nickname}</span>
                            <span class="mdl-list__item-sub-title">
                              ${item.type} - ${pet_date[2]}-${pet_date[1]}-${pet_date[0]}
                            </span>
                        </span>
                        </li>`;
                        break;
                    case 'Cachorro':
                        template += `<li class="mdl-list__item mdl-list__item--two-line" id="${item.petId}">
                        <span class="mdl-list__item-primary-content">
                            <i class="material-icons mdl-list__item-icon" style="color:#FF9800;">pets</i>
                            <span>${item.nickname}</span>
                            <span class="mdl-list__item-sub-title">
                              ${item.type} - ${pet_date[2]}-${pet_date[1]}-${pet_date[0]}
                            </span>
                        </span>
                        </li>`;
                        break;
                    case 'Outro':
                        template += `<li class="mdl-list__item mdl-list__item--two-line" id="${item.petId}">
                        <span class="mdl-list__item-primary-content">
                            <i class="material-icons mdl-list__item-icon" style="color:#424242;">pets</i>
                            <span>${item.nickname}</span>
                            <span class="mdl-list__item-sub-title">
                              ${item.type} - ${pet_date[2]}-${pet_date[1]}-${pet_date[0]}
                            </span>
                        </span>
                        </li>`;
                        break;
                    default:
                        break;
                };
            });
            el_list.innerHTML = template;
            [...el_list.children].map(item => {
                item.addEventListener('click', event => {
                    // CHECK ONLINE STATE
                    if (navigator.onLine) {
                        let obj_pet = {
                            id: event.currentTarget.id
                        },
                            str_pet = JSON.stringify(obj_pet);
                        localStorage.setItem('pet', str_pet);
                        window.location = 'pet.html';
                    }
                    else {
                        appShowSnackBar(snackbar, 'Sem internet');
                    }
                });
            });
        },
        // LOCATION OPTIONS
        locationOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        },
        // HERE MAP
        target = document.getElementById('map'),
        // PIXEL PROPORTION
        pixelRatio = window.devicePixelRatio || 1,
        // BASE MAPS
        defaultLayers = platform.createDefaultLayers({
            tileSize: pixelRatio === 1 ? 256 : 512,
            ppi: pixelRatio === 1 ? undefined : 320
        }),
        // INITIALIZE MAP => CONSTRUCTOR element, baseLayer, opt_options
        map = new H.Map(target, defaultLayers.normal.map, {
            pixelRatio: pixelRatio,
            center: { lat: - 23.271444, lng: - 45.935995 },
            zoom: 9
        }),
        // MAKE THE MAP INTERACTIVE
        behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map)),
        // DEFAULT UI COMPONENTS
        ui = H.ui.UI.createDefault(map, defaultLayers, new H.ui.i18n.Localization('pt-BR')),
        // DISTANCE MEASSUREMENT TOOL
        distanceMeasurementTool = new H.ui.DistanceMeasurement({
            'startIcon': new H.map.Icon(svgMeasure, { anchor: { x: 20, y: 20 }, size: { w: 40, h: 40 } }),
            'stopoverIcon': new H.map.Icon(svgMeasure, { anchor: { x: 20, y: 20 }, size: { w: 40, h: 40 } }),
            'endIcon': new H.map.Icon(svgMeasure, { anchor: { x: 20, y: 20 }, size: { w: 40, h: 40 } }),
            'splitIcon': new H.map.Icon(svgMeasure, { anchor: { x: 20, y: 20 }, size: { w: 40, h: 40 } }),
            'lineStyle': {
                'strokeColor': 'rgba(31, 38, 42, .9)',
                'lineWidth': 6
            }
        }),
        // FUNCTION TO ADD SVG MARKERS
        group = null,
        addSVGMarkers = (map, data) => {
            // GROUP TO HOLD MAP BJECTS
            group = new H.map.Group();
            data.map(item => {
                let pet_icon = null,
                    pet_marker = null,
                    pet_date = item.date.substr(0, item.date.length - 14).split('-'),
                    latLng = item.coordinates.split(',');
                switch (item.type) {
                    case 'Gato':
                        // ICON
                        pet_icon = new H.map.Icon(svgMarker.replace('{FILL}', '#546EFD'), { size: { w: 24, h: 30 }, anchor: { x: 12, y: 17 } });
                        break;
                    case 'Cachorro':
                        // ICON
                        pet_icon = new H.map.Icon(svgMarker.replace('{FILL}', '#FF9800'), { size: { w: 28, h: 34 }, anchor: { x: 14, y: 17 } });
                        break;
                    case 'Outro':
                        // ICON
                        pet_icon = new H.map.Icon(svgMarker.replace('{FILL}', '#424242'), { size: { w: 28, h: 34 }, anchor: { x: 14, y: 17 } });
                        break;
                    default:
                        break;
                };
                // MARKER
                pet_marker = new H.map.Marker({ lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1]) }, { icon: pet_icon, data: `${item.nickname}<br>${item.type}<br>${pet_date[2]}-${pet_date[1]}-${pet_date[0]}` });
                // ADD THE MARKER TO THE GROUP  
                group.addObject(pet_marker);
            });

            // EVENT TO SHOW BUBBLE
            group.addEventListener('tap', event => {
                let currentBubble = ui.getBubbles(),
                    point = event.target.getPosition(),
                    t = event.target,
                    data = t.getData(),
                    tooltipContent = data,
                    infoBubble = new H.ui.InfoBubble(point, { content: tooltipContent });
                ui.removeBubble(currentBubble[0]);
                ui.addBubble(infoBubble);
            });
            // ADD THE GROUP TO THE MAP
            map.addObject(group);
        },
        circle = null,
        addCircleToMap = (map, coordinates, distance) => {
            circle = new H.map.Circle(
                // The central point of the circle
                coordinates,
                // The radius of the circle in meters
                distance,
                {
                    style: {
                        strokeColor: 'rgba(31, 38, 42, 1)',
                        lineWidth: 2,
                        fillColor: 'rgba(31, 38, 42, 0.3)'
                    }
                }
            )
            map.addObject(circle);
        },
        // FUNCTION TO CLUSTERING THE DATA
        clusteringLayer = null,
        startClustering = (map, data) => {
            // ARRAY OF DATA POINT OBJECTS
            let dataPoints = data.map(item => {
                let latLng = item.coordinates.split(',');
                return new H.clustering.DataPoint(parseFloat(latLng[0]), parseFloat(latLng[1]));
            }),
                // CREATE A CLUSTERING PROVIDER
                clusteredDataProvider = new H.clustering.Provider(dataPoints, {
                    clusteringOptions: {
                        eps: 30,
                        minWeight: 2
                    },
                    theme: {
                        getClusterPresentation: cluster => {
                            let svgString = svgCluster.replace('{radius}', cluster.getWeight() * 5);
                            svgString = svgString.replace('{TEXT}', cluster.getWeight());
                            let w = null,
                                h = null,
                                weight = cluster.getWeight();

                            if (weight <= 6) {
                                w = 40;
                                h = 40;
                            }
                            else if (weight <= 12) {
                                w = 65;
                                h = 65;
                            }
                            else {
                                w = 90;
                                h = 90;
                            }

                            let clusterIcon = new H.map.Icon(svgString, {
                                size: { w: w, h: h },
                                anchor: { x: (w / 2), y: (h / 2) }
                            }),
                                clusterMarker = new H.map.Marker(cluster.getPosition(), {
                                    icon: clusterIcon,
                                    min: cluster.getMinZoom(),
                                    max: cluster.getMaxZoom()
                                });
                            clusterMarker.setData(cluster);

                            return clusterMarker;
                        },
                        getNoisePresentation: noisePoint => {
                            let noiseIcon = new H.map.Icon(svgNoise, {
                                size: { w: 20, h: 20 },
                                anchor: { x: 10, y: 10 }
                            }),
                                noiseMarker = new H.map.Marker(noisePoint.getPosition(), {
                                    icon: noiseIcon,
                                    min: noisePoint.getMinZoom()
                                });
                            noiseMarker.setData(noisePoint);

                            return noiseMarker;
                        }
                    }
                });
            // LAYER TO CONSUME OBJECTS
            clusteringLayer = new H.map.layer.ObjectLayer(clusteredDataProvider);
            // ADD CLUSTER LAYER TO THE MAP
            map.addLayer(clusteringLayer);
        };

    // RESTRICT MAP AREA
    restrictMap(map);
    // RESTRICT MAP ZOOM
    defaultLayers.normal.map.setMin(9);
    // REMOVE MAPSETTINGS
    ui.removeControl('mapsettings');
    // ADD MEASURE TOOL
    ui.addControl('distancemeasurement', distanceMeasurementTool);
    // SET CONTROLS POSITION
    ui.getControl('zoom').setAlignment('left-middle');
    ui.getControl('distancemeasurement').setAlignment('right-middle');
    ui.getControl('scalebar').setAlignment('top-left');

    // WINDOW > FLOAT BUTTON ON SCROLL EVENT
    windowContent.addEventListener('scroll', () => {
        if (windowContent.scrollTop === 0) {
            btn_float.children[0].innerHTML = 'keyboard_arrow_down';
        }
        else {
            btn_float.children[0].innerHTML = 'keyboard_arrow_up';
        }
    });

    let petData = null;
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
                // NODE.JS API getPets
                fetch('/pets', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${obj_auth.token}`
                    }
                })
                    .then(result => { return result.json() })
                    .then(data => {
                        petData = [...data.respTemplate];
                        // ADD SVG MARKER TO THE MAP
                        addSVGMarkers(map, [...data.respTemplate]);
                        // ADD ITEMS TO THE LIST
                        createList(ul_petList, [...data.respTemplate]);

                        // INDEXED DB
                        var transaction = db.transaction(["pets"], "readwrite");
                        transaction.oncomplete = function (event) {
                            console.log("Sucesso");
                        };
                        transaction.onerror = function (event) {
                            console.error("Erro");
                        };
                        var objectStore = transaction.objectStore("pets");
                        objectStore.clear();
                        [...data.respTemplate].map(item => {
                            objectStore.add(item);
                        });

                        appHideLoading(spinner, spinner.children[0]);
                    })
                    .catch(err => {
                        console.error(err.message);
                        appHideLoading(spinner, spinner.children[0]);
                    });
            }
            else {
                window.location = 'index.html';
            }
        }
        else {
            appShowDialog({
                element: dialog,
                title: 'Offline',
                message: 'A maioria dos recursos da aplicação é desativado em modo offline, mas ainda é possível verificar a localização dos animais no mapa.',
                btn_ok() { appHideDialog(dialog); }
            });

            let dbPet = [],
                transaction = db.transaction(['pets'], 'readonly'),
                objectStore = transaction.objectStore('pets');
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    dbPet.push(cursor.value);
                    cursor.continue();
                }
                else {
                    // ADD SVG MARKER TO THE MAP
                    addSVGMarkers(map, dbPet);
                    // ADD ITEMS TO THE LIST
                    createList(ul_petList, dbPet);
                }
            };
        }
    });

    // // FLOAT BUTTON
    btn_float.addEventListener('click', () => {
        if (btn_float.children[0].innerHTML === 'keyboard_arrow_down') {
            windowContent.scroll({ top: windowContent.scrollHeight, left: 0, behavior: 'smooth' });
        }
        else {
            windowContent.scroll({ top: 0, left: 0, behavior: 'smooth' });
        }
    });

    // HELP EVENT
    btn_help.addEventListener('click', () => {
        appShowDialog({
            element: dialog,
            title: 'Ajuda',
            message: 'Na aba MAPA você pode visualizar os locais em que os animais foram cadastrados, adicionar filtros para visualizações específicas, visualizar os locais de maior e menor ocorrência de animais em situação de risco e visualizar um resumo das informações do animal.\nNa aba LISTA você pode visualizar todos os animais cadastrados em nosso banco de dados e informações gerais sobre os mesmos.\nNa aba ADICIONAR você pode cadastrar um novo animal em situação de risco.',
            btn_ok() { appHideDialog(dialog); }
        });
    });

    // CLUSTER EVENT
    btn_cluster.addEventListener('click', () => {
        if (com_tabs[0].classList.contains('is-active')) {
            // CLOSES OPENED BUBBLES
            let currentBubble = ui.getBubbles();
            ui.removeBubble(currentBubble[0]);
            // CHECKS THE CURRENT VISUALIZATION
            if (bool_cluster) {
                btn_cluster.innerHTML = 'group_work';
                // CHECK ONLINE STATE
                if (navigator.onLine) {
                    map.removeLayer(clusteringLayer);
                    // ADD SVG MARKER TO THE MAP
                    addSVGMarkers(map, petData);
                }
                else {
                    appShowSnackBar(snackbar, 'Sem internet');
                }
                bool_cluster = false;
            }
            else {
                btn_cluster.innerHTML = 'place';
                // CHECK ONLINE STATE
                if (navigator.onLine) {
                    map.removeObject(group);
                    // ADD SVG MARKER TO THE MAP
                    startClustering(map, petData);
                }
                else {
                    appShowSnackBar(snackbar, 'Sem internet');
                }
                bool_cluster = true;
            }
        }
        else {
            appShowSnackBar(snackbar, 'Por favor clique na aba MAPA');
        }
    });

    // FILTER EVENT
    btn_filter.addEventListener('click', () => {
        if (com_tabs[0].classList.contains('is-active')) {
            // CHECK ONLINE STATE
            if (navigator.onLine) {
                appShowFilter(div_filter);

                div_filter.children[0].children[1].children[5].children[0].addEventListener('click', () => {
                    let dist = div_filter.children[0].children[1].children[5].children[1];
                    if (parseInt(dist.innerHTML) >= 100 && parseInt(dist.innerHTML) < 1500) {
                        dist.innerHTML = parseInt(dist.innerHTML) + 50;
                    }
                });

                div_filter.children[0].children[1].children[5].children[2].addEventListener('click', () => {
                    let dist = div_filter.children[0].children[1].children[5].children[1];
                    if (parseInt(dist.innerHTML) > 100 && parseInt(dist.innerHTML) <= 1500) {
                        dist.innerHTML = parseInt(dist.innerHTML) - 50;
                    }
                });
            }
            else {
                appShowSnackBar(snackbar, 'Sem internet');
            }
        }
        else {
            appShowSnackBar(snackbar, 'Por favor clique na aba MAPA');
        }
    });

    // FILTER OK EVENT
    div_filter.children[0].children[2].children[1].addEventListener('click', () => {
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            map.removeObject(group);

            if (circle) {
                map.removeObject(circle);
                circle = null;
            }

            appHideFilter(div_filter);

            appShowLoading(spinner, spinner.children[0]);
            // CHECK BROWSER GEOLOCATION SUPPORT
            if ("geolocation" in navigator) {
                appShowLoading(spinner, spinner.children[0]);
                getPosition(locationOptions)
                    .then(response => {
                        let obj_position = {
                            latitude: response.coords.latitude.toFixed(6),
                            longitude: response.coords.longitude.toFixed(6)
                        };

                        let dist = div_filter.children[0].children[1].children[5].children[1],
                            petType = document.getElementsByName('pet_typeF');

                        let str_auth = localStorage.getItem('auth'),
                            obj_auth = JSON.parse(str_auth),
                            filter = {
                                coordinates: `${obj_position.latitude}, ${obj_position.longitude}`,
                                type: getPetType(petType),
                                distance: (parseInt(dist.innerHTML) / 1000) / 111.12
                            };

                        // NODE.JS API filter
                        fetch('/filter', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${obj_auth.token}`
                            },
                            body: JSON.stringify(filter)
                        })
                            .then(result => { return result.json() })
                            .then(data => {
                                petData = [...data.respTemplate];

                                appShowSnackBar(snackbar, `Resultado: ${petData.length}`);

                                // ADD SVG MARKER TO THE MAP
                                addSVGMarkers(map, [...data.respTemplate]);
                                // ADD ITEMS TO THE LIST
                                createList(ul_petList, [...data.respTemplate]);

                                addCircleToMap(map, { lat: obj_position.latitude, lng: obj_position.longitude }, parseInt(dist.innerHTML))

                                appHideLoading(spinner, spinner.children[0]);
                            })
                            .catch(err => {
                                console.error(err.message);
                                appHideLoading(spinner, spinner.children[0]);
                            });

                    })
                    .catch((err) => {
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
            appHideFilter(div_filter);
            appShowSnackBar(snackbar, 'Sem internet');
        }
    });

    // FILTER CANCEL EVENT
    div_filter.children[0].children[2].children[0].addEventListener('click', () => {
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            map.removeObject(group);
            if (circle) {
                map.removeObject(circle);
                circle = null;
            }

            appHideFilter(div_filter);

            let str_auth = localStorage.getItem('auth'),
                obj_auth = JSON.parse(str_auth);
            appShowLoading(spinner, spinner.children[0]);
            // NODE.JS API getPets
            fetch('/pets', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${obj_auth.token}`
                }
            })
                .then(result => { return result.json() })
                .then(data => {
                    petData = [...data.respTemplate];
                    // ADD SVG MARKER TO THE MAP
                    addSVGMarkers(map, [...data.respTemplate]);
                    // ADD ITEMS TO THE LIST
                    createList(ul_petList, [...data.respTemplate]);

                    appHideLoading(spinner, spinner.children[0]);
                })
                .catch(err => {
                    console.error(err.message);
                    appHideLoading(spinner, spinner.children[0]);
                });
        }
        else {
            appHideFilter(div_filter);
            appShowSnackBar(snackbar, 'Sem internet');
        }
    });

    // PROFILE EVENT
    com_menu.children[0].addEventListener('click', () => {
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            window.location = 'profile.html';
        }
        else {
            let event = new Event('click');
            document.getElementsByClassName('mdl-layout__obfuscator')[0].dispatchEvent(event);
            appShowSnackBar(snackbar, 'Sem internet');
        }
    });

    // CREDITS EVENT
    com_menu.children[1].addEventListener('click', () => {
        appShowDialog({
            element: dialog,
            title: 'Créditos',
            message: 'Esta Aplicação foi desenvolvida como trabalho de conclusão do curso superior de tecnologia em geoprocessamento, da faculdade de tecnologia de Jacareí - FATEC Jacareí.\nA aplicação é um piloto para as cidades de Jacareí e São José dos Campos e tem como tema o "Desenvolvimento de uma aplicação para auxiliar a identificação e localização de animais em situação de risco".\nO trabalho foi orientado por Clóvis Lemos Tavares e têm como autores Ana Carolina Pereira e Diego dos Santos Rodrigues.',
            btn_ok() { appHideDialog(dialog); }
        });
    });

    // LOGOUT EVENT
    com_menu.children[2].addEventListener('click', () => {
        appShowDialog({
            element: dialog,
            title: 'Sair',
            message: 'Você realmente deseja sair da aplicação?',
            btn_no() { appHideDialog(dialog); },
            btn_yes() {
                localStorage.removeItem('auth');
                window.location = 'index.html';
            }
        });
    });

    // DISPLAYS MAP CONTENT
    com_tabs[0].addEventListener('click', event => {
        displayContent(event.currentTarget.id);
        btn_float.style.display = 'none';
    });

    // DISPLAYS LIST CONTENT
    com_tabs[1].addEventListener('click', event => {
        displayContent(event.currentTarget.id);
        btn_float.style.display = 'flex';
    });

    // DISPLAYS ADD NEW ANIMAL CONTENT
    com_tabs[2].addEventListener('click', event => {
        displayContent(event.currentTarget.id);
        btn_float.style.display = 'none';
    });

    // TAKE A PICTURE EVENT
    btn_picture.addEventListener('change', event => {
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            // GET THE FILE IMAGE
            let file = event.target.files[0],
                // READ THE FILE AS A DATA URL
                reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                // CREATES A IMAGE
                let img = new Image();
                img.src = event.target.result;
                // RESIZE DE IMAGE
                img.onload = () => {
                    com_canvas.width = can_width;
                    com_canvas.height = can_height;
                    // DRAW THE IMAGE ON CANVAS
                    ctx.drawImage(img, 0, 0, can_width, can_height);
                    // IMAGE => BASE 64 => BD
                    binaryString = com_canvas.toDataURL("image/jpeg");
                },
                    img.onerror = err => console.error(err.message);
            },
                reader.onerror = err => console.error(err.message);

            appShowLoading(spinner, spinner.children[0]);
            // CHECK BROWSER GEOLOCATION SUPPORT
            if ("geolocation" in navigator) {
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
                        obj_coordinate = `${obj_position.latitude}, ${obj_position.longitude}`;
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
                                obj_pet.ipt_address.value = str_template.substr(0, str_template.length - 2);
                                appHideLoading(spinner, spinner.children[0]);
                            })
                            .catch(err => {
                                console.error(err.message);
                                appHideLoading(spinner, spinner.children[0]);
                                appShowSnackBar(snackbar, 'Ocorreu um erro, por favor tente novamente');
                            })
                    })
                    .catch((err) => {
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

    // REGISTER A PET EVENT
    btn_register.addEventListener('click', () => {
        // CHECK USER INPUTS
        let count = 0;
        if (obj_pet.ipt_nickname.value === '' || obj_pet.ipt_description.value === '' || obj_pet.ipt_address.value === '') {
            appShowSnackBar(snackbar, 'Favor preencher os campos obrigatórios (*)');
            return;
        }
        [...obj_pet.ipt_color].map(item => {
            if (item.checked) {
                count++;
            }
        });
        if (count === 0) {
            appShowSnackBar(snackbar, 'Favor preencher os campos obrigatórios (*)');
            return;
        }
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            let str_auth = localStorage.getItem('auth'),
                obj_auth = JSON.parse(str_auth),
                pet = {
                    userId: obj_auth.id,
                    nickname: obj_pet.ipt_nickname.value.trim(),
                    type: getPetType(obj_pet.ipt_type),
                    color: getPetColor(obj_pet.ipt_color),
                    injured: obj_pet.ipt_condition[0].checked ? true : false,
                    sick: obj_pet.ipt_condition[1].checked ? true : false,
                    fed: obj_pet.ipt_condition[2].checked ? true : false,
                    description: obj_pet.ipt_description.value.trim(),
                    address: obj_pet.ipt_address.value.trim(),
                    coordinates: obj_coordinate,
                    picture: binaryString,
                    status: [0, 0]
                };

            appShowLoading(spinner, spinner.children[0]);
            // NODE.JS API createPet
            fetch('/addPet', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${obj_auth.token}`
                },
                body: JSON.stringify(pet)
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
                    ctx.clearRect(0, 0, can_width, can_height);
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