const swiftcompleteReverseGeocoder = require('./index');

test('Throws on null API key', () => {
    expect(() => {
        swiftcompleteReverseGeocoder.setAPIKey(null);
    }).toThrowError('Invalid key provided');
});

test('Throws on empty string API key', () => {
    expect(() => {
        swiftcompleteReverseGeocoder.setAPIKey('');
    }).toThrowError('Invalid key provided');
});

test('Throws without API key set', () => {
    expect(() => {
        swiftcompleteReverseGeocoder.reverseGeocode('51.499403,-0.127362');
    }).toThrowError('You must set your API key first by calling setAPIKey(key)');
});

it('Responds to demo request with array', async () => {
    expect.assertions(1);
    swiftcompleteReverseGeocoder.setAPIKey('INSERT-KEY-HERE');

    const data = await swiftcompleteReverseGeocoder.reverseGeocode('51.499403,-0.127362');
    expect(data.length).toEqual(1);
});

it('Responds to invalid demo request with error', async () => {
    expect.assertions(1);
    swiftcompleteReverseGeocoder.setAPIKey('INSERT-KEY-HERE');

    const data = await swiftcompleteReverseGeocoder.reverseGeocode('51.4,-0.12');
    expect(data.fail).toContain("This request isn't available on the demo API key.");
});
