const https = require('https');

let apiKey = '';

const exampleResponse = [
    {
        "primary": {
            "text": "Westminster Abbey",
            "highlights": []
        },
        "secondary": {
            "text": "London",
            "highlights": []
        },
        "type": "address.residential.building.data.emptyroad",
        "isContainer": false,
        "geometry": {
            "centre": {
                "lat": 51.499462,
                "lon": -0.127448,
                "type": "address"
            }
        },
        "distance": {
            "units": "m",
            "measurement": 9,
            "type": "biasTowards",
            "geometry": {
                "centre": {
                    "lat": 51.499403,
                    "lon": -0.127362
                }
            }
        },
        "populatedRecord": {
            "lines": [
                "Westminster Abbey",
                "",
                "London",
                "SW1P 3PA",
                "United Kingdom"
            ],
            "label": "Westminster Abbey\nLondon\nSW1P 3PA\nUnited Kingdom"
        }
    }
];

async function makeRequest(url) {
    return new Promise((resolve) => {
        if (url.indexOf('key=INSERT-KEY-HERE') != -1) {
            // Demo response
            if (url.indexOf('51.499403') != -1 && url.indexOf('-0.127362') != -1)
                resolve(exampleResponse);
            else
                resolve({
                    fail: 'This request isn\'t available on the demo API key. Make sure to call setAPIKey(key) with your Swiftcomplete reverse geocoding API key first.'
                })
        } else {
            // Live response
            https.get(url, (resp) => {
                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    let results = JSON.parse(data);

                    resolve(results);
                });

            }).on("error", (err) => {
                resolve({
                    fail: err
                });
            });
        }
    });
}

function parseDistanceUnits(str) {
    let result = '';
    let parsedStr = str.toLowerCase().trim();

    switch (parsedStr) {
        case 'metric':
            result = 'metric';
            break;
        case 'imperial':
            result = 'imperial';
            break;
        case 'km':
            result = 'km';
            break;
        case 'm':
            result = 'm';
            break;
        case 'mi':
            result = 'mi';
            break;
        case 'ft':
            result = 'ft';
            break;
    }

    return result;
}

function parseCoordinates(str) {
    if (str && typeof str === 'string' && str.length > 0) {
        let splitStr = str.split(',');

        if (splitStr.length == 2) {
            let parsedLat = parseFloat(splitStr[0]);
            let parsedLon = parseFloat(splitStr[1]);

            if (parsedLat >= -90 && parsedLat <= 90 && parsedLon >= -180 && parsedLon <= 180)
                return [parsedLat, parsedLon];
        }
    }

    return null;
}

/**
 * Sets the API key to authenticate your request to the Swiftcomplete API. You can obtain an API key at https://www.swiftcomplete.com
 * @param key
 */
exports.setAPIKey = function (key) {
    if (key && typeof key === 'string' && key.length > 0)
        apiKey = key;
    else
        throw 'Invalid key provided';
}

/**
 * Returns the nearest address, street or places to a coordinate
 * @param {string} text A full or partial query string, containing an address, street or postcode
 * @param {Object} options Optional options object
 * @param {("metric"|"imperial"|"m"|"km"|"ft"|"mi")} [options.distanceUnits="metric"] Unit of measurement to display how far away the address is from your coordinate
 * @param {number} [options.maxResults=5] Max number of results to return (up to 5).
 * @returns {Promise} Array of matching results
 */
exports.autocomplete = function (text, options) {
    if (apiKey.length == 0)
        throw 'You must set your API key first by calling setAPIKey(key)';

    let parsedCoordinates = parseCoordinates(coordinate);

    if (parsedCoordinates == null)
        throw 'Coordinates not valid - expected "latitude,longitude" WGS84 coordinates';

    let url = `https://api.swiftcomplete.com/v1/places/?key=${apiKey}&searchMode=reverseGeocode&biasTowards=${coordinate}`;

    if (options) {
        if ('distanceUnits' in options) {
            let parsedDistanceUnits = parseDistanceUnits(options.distanceUnits);

            if (parsedDistanceUnits.length > 0)
                url += `&distanceUnits=${parsedDistanceUnits}`;
        }

        if ('maxResults' in options) {
            let parsedMaxResults = parseInt(options.maxResults);

            if (!isNaN(parsedMaxResults) && parsedMaxResults >= 1 && parsedMaxResults <= 5)
                url += `&maxResults=${parsedMaxResults}`;
        }
    }

    return makeRequest(url);
}