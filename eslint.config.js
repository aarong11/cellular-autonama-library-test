const parser = require('@typescript-eslint/parser');
const eslintPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            parser: parser,
        },
        plugins: {
            '@typescript-eslint': eslintPlugin,
        },
        rules: {
            'indent': ['error', 2], // Use the base ESLint indent rule
            // Add other custom rules here
        }
    },
];