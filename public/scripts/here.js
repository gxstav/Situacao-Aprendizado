// INITIALIZE THE HERE PLATFORM OBJECT 
let platform = new H.service.Platform({
    'app_id': 'LWRqikjS0dLon3ltytFO',
    'app_code': 'xmPBYm_cTeeLWIPCiINa6w',
    useHTTPS: true
}),
    // FUNCTION => SEARCH FOR A LOCATION BASED ON AN ADDRESS
    geocode = (platform, geocodingParameters) => {
        // INSTANCE OF THE GEOCODING SERVICE
        let geocoder = platform.getGeocodingService();
        // GEOCODE METHOD => ADDRESS PARAMETER, CALLBACK ON SUCCESS, CALLBACK ON ERROR
        return new Promise((resolve, reject) => {
            geocoder.geocode(
                geocodingParameters,
                resolve,
                reject
            );
        });
    },
    // FUNCTION => SEARCH FOR THE ADDRESS OF A KNOWN LOCATION
    reverseGeocode = (platform, reverseGeocodingParameters) => {
        // INSTANCE OF THE GEOCODING SERVICE
        let geocoder = platform.getGeocodingService();
        // REVERSE GEOCODE METHOD => COORDINATE PARAMETER, CALLBACK ON SUCCESS, CALLBACK ON ERROR
        return new Promise((resolve, reject) => {
            geocoder.reverseGeocode(
                reverseGeocodingParameters,
                resolve,
                reject
            );
        });
    },
    // FUNCTION TO RESTRICTS THE MAP
    restrictMap = map => {
        let bounds = new H.geo.Rect(-22.76660, -46.20264, -23.46941, -45.67104);
        map.getViewModel().addEventListener('sync', () => {
            let center = map.getCenter();
            if (!bounds.containsPoint(center)) {
                if (center.lat > bounds.getTop()) {
                    center.lat = bounds.getTop();
                } else if (center.lat < bounds.getBottom()) {
                    center.lat = bounds.getBottom();
                }
                if (center.lng < bounds.getLeft()) {
                    center.lng = bounds.getLeft();
                } else if (center.lng > bounds.getRight()) {
                    center.lng = bounds.getRight();
                }
                map.setCenter(center);
            }
        });
        // RECT SHOWING THE BOUNDS
        map.addObject(new H.map.Rect(bounds, {
            style: {
                fillColor: 'rgba(255, 255, 255, 0)',
                strokeColor: 'rgba(83, 109, 254, 0.6)',
                lineWidth: 8
            }
        }
        ));
    };