const https = require('https');
const ipV6Regex = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/;
const validCountries = {
    'dk': true,
    'fr': true,
    'gb': true,
    'li': true,
    'lu': true,
};

let apiKey = '';

const exampleResponse = [
    {"options":{"text":"100 champs elysees par"},"suggestions":[{"primary":{"text":"100 Avenue des Champs Elysées","highlights":[0,2,15,20,22,28]},"secondary":{"text":"75008 Paris","highlights":[6,8]},"type":"address.residential.building.data","isContainer":false,"geometry":{"centre":{"lat":48.871754,"lon":2.302552,"type":"postcode"}}}]},
    {"options":{"text":"100 champs elysees par"},"suggestions":[{"primary":{"text":"100 Avenue des Champs Elysées","highlights":[0,2,15,20,22,28]},"secondary":{"text":"75008 Paris","highlights":[6,8]},"type":"address.residential.building.data","isContainer":false,"geometry":{"centre":{"lat":48.871754,"lon":2.302552,"type":"postcode"}},"populatedRecord":{"lines":["100","AVENUE DES CHAMPS ELYSÉES","PARIS","75008","FRANCE"],"label":"100 AVENUE DES CHAMPS ELYSÉES\n75008 PARIS\nFRANCE"}}]}
];

async function makeRequest(url, options) {
    return new Promise((resolve) => {
        if (url.indexOf('key=INSERT-KEY-HERE') != -1) {
            // Demo response
            if (options.text == '100 champs elysees par') {
                if (url.indexOf('populateIndex=0') != -1)
                    resolve(exampleResponse[1]);
                else
                    resolve(exampleResponse[0]);
            }else
                resolve({
                    fail: 'This request isn\'t available on the demo API key. Make sure to call setAPIKey(key) with your Swiftcomplete address autocomplete API key first.'
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

                    for (let i = 0; i < results.length; i++) {
                        if (results[i].container)
                            results[i].container = Buffer.from(results[i].container).toString('base64');
                    }

                    resolve({
                        options: options,
                        suggestions: results
                    });
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

function isPossibleIPAddress(str) {
    if (str && typeof str === 'string' && str.length >=7) {
        let splitStr = str.split('.');

        if (splitStr.length == 4) {
            for (let i = 0; i < splitStr.length; i++) {
                let parsedNum = parseInt(splitStr[i]);

                if (isNaN(parsedNum) || parsedNum < 0 || parsedNum > 255)
                    return false;
            }

            return true;
        }

        return ipV6Regex.test(str);
    }

    return false;
}

function parseCountries(str) {
    if (str && typeof str === 'string') {
        let results = [];

        let splitStr = str.toLowerCase().split(',');

        for (let i = 0; i < splitStr.length; i++) {
            let countryCode = splitStr[i].trim();

            if (countryCode in validCountries)
                results.push(countryCode);
            else
                return null;
        }

        return results;
    }

    return null;
}

function parseContainer(str) {
    if (str && typeof str === 'string' && str.length >= 3) {
        if (str.startsWith('V1;'))
            return str;

        let decodedStr = new Buffer(str, 'base64').toString();

        if (decodedStr.startsWith('V1;'))
            return decodedStr;
    }

    return null;
}

function generateRequest(text, options) {
    let url = `https://api.swiftcomplete.com/v1/places/?key=${encodeURIComponent(apiKey)}&text=${encodeURIComponent(text)}`;

    let savedOptions = {
        text: text
    };

    if (options) {
        if ('biasTowards' in options) {
            let validBiasTowards = false;
            let parsedCoordinates = parseCoordinates(options.biasTowards);

            if (parsedCoordinates) {
                let joinedCoordinates = parsedCoordinates.join(',');
                url += `&biasTowards=${encodeURIComponent(joinedCoordinates)}`;
                savedOptions.biasTowards = joinedCoordinates;
                validBiasTowards = true;
            }else{
                let isPossibleIPAddress = isPossibleIPAddress(options.biasTowards);

                if (isPossibleIPAddress) {
                    url += `&biasTowards=${encodeURIComponent(options.biasTowards)}`;
                    savedOptions.biasTowards = options.biasTowards + '';
                    validBiasTowards = true;
                }
            }

            if (!validBiasTowards)
                throw 'Coordinates not valid - expected "latitude,longitude" WGS84 coordinates or an IP address';
        }

        if ('countries' in options) {
            let parsedCountries = parseCountries(options.countries);

            if (parsedCountries != null) {
                let joinedCountries = parsedCountries.join(',');
                url += `&countries=${encodeURIComponent(joinedCountries)}`;
                savedOptions.countries = joinedCountries;
            }
            else
                throw 'Countries not valid - expected a comma separated list of two-letter country codes from our list of supported countries';
        }

        if ('container' in options) {
            let parsedContainer = parseContainer(options.container);

            if (parsedContainer != null) {
                savedOptions.container = options.container + '';
                url += `&container=${encodeURIComponent(parsedContainer)}`;
            }
        }

        if ('distanceUnits' in options) {
            let parsedDistanceUnits = parseDistanceUnits(options.distanceUnits);

            if (parsedDistanceUnits.length > 0) {
                savedOptions.distanceUnits = parsedDistanceUnits;
                url += `&distanceUnits=${encodeURIComponent(parsedDistanceUnits)}`;
            }
        }

        if ('maxDistance' in options) {
            let parsedMaxDistance = parseFloat(options.maxDistance);

            if (!isNaN(parsedMaxDistance) && parsedMaxDistance >= 0) {
                savedOptions.maxDistance = parsedMaxDistance;
                url += `&maxDistance=${encodeURIComponent(parsedMaxDistance)}`;
            }
        }

        if ('maxResults' in options) {
            let parsedMaxResults = parseInt(options.maxResults);

            if (!isNaN(parsedMaxResults) && parsedMaxResults >= 1 && parsedMaxResults <= 5) {
                savedOptions.maxResults = parsedMaxResults;
                url += `&maxResults=${encodeURIComponent(parsedMaxResults)}`;
            }
        }
    }

    url += `&source=npmaddressautocompletev1`;

    return {
        url: url,
        savedOptions: savedOptions
    }
}
/**
 * Sets the API key to authenticate your request to the Swiftcomplete Places API. You can obtain an API key at https://www.swiftcomplete.com
 * @param key
 */
exports.setAPIKey = function (key) {
    if (key && typeof key === 'string' && key.length > 0)
        apiKey = key;
    else
        throw 'Invalid key provided';
}

/**
 * Returns address, street or place autocomplete suggestions. Must be followed up by calling populate to select a full address
 * @param {string} text A full or partial query string, containing an address, street or postcode
 * @param {Object} options Optional options object
 * @param {string} [options.biasTowards] A WGS84 coordinate in the format "latitude,longitude", or an IP address
 * @param {string} [options.countries] A comma separated list of two-letter country codes to restrict searching to. Leave blank to search all available countries
 * @param {string} [options.container] A street or postcode container ID obtained from result.container to restrict searching to
 * @param {("metric"|"imperial"|"m"|"km"|"ft"|"mi")} [options.distanceUnits="metric"] Unit of measurement to display how far away the address is from options.biasTowards
 * @param {number} [options.maxDistance] Max search distance in kilometres from options.biasTowards
 * @param {number} [options.maxResults=5] Max number of results to return (up to 5)
 * @returns {Promise} Results object containing array of suggestions
 */
exports.autocomplete = function (text, options) {
    if (apiKey.length == 0)
        throw 'You must set your API key first by calling setAPIKey(key)';

    let requestObj = generateRequest(text, options);

    return makeRequest(requestObj.url, requestObj.savedOptions);
}

/**
 * Populates a full result from a list of autocomplete suggestions. This method must be called for each "session" unless a result cannot be found
 * @param index Index of result to populate in results array
 * @param results Results object generated by autocomplete()
 */
exports.populateResult = function(index, results) {
    if (!(results.options && results.suggestions))
        throw 'Expected results to be an object generated by calling autocomplete()';

    let parsedIndex = parseInt(index);

    if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= results.suggestions.length)
        throw 'Expected index to be a number < results.length';

    let requestObj = generateRequest(results.options.text, results.options);
    requestObj.url += `&populateIndex=${encodeURIComponent(index)}`;

    return makeRequest(requestObj.url, requestObj.savedOptions);
}