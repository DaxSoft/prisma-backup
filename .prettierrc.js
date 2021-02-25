module.exports = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    overrides: [
        {
            files: '*.test.js',
            options: {
                semi: true,
            },
        },
    ],
}
