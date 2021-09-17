# @swiftcomplete/address-autocomplete

[![npm](https://img.shields.io/npm/v/@swiftcomplete/address-autocomplete.svg?style=flat-square "npm")](https://www.npmjs.com/package/@swiftcomplete/address-autocomplete)
[![release](https://img.shields.io/github/release/swiftcomplete-public/address-autocomplete.svg?style=flat-square "release")](https://github.com/swiftcomplete-public/address-autocomplete)
[![dependencies](https://david-dm.org/swiftcomplete-public/address-autocomplete.svg?style=flat-square "dependencies")](https://david-dm.org/swiftcomplete-public/address-autocomplete)
[![license](http://img.shields.io/npm/l/@swiftcomplete/address-autocomplete.svg?style=flat-square "license")](https://github.com/swiftcomplete-public/address-autocomplete/blob/master/LICENSE)

## Description
This package provides address autocomplete using the **[Swiftcomplete Places API](https://www.swiftcomplete.com/places/address-autocomplete/)**.

Using this package, you can search for addresses, streets, postcodes and places using full or partial query strings.

The underlying API can prioritise results near a coordinate, and can handle missing information and mistakes.

## Installation

```sh
npm install @swiftcomplete/address-autocomplete
```

## Authentication

Each request needs to be authenticated with an API key, which you can obtain by **[creating a Swiftcomplete account](https://www.swiftcomplete.com/account/register/)**.

## Example: Search for an address

```js
const swiftcompleteAddressAutocomplete = require('@swiftcomplete/address-autocomplete');

swiftcompleteAddressAutocomplete.setAPIKey('INSERT-KEY-HERE');

// Call swiftcompleteAddressAutocomplete.autocomplete for each keystroke until your address appears in the list of results
let autocompleteResults = await swiftcompleteAddressAutocomplete.autocomplete('100 champs elysees par');

// Select the 1st result in the list (index 0)
const selectIndex = 0;

let result = await swiftcompleteAddressAutocomplete.populateResult(selectIndex, autocompleteResults);

console.log(result.suggestions[selectIndex]);
```

## Example: Using container searching

**Container searching** can be used to let users search by any part of an address, whilst requiring a full address to be selected.

The service returns a list of addresses to choose from if a street or postcode container ID is passed in the options object.

```js
const swiftcompleteAddressAutocomplete = require('@swiftcomplete/address-autocomplete');

swiftcompleteAddressAutocomplete.setAPIKey('INSERT-KEY-HERE');

// Call swiftcompleteAddressAutocomplete.autocomplete for each keystroke until your address appears in the list of results
let autocompleteResults = await swiftcompleteAddressAutocomplete.autocomplete('av des champs elysees par');

// As autoCompleteResults[0].isContainer == true, set container = autoCompleteResults[0].container to view addresses on the street
// Make sure to clear the query text
let containerResults = await swiftcompleteAddressAutocomplete.autocomplete('', {
    container: autocompleteResults.suggestions[0].container
});

// Select the 5th result in the container result list (index 4)
const selectIndex = 4;

let result = await swiftcompleteAddressAutocomplete.populateResult(selectIndex, containerResults);

console.log(result.suggestions[selectIndex]);
```

## Example: Searching within containers

It's possible to search within containers (e.g. for a building number) to further narrow down the results.

```js
const swiftcompleteAddressAutocomplete = require('@swiftcomplete/address-autocomplete');

swiftcompleteAddressAutocomplete.setAPIKey('INSERT-KEY-HERE');

// Call swiftcompleteAddressAutocomplete.autocomplete for each keystroke until your address appears in the list of results
let autocompleteResults = await swiftcompleteAddressAutocomplete.autocomplete('av des champs elysees par');

// As autoCompleteResults[0].isContainer == true, set container = autoCompleteResults[0].container to view addresses on the street
// Clear the query text, and set to a building name / number to narrow down the results
let containerResults = await swiftcompleteAddressAutocomplete.autocomplete('100', {
    container: autocompleteResults.suggestions[0].container
});

// Select the first result in the filtered result list (index 0)
const selectIndex = 0;

let result = await swiftcompleteAddressAutocomplete.populateResult(selectIndex, containerResults);

console.log(result.suggestions[selectIndex]);
```

## Customise the response with the optional options object

It's possible to pass in an optional options object to customise the response. Each field is optional within the object:

**biasTowards**

Prioritises results near a latitude, longitude coordinate or IP address. IP addresses resolve to a general area and aren't always accurate or precise. ("latitude,longitude" or "x.x.x.x")

**countries**

Restrict searching to a list of two-letter country codes. e.g. "gb,fr" to only search within the United Kingdom and France. Default is "", which searches all available countries

**container**

Restricts searching to a specific street or postcode. Obtained from result[x].container

**distanceUnits**

Unit of measurement to display how far away the address is from your coordinate or IP address ("metric", "imperial", "m", "km", "ft", "mi", default: "metric")

**maxDistance**

A distance in kilometres to limit the search radius from the **biasTowards** coordinate 

**maxResults**

Max number of interim autocomplete or container results to return (up to 5, default: 1)

```js
const swiftcompleteAddressAutocomplete = require('@swiftcomplete/address-autocomplete');

swiftcompleteAddressAutocomplete.setAPIKey('INSERT-KEY-HERE');

// Using the options object to suggest the nearest three addresses with building number "166" to a coordinate in France.
let autocompleteResults = await swiftcompleteAddressAutocomplete.autocomplete('166', {
    biasTowards: '48.88635,2.29497',
    countries: 'fr',
    maxResults: 3
});

console.log(autocompleteResults);

```

## Response field descriptions

- primary.text - A simple description of the address, usually the building & street
- secondary.text - A simple description of the location, usually the city
- geometry.centre - The coordinates of the address
- geometry.centre.type - The accuracy of the coordinates, either "address", "street" or "postcode"
- distance - How far the address is from your coordinates
- distance.geometry.centre - Your original coordinates
- populatedRecord.lines - The fully formatted postal address, line by line
- populatedRecord.label - The fully formatted postal address, in a simple label format

## Data coverage

Swiftcomplete address autocomplete is currently available in the following countries:

- Denmark
- France
- Liechtenstein
- Luxembourg
- United Kingdom

We regularly update and expand our data coverage - **[contact us](https://www.swiftcomplete.com/contact-us/)** if there's a country or dataset that isn't listed and we'll let you know where it is on our priority list.

