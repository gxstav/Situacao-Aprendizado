// FUNCTION TO SHOW SNACKBAR
let appShowSnackBar = (element, msg) => {
    let data = { message: msg };
    element.MaterialSnackbar.showSnackbar(data);
},
    // FUNCTION TO SHOW DIALOG
    appShowDialog = obj => {
        // REMOVE DIALOG BUTTON
        obj.element.children[0].children[2].innerHTML = '';
        // ADD DIALOG CONTENT
        obj.element.children[0].children[0].innerText = obj.title;
        obj.element.children[0].children[1].children[0].innerText = obj.message;
        // CASE DIALOG TYPE OK
        if (obj.hasOwnProperty('btn_ok')) {
            let btn_ok = document.createElement('button');
            btn_ok.innerText = 'OK';

            btn_ok.style= "background-color: #FFF; color: #000000;";

            btn_ok.addEventListener('mouseenter', () => {
                btn_ok.style= "color: gray";
            });
                btn_ok.addEventListener('mouseleave', () => {
                btn_ok.style= "color: black";
            })
            btn_ok.addEventListener('click', () => {
                obj.btn_ok();
            });
            
            if(localStorage.hasOwnProperty('dark_mode')){
                btn_ok.style= "background-color: #121212; color: #cdcdcd;";
                btn_ok.addEventListener('mouseenter', () => {
                    btn_ok.style= "background-color: #121212; color: #606060;";
                });
                    btn_ok.addEventListener('mouseleave', () => {
                    btn_ok.style= "background-color: #121212; color: #cdcdcd;";
                })
                btn_ok.addEventListener('click', () => {
                    obj.btn_ok();
                });
            } 
            
            // ADD DIALOG BUTTON
            obj.element.children[0].children[2].appendChild(btn_ok);
            obj.element.style.display = 'flex';
            document.documentElement.style.overflow = 'hidden';
            return;
        }
        // CASE DIALOG TYPE NO AND YES
        if (obj.hasOwnProperty('btn_no') && obj.hasOwnProperty('btn_yes')) {
            let btn_no = document.createElement('button'),
                btn_yes = document.createElement('button');
            btn_no.innerText = 'NÃO';
            btn_yes.innerText = 'SIM';
            btn_no.style = "background-color: #FFF; color: #000000;";
            btn_yes.style = "background-color: #FFF; color: #000000;";

            // BUTTON NO DEFAULT
            btn_no.addEventListener('mouseenter', () => {
                btn_no.style= "color: gray";
            });
                btn_no.addEventListener('mouseleave', () => {
                btn_no.style= "color: black";
            });

            // BUTTON YES DEFAULT
            btn_yes.addEventListener('mouseenter', () => {
                btn_yes.style= "color: gray";
            });
                btn_yes.addEventListener('mouseleave', () => {
                btn_yes.style= "color: black";
            });


            if(localStorage.hasOwnProperty('dark_mode')){
                // BUTTON NO BLACK
                btn_no.style = "background-color: #121212; color: #cdcdcd;";
                btn_no.addEventListener('mouseenter', () => {
                    btn_no.style= "background-color: #121212; color: #606060;";
                });
                btn_no.addEventListener('mouseleave', () => {
                btn_no.style= "background-color: #121212; color: #cdcdcd;";
                });

                // BUTTON YES BLACK
                btn_yes.style = "background-color: #121212; color: #cdcdcd;";
                btn_yes.addEventListener('mouseenter', () => {
                    btn_yes.style= "background-color: #121212; color: #606060;";
                });
                btn_yes.addEventListener('mouseleave', () => {
                btn_yes.style= "background-color: #121212; color: #cdcdcd;";
                });
            }

            btn_no.addEventListener('click', () => {
                obj.btn_no();
            });

            btn_yes.addEventListener('click', () => {
                obj.btn_yes();
            });
            
            // ADD DIALOG BUTTONS
            obj.element.children[0].children[2].appendChild(btn_no);
            obj.element.children[0].children[2].appendChild(btn_yes);
            obj.element.style.display = 'flex';
            document.documentElement.style.overflow = 'hidden';
            return;
        }
    },
    // FUNCTION TO HIDE DIALOG
    appHideDialog = element => {
        element.style.display = 'none';
        document.documentElement.style.overflow = 'scroll';
    },
    // FUNCTION TO SHOW LOADING
    appShowLoading = (el_background, el_loading) => {
        el_background.style.display = 'flex';
        el_loading.classList.toggle('is-active')
        document.documentElement.style.overflow = 'hidden';
    },
    // FUNCTION TO HIDE LOADING
    appHideLoading = (el_background, el_loading) => {
        el_background.style.display = 'none';
        el_loading.classList.toggle('is-active')
        document.documentElement.style.overflow = 'scroll';
    },
    // FUNCTION TO GET CURRENT POSITION
    getPosition = options => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    },
    // SVG MARKER
    svgMarker = `<svg xmlns="http://www.w3.org/2000/svg" width="37" height="49.253" viewBox="0 0 37 49.253">
    <path id="União_122" data-name="União 122" d="M-409.5,13.251c-1.064-1.136-2.163-2.28-3.226-3.387a99.379,99.379,0,0,1-10.5-12.157,30.33,30.33,0,0,1-3.46-6.5A19.8,19.8,0,0,1-428-15.808a21.027,21.027,0,0,1,5.42-14.279A17.635,17.635,0,0,1-409.5-36a17.631,17.631,0,0,1,13.08,5.914A21.03,21.03,0,0,1-391-15.808a19.8,19.8,0,0,1-1.311,7.013,30.366,30.366,0,0,1-3.459,6.5,99.443,99.443,0,0,1-10.5,12.157c-1.063,1.107-2.162,2.251-3.226,3.387v0Z" transform="translate(428 36)" fill="{FILL}"/>
  </svg>`,
    // SVG MEASURE TOOL
    svgMeasure = '<svg xmlns="http://www.w3.org/2000/svg" height="50px" width="50px"><circle cx="25px" cy="25px" r="20" fill="#1f262a" stroke-opacity="0.5" /></svg>',
    // SVG CLUSTER
    svgCluster = '<svg xmlns="http://www.w3.org/2000/svg" height="50px" width="50px"><circle cx="25px" cy="25px" r="20" fill="#546efd" stroke-opacity="0.5" />' +
        '<text x="25" y="31" font-size="15pt" font-family="arial" font-weight="bold" text-anchor="middle" fill="white">{TEXT}</text>' +
        '</svg>',
    // SVG CLUSTER NOISE
    svgNoise = '<svg xmlns="http://www.w3.org/2000/svg" height="50px" width="50px"><circle cx="25px" cy="25px" r="20" fill="#FF9800" stroke-opacity="0.5" /></svg>',
    // FUNCTION TO SHOW FILTER
    appShowFilter = element => {
        element.style.display = 'flex';
        document.documentElement.style.overflow = 'hidden';
    },
    // FUNCTION TO HIDE FILTER
    appHideFilter = element => {
        element.style.display = 'none';
        document.documentElement.style.overflow = 'scroll';
    };