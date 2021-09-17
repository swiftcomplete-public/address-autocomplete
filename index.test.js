const swiftcompleteAddressAutocomplete = require('./index');

test('Throws on null API key', () => {
    expect(() => {
        swiftcompleteAddressAutocomplete.setAPIKey(null);
    }).toThrowError('Invalid key provided');
});

test('Throws on empty string API key', () => {
    expect(() => {
        swiftcompleteAddressAutocomplete.setAPIKey('');
    }).toThrowError('Invalid key provided');
});

test('Throws without API key set', () => {
    expect(() => {
        swiftcompleteAddressAutocomplete.autocomplete('10 downing st');
    }).toThrowError('You must set your API key first by calling setAPIKey(key)');
});

it('Responds to demo request with array', async () => {
    expect.assertions(1);
    swiftcompleteAddressAutocomplete.setAPIKey('INSERT-KEY-HERE');

    const data = await swiftcompleteAddressAutocomplete.autocomplete('100 champs elysees par');
    expect(data.suggestions.length).toEqual(1);
});

it('Responds to invalid demo request with error', async () => {
    expect.assertions(1);
    swiftcompleteAddressAutocomplete.setAPIKey('INSERT-KEY-HERE');

    const data = await swiftcompleteAddressAutocomplete.autocomplete('test should fail');
    expect(data.fail).toContain("This request isn't available on the demo API key.");
});
