(() => {
    'use strict'

    // SERVICEWORKER
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            listLoop();
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
        request = window.indexedDB.open("busCAR", 1);
        request.onerror = function (event) {
            console.error("Erro ao abrir o banco de dados", event);
        }
        request.onupgradeneeded = function (event) {
            console.log("Atualizando");
            db = event.target.result;
            var objectStore = db.createObjectStore("vehicle", { keyPath: "vehicleId" });
        };
        request.onsuccess = function (event) {
            console.log("Banco de dados aberto com sucesso");
            db = event.target.result;
        }
    }

    const listLoop = () => {
        let list = [...document.getElementById('list_content').children[0].children[1].children]
        
        if(!localStorage.hasOwnProperty('dark_mode')){
            list.map(i =>{
                i.style = "background-color: #FFF; color: #000000"
                i.children[0].children[1].style = "background-color: #FFF; color: #000000"
                i.children[0].children[2].style = "background-color: #FFF; color: #808080"
            }) 
        }
        else{
            list.map(i =>{
                i.style = "background-color: #202124; color: #FFF"
                i.children[0].children[1].style = "background-color: #202124; color: #FFF"
                i.children[0].children[2].style = "background-color: #202124; color: #808080"
            }) 
        }
    }

    const addLoop = () => {
        // Spans , Inputs , Labels
        let formulario = [...document.getElementById('add_content').children[0].children];
        let titulos = formulario.filter(item => item.children.length == 0);
        let inputs = formulario.filter(item => item.children.length > 0);

        console.log(titulos)
        console.log(inputs)

        if(!localStorage.hasOwnProperty('dark_mode')){
            document.getElementById('app_register').style.color = '#FFF'
            titulos.map((div , i) => div.style = i != 13 ? "width: 70%;align-self: center; padding: 16px 0; text-align: justify;background-color:#FFF;color: #000000;" : "width: 180px; height: 130px; align-self: center; margin-bottom: 16px; border: 1px solid #757575")
            inputs.map((div , i) => div.style.color = i != 21 ? '#909090' : '#FFF')
            inputs.map((pai , i) => pai.children.map(filho => filho.style = filho.localName != 'input' ? 'color: #' : 'color: #000000' ))
        }
        else{
            document.getElementById('app_register').style.color = '#000000'
            titulos.map((div , i) => div.style = i != 13 ? "width: 70%; align-self: center; padding: 16px 0; text-align: justify;background-color:#202124;color: #FF9800;" : "width: 180px; height: 130px; align-self: center; margin-bottom: 16px; border: 1px solid #757575")
            inputs.map((div , i) => div.style.color = i != 21 ? '#909090' : '#000000')
        }
    }

    // VEHICLE OBJECT
    let obj_vehicle = {
        // VEHICLE INPUTS
        ipt_brand: document.getElementById('vehicle_brand'),
        ipt_model: document.getElementById('vehicle_model'),
        ipt_type: document.getElementsByName('vehicle_type'),
        ipt_value: document.getElementById('vehicle_value'),
        ipt_year: document.getElementById('vehicle_year'),
        ipt_color: document.getElementById('vehicle_color'),
        ipt_km: document.getElementById('vehicle_km'),
        ipt_fuel: document.getElementsByName('vehicle_fuel'),
        ipt_transmission: document.getElementsByName('vehicle_transmission'),
        ipt_phone: document.getElementById('vehicle_phone'),
        ipt_email: document.getElementById('vehicle_email'),
        ipt_description: document.getElementById('vehicle_description'),
        ipt_address: document.getElementById('vehicle_address')
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
        btn_picture = document.getElementById('vehicle_picture'),
        // PICTURE FRAME
        com_canvas = document.getElementById('vehicle_frame'),
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
        ul_vehicleList = document.getElementById('vehicle-list'),
        // WINDOW CONTENT FOR MATERIAL DESIGN LITE
        windowContent = document.querySelector('.mdl-layout__content'),
        // DARK MODE SWITCH
        dark = document.getElementById('switch-2'),
        // GET VEHICLE TYPE
        getVehicleType = el_group => {
            let _type = null;
            [...el_group].map(item => {
                if (item.checked) {
                    _type = item.value;
                }
            });
            return _type;
        },

        getVehicleTransmission = el_group => {
            let _transmission = null;
            [...el_group].map(item => {
                if (item.checked) {
                    _transmission = item.value;
                }
            });
            return _transmission;
        },

        getVehicleFuel = el_group => {
            let _fuel = null;
            [...el_group].map(item => {
                if (item.checked) {
                    _fuel = item.value;
                }
            });
            return _fuel;
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

        // POSTGRES DATE TO LOCAL DATE (DD/MM/AAAA - hh:mm:ss)
        formatDate = date => {
            let splitted = date.split('T')
            splitted[0] = splitted[0].split('-').reverse().join('/')
            splitted[1] = splitted[1].substr(0,8)
            return splitted.join(' - ')
        },
        // CREATES THE LIST
        createList = (el_list, data) => {
            el_list.innerHTML = '';
            let template = '';
            data.map(item => {
                let vehicle_date = formatDate(item.date);
                switch (item.type) {
                    case 'Carro':
                        template += `<li class="mdl-list__item mdl-list__item--two-line" id="${item.vehicleId}">
                        <span class="mdl-list__item-primary-content">
                            <i class="material-icons mdl-list__item-icon" style="color:#546EFD;">directions_car</i>
                            <span>${item.brand} ${item.model}</span>
                            <span class="mdl-list__item-sub-title">
                              ${item.type} - ${(vehicle_date).substr(0,vehicle_date.length - 3)}
                            </span>
                        </span>
                        </li>`;
                        break;
                    case 'Moto':
                        template += `<li class="mdl-list__item mdl-list__item--two-line" id="${item.vehicleId}">
                        <span class="mdl-list__item-primary-content">
                            <i class="material-icons mdl-list__item-icon" style="color:#FF9800;">motorcycle</i>
                            <span>${item.brand} ${item.model}</span>
                            <span class="mdl-list__item-sub-title">
                                ${item.type} - ${(vehicle_date).substr(0,vehicle_date.length - 3)}
                            </span>
                        </span>
                        </li>`;
                        break;
                    case 'Caminhao':
                        template += `<li class="mdl-list__item mdl-list__item--two-line" id="${item.vehicleId}">
                        <span class="mdl-list__item-primary-content">
                            <i class="material-icons mdl-list__item-icon" style="color:#424242;">directions_bus</i>
                            <span>${item.brand} ${item.model}</span>
                            <span class="mdl-list__item-sub-title">
                                ${item.type}/Ônibus - ${(vehicle_date).substr(0,vehicle_date.length - 3)}
                            </span>
                        </span>
                        </li>`;
                        break;
                    case 'Outro':
                        template += `<li class="mdl-list__item mdl-list__item--two-line" id="${item.vehicleId}">
                        <span class="mdl-list__item-primary-content">
                            <i class="material-icons mdl-list__item-icon" style="color:#121212;">directions_boat</i>
                            <span>${item.brand} ${item.model}</span>
                            <span class="mdl-list__item-sub-title">
                                ${item.type} - ${(vehicle_date).substr(0,vehicle_date.length - 3)}
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
                        let obj_vehicle = {
                            id: event.currentTarget.id
                        },
                        str_vehicle = JSON.stringify(obj_vehicle);
                        localStorage.setItem('vehicle', str_vehicle);
                        window.location = 'vehicle.html';
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
            center: { lat: -27.597476, lng: -48.549768 },
            zoom: 5
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
                let vehicle_icon = null,
                    vehicle_marker = null,
                    vehicle_date = formatDate(item.date),
                    latLng = item.coordinates.split(',');
                switch (item.type) {
                    case 'Carro':
                        // ICON
                        vehicle_icon = new H.map.Icon(svgMarker.replace('{FILL}', '#546EFD'), { size: { w: 24, h: 30 }, anchor: { x: 12, y: 17 } });
                        break;
                    case 'Moto':
                        // ICON
                        vehicle_icon = new H.map.Icon(svgMarker.replace('{FILL}', '#FF9800'), { size: { w: 28, h: 34 }, anchor: { x: 14, y: 17 } });
                        break;
                    case 'Caminhao':
                        // ICON
                        vehicle_icon = new H.map.Icon(svgMarker.replace('{FILL}', '#424242'), { size: { w: 28, h: 34 }, anchor: { x: 14, y: 17 } });
                        break;
                    case 'Outro':
                        // ICON
                        vehicle_icon = new H.map.Icon(svgMarker.replace('{FILL}', '#121212'), { size: { w: 28, h: 34 }, anchor: { x: 14, y: 17 } });
                        break;
                    default:
                        break;
                };


///////////////////// IMPORTANTE JUNTAR OS MARKERS ABAIXO POR BAIRRO /////////////////////


                // MARKER
                vehicle_marker = new H.map.Marker({ lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1]) }, { icon: vehicle_icon, data: `${item.type}<br>${item.brand} ${item.model}<br>${vehicle_date}`});
                // ADD THE MARKER TO THE GROUP  
                group.addObject(vehicle_marker);
            });

            // EVENT TO SHOW BUBBLE
            group.addEventListener('tap', event => {
                /// (2 TAPS ABRE DESCRIÇÃO DO VEÍCULO)
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

///////////////////////////////////////////////////////////////////////////////


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
    defaultLayers.normal.map.setMin(10);
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

    let vehicleData = null;

    // WINDOW EVENT TO CHECK AUTHENTICATION
    window.addEventListener('load', () => {
        // CHECK LOCALSTORAGE dark_mode
        listLoop();
        if (localStorage.hasOwnProperty('dark_mode')) {
            let str_darkMode = localStorage.getItem('dark_mode'),
            obj_dark = JSON.parse(str_darkMode);
            document.getElementById('dark_mode_switcher').classList.add('is-checked');
            dark.checked = obj_dark.active;
            // TURNING DARK
            // SIDE MENU
            com_menu.style = "background-color: #121212; color: #FF9800";
            document.getElementById('stl-drawer').style = "background-color: #121212; color:#FF9800;"
            document.getElementById('stl-drawer').children[0].style = "background-color: #121212; color:#FF9800;"
            document.getElementById('stl-drawer').children[1].style = "background-color: #121212; color:#FF9800;"
            document.getElementById('dark_mode_nav1').style = "color:#FF9800;"
            document.getElementById('dark_mode_nav2').style = "color:#FF9800;"
            document.getElementById('dark_mode_nav3').style = "color:#FF9800;"
            document.getElementById('dark_mode_switcher').style = "color:#FF9800;"
            
            // TOP MENU
            com_tabs.style = "background-color: #121212; color:#FF9800";
            document.getElementById('stl-header').style = "background-color: #121212; color:#FF9800";
            document.getElementById('tab_map').style = "background-color: #121212; color:#FF9800";
            document.getElementById('tab_list').style = "background-color: #121212; color:#FF9800";
            document.getElementById('tab_add').style = "background-color: #121212; color:#FF9800";
            document.getElementById('stl-header').children[0].style = "color:#FF9800";

            //CATALOG
            document.getElementById('list_content').style.backgroundColor = "#202124";
            document.getElementById('list_content').children[0].children[0].style = "text-align: center; color: #FF9800; margin-left: 5%";
            // CAIXA DE DIÁLOGO
            dialog.children[0].style = "background-color: #121212;"
            dialog.children[0].children[0].style = "color: #cdcdcd;"
            dialog.children[0].children[1].children[0].style = "color: #808080;"

        }
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
                // NODE.JS API getVehicles
                fetch('/vehicles', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${obj_auth.token}`
                    }
                })
                    .then(result => { 
                        return result.json()})
                    .then(data => {
                        vehicleData = [...data.respTemplate];
                        // ADD SVG MARKER TO THE MAP
                        addSVGMarkers(map, vehicleData);
                        // ADD ITEMS TO THE LIST
                        createList(ul_vehicleList, vehicleData);

                        // INDEXED DB
                        var transaction = db.transaction(["vehicle"], "readwrite");
                        transaction.oncomplete = function (event) {
                            console.log("Sucesso");
                        };
                        transaction.onerror = function (event) {
                            console.error("Erro");
                        };
                        var objectStore = transaction.objectStore("vehicle");
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

            let dbVehicle = [],
                transaction = db.transaction(['vehicle'], 'readonly'),
                objectStore = transaction.objectStore('vehicle');
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    dbVehicle.push(cursor.value);
                    cursor.continue();
                }
                else {
                    // ADD SVG MARKER TO THE MAP
                    addSVGMarkers(map, dbVehicle);
                    // ADD ITEMS TO THE LIST
                    createList(ul_vehicleList, dbVehicle);
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
            message: 'Na aba MAPA você pode visualizar os veículos cadastrados por outros usuários, você pode adicionar filtros para visualizações específicas, visualizar os locais de maior e menor quantidade de veículos anunciados e visualizar os detalhes do veículo anunciado.\nNa aba CATÁLOGO você pode visualizar todos os veículos cadastrados no banco de dados e informações gerais dos mesmos.\nNa aba ADICIONAR você pode cadastrar um novo veículo.',
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
                    addSVGMarkers(map, vehicleData);
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
                    startClustering(map, vehicleData);
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

    // INPUT PHONE FORMAT (xx)xxxxx-xxxx
    obj_vehicle.ipt_phone.addEventListener('input', function (evento) {
        if(evento.target.value.length < 15){
            var x = evento.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,4})(\d{0,4})/);
            evento.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        }else{
            var x = evento.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            evento.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        }
        
    });

    // ONFOCUS INPUT PHONE
    obj_vehicle.ipt_phone.addEventListener('focus', (evento) =>{
        if(evento.target.value.length > 0 && evento.target.value.length < 14){
            evento.target.value = ''
        }
    })

    // ONBLUR INPUT PHONE
    obj_vehicle.ipt_phone.addEventListener('blur', (evento) =>{
        if(evento.target.value.length > 0 && evento.target.value.length < 14){
            appShowSnackBar(snackbar, 'Número incompleto.');
        }
    })

    // INPUT CURRENCY FORMAT xx.xxx.xxx
    obj_vehicle.ipt_value.addEventListener('input', function (evento) {
            var x = evento.target.value.replace(/\D/g, '').match(/([0-9]{0,2})([0-9]{0,3})([0-9]{0,3})/);
            let n = [...x[0]]
            evento.target.value = x[0].length < 4 ? x[0] 
            : x[0].length == 4 ? `${n[0]}.${n[1]}${n[2]}${n[3]}` 
            : x[0].length == 5 ? `${n[0]}${n[1]}.${n[2]}${n[3]}${n[4]}`
            : x[0].length == 6 ? `${n[0]}${n[1]}${n[2]}.${n[3]}${n[4]}${n[5]}`
            : x[0].length == 7 ? `${n[0]}.${n[1]}${n[2]}${n[3]}.${n[4]}${n[5]}${n[6]}`
            : x[0].length == 8 ? `${n[0]}${n[1]}.${n[2]}${n[3]}${n[4]}.${n[5]}${n[6]}${n[7]}`
            : x[0]
    });

    // FILTER EVENT
    btn_filter.addEventListener('click', () => {
        if (com_tabs[0].classList.contains('is-active')) {
            // CHECK ONLINE STATE
            if (navigator.onLine) {
                appShowFilter(div_filter);

                div_filter.children[0].children[1].children[6].children[0].addEventListener('click', () => {
                    let dist = div_filter.children[0].children[1].children[6].children[1];
                    if (dist.value >= 100 && dist.value < 5000) {
                        dist.value = parseInt(dist.value) + 50;
                    }
                });

                div_filter.children[0].children[1].children[6].children[2].addEventListener('click', () => {
                    let dist = div_filter.children[0].children[1].children[6].children[1];
                    if (dist.value > 100 && dist.value <= 5000) {
                        dist.value = parseInt(dist.value) - 50;
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
                            latitude: response.coords.latitude.toFixed(7),
                            longitude: response.coords.longitude.toFixed(7)
                        };

                        let dist = div_filter.children[0].children[1].children[6].children[1],
                            vehicleType = document.getElementsByName('vehicle_typeF');

                        let str_auth = localStorage.getItem('auth'),
                            obj_auth = JSON.parse(str_auth),
                            filter = {
                                coordinates: `${obj_position.latitude}, ${obj_position.longitude}`,
                                type: getVehicleType(vehicleType),
                                distance: (parseInt(dist.value) / 1000) / 111.12
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
                                vehicleData = [...data.respTemplate];

                                appShowSnackBar(snackbar, `Resultado: ${vehicleData.length}`);

                                // ADD SVG MARKER TO THE MAP
                                addSVGMarkers(map, [...data.respTemplate]);
                                // ADD ITEMS TO THE LIST
                                createList(ul_vehicleList, [...data.respTemplate]);

                                addCircleToMap(map, { lat: obj_position.latitude, lng: obj_position.longitude }, parseInt(dist.value))

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
            // NODE.JS API getVehicle
            fetch('/vehicles', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${obj_auth.token}`
                }
            })
                .then(result => { return result.json() })
                .then(data => {
                    vehicleData = [...data.respTemplate];
                    // ADD SVG MARKER TO THE MAP
                    addSVGMarkers(map, [...data.respTemplate]);
                    // ADD ITEMS TO THE LIST
                    createList(ul_vehicleList, [...data.respTemplate]);

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
            message: 'Esta Aplicação foi desenvolvida como trabalho de conclusão do curso superior de desenvolvimento de sistemas, do Campus Tecnológico Avançado da Indústria - SENAI/CTAI Florianópolis.\nA aplicação, em sua fase inicial, é um piloto para a Região Metropolitana de Florianópolis e tem como finalidade "Auxiliar na compra e venda de veículos".\nO trabalho foi orientado por Clóvis Lemos Tavares e desenvolvido por Gustavo Barcelos e Matheus Nunes.',
            btn_ok() { appHideDialog(dialog); }
        });
    });

    // LOGOUT EVENT
    com_menu.children[2].addEventListener('click', () => {
        appShowDialog({
            element: dialog,
            title: 'Sair',
            message: 'Você realmente deseja sair da aplicação ?',
            btn_no() { appHideDialog(dialog); },
            btn_yes() {
                localStorage.removeItem('auth');
                window.location = 'index.html';
            }
        });
    });

    // REMEMBER DARK MODE OPTION
    dark.addEventListener('change', (evento) => {
        // CHECK REMIND ME CHECKBOX
        if (!evento.target.checked) {
            // TURN BACK TO WHITE
            localStorage.clear();
            com_menu.style = "background-color: #FF9800; color: #000000";
            // SIDE MENU
            com_menu.style = "background-color: #FF9800; color: #000000";
            document.getElementById('stl-drawer').style = "background-color: #FF9800; color: #000000"
            document.getElementById('stl-drawer').children[0].style = "background-color: #FF9800; color: #000000"
            document.getElementById('stl-drawer').children[1].style = "background-color: #FF9800; color: #000000"
            document.getElementById('dark_mode_nav1').style = "color: #000000"
            document.getElementById('dark_mode_nav2').style = "color: #000000"
            document.getElementById('dark_mode_nav3').style = "color: #000000"
            document.getElementById('dark_mode_switcher').style = "color: #000000"
            
            // TOP MENU
            com_tabs.style = "background-color: #FF9800; color: #000000";
            document.getElementById('stl-header').style = "background-color: #FF9800; color: #000000";
            document.getElementById('tab_map').style = "background-color: #FF9800; color: #000000";
            document.getElementById('tab_list').style = "background-color: #FF9800; color: #000000";
            document.getElementById('tab_add').style = "background-color: #FF9800; color: #000000";
            document.getElementById('stl-header').children[0].style = "color: #000000";

            //CATALOG
            document.getElementById('list_content').style.backgroundColor = "#FFF";
            document.getElementById('list_content').children[0].children[0].style = "text-align: center; color: #000000; margin-left: 5%";

            // CAIXA DE DIÁLOGO
            dialog.children[0].style = "background-color: #FFF;"
            dialog.children[0].children[0].style = "color: #303030;"
            dialog.children[0].children[1].children[0].style = "color: #000000;"

            // ADICIONAR VEHICLE
            document.getElementById('add_content').style = "background-color: #FFF;"
        }
        else {
            // TURN BACK TO BLACK
            // SIDE MENU
            com_menu.style = "background-color: #121212; color: #FF9800";
            document.getElementById('stl-drawer').style = "background-color: #121212; color:#FF9800;"
            document.getElementById('stl-drawer').children[0].style = "background-color: #121212; color:#FF9800;"
            document.getElementById('stl-drawer').children[1].style = "background-color: #121212; color:#FF9800;"
            document.getElementById('dark_mode_nav1').style = "color:#FF9800;"
            document.getElementById('dark_mode_nav2').style = "color:#FF9800;"
            document.getElementById('dark_mode_nav3').style = "color:#FF9800;"
            document.getElementById('dark_mode_switcher').style = "color:#FF9800;"
            
            // TOP MENU
            com_tabs.style = "background-color: #121212; color:#FF9800";
            document.getElementById('stl-header').style = "background-color: #121212; color:#FF9800";
            document.getElementById('tab_map').style = "background-color: #121212; color:#FF9800";
            document.getElementById('tab_list').style = "background-color: #121212; color:#FF9800";
            document.getElementById('tab_add').style = "background-color: #121212; color:#FF9800";
            document.getElementById('stl-header').children[0].style = "color:#FF9800";

            // CATALOG
            document.getElementById('list_content').style.backgroundColor = "#202124";
            document.getElementById('list_content').children[0].children[0].style = "text-align: center; color: #FF9800; margin-left: 5%";
            
            // CAIXA DE DIÁLOGO
            dialog.children[0].style = "background-color: #121212;"
            dialog.children[0].children[0].style = "color: #efefef;"
            dialog.children[0].children[1].children[0].style = "color: #909090;"

            // ADICIONAR VEHICLE
            document.getElementById('add_content').style = "background-color: #202124;"

            let obj_darkMode = {
                active: dark.checked,
            },
            str_darkMode = JSON.stringify(obj_darkMode);
            localStorage.setItem('dark_mode', str_darkMode);
        }
        listLoop();
        addLoop();
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
        listLoop();
    });

    // DISPLAYS ADD NEW VEHICLE CONTENT
    com_tabs[2].addEventListener('click', event => {
        displayContent(event.currentTarget.id);
        btn_float.style.display = 'none';
        addLoop();
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
                            latitude: response.coords.latitude.toFixed(7),
                            longitude: response.coords.longitude.toFixed(7)
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
                                    neighborhood: address.neighborhood !== undefined ? `${address.neighborhood}, ` : '',
                                    state: address.state !== undefined ? `${address.state}, ` : '',
                                    postalCode: address.postalCode !== undefined ? `${address.postalCode}, ` : ''
                                },
                                    str_template = obj_template.street + obj_template.city + obj_template.neighborhood + obj_template.state + obj_template.postalCode;
                                com_address.classList.add('is-dirty');
                                obj_vehicle.ipt_address.value = str_template.substr(0, str_template.length - 2);
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

    // REGISTER A VEHICLE EVENT
    btn_register.addEventListener('click', () =>{ 
        // CHECK USER INPUTS
        if (obj_vehicle.ipt_brand.value === '' || obj_vehicle.ipt_model.value === '' || obj_vehicle.ipt_value.value === '' || obj_vehicle.ipt_type.value === '' || obj_vehicle.ipt_color.value === '' || obj_vehicle.ipt_year.value === '' || obj_vehicle.ipt_km.value === '' || obj_vehicle.ipt_fuel.value === '' || obj_vehicle.ipt_transmission.value === '' || obj_vehicle.ipt_address.value === '') {
            appShowSnackBar(snackbar, 'Favor preencher os campos obrigatórios (*)');
            return;
        } 
        if (obj_vehicle.ipt_phone.value === '' && obj_vehicle.ipt_email.value === ''){
            appShowSnackBar(snackbar, 'Insira pelo menos um método de contato! (Recomendado)')
            return;
        }
        // CHECK ONLINE STATE
        if (navigator.onLine) {
            let str_auth = localStorage.getItem('auth'),
                obj_auth = JSON.parse(str_auth);

            let time = new Date(),
                seconds = (time.getSeconds()) < 10 ? "0".concat((time.getSeconds())) : (time.getSeconds()),
                ipt_date = `${time.getFullYear()}-${time.getMonth()+1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${seconds}`,
                vehicle = {
                    userId: obj_auth.id,
                    brand: obj_vehicle.ipt_brand.value.trim(),
                    model: obj_vehicle.ipt_model.value.trim(),
                    type: getVehicleType(obj_vehicle.ipt_type),
                    value: obj_vehicle.ipt_value.value.trim(),
                    year: obj_vehicle.ipt_year.value,
                    color: obj_vehicle.ipt_color.value.trim(),
                    km: obj_vehicle.ipt_km.value,
                    fuel: getVehicleFuel(obj_vehicle.ipt_fuel),
                    transmission: getVehicleTransmission(obj_vehicle.ipt_transmission),
                    phone: obj_vehicle.ipt_phone.value,
                    email: obj_vehicle.ipt_email.value,
                    description: obj_vehicle.ipt_description.value.trim(),
                    picture: binaryString,
                    address: obj_vehicle.ipt_address.value.trim(),
                    coordinates: obj_coordinate,
                    date: ipt_date,
                    status: [0, 0]
                };
            appShowLoading(spinner, spinner.children[0]);
            // NODE.JS API createVehicle
            fetch('/addVehicle', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${obj_auth.token}`
                },
                body: JSON.stringify(vehicle)
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