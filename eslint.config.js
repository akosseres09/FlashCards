// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
    {
        ignores: ['**/*.spec.ts', '**/*.d.ts', '**/node_modules/**', '**/dist/**'],
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.app.json',
                tsconfigRootDir: __dirname,
            },
        },
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            ...tseslint.configs.stylistic,
            ...angular.configs.tsRecommended,
        ],
        processor: angular.processInlineTemplates,
        rules: {
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'app',
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'app',
                    style: 'kebab-case',
                },
            ],
            '@angular-eslint/prefer-output-emitter-ref': 'error',
            '@angular-eslint/prefer-output-readonly': 'error',
            '@angular-eslint/prefer-signals': 'error',
            //"@angular-eslint/prefer-signal-queries": "error",

            '@angular-eslint/no-empty-lifecycle-method': 'error',
            '@angular-eslint/no-lifecycle-call': 'error',
            '@angular-eslint/component-class-suffix': 'error',
            '@angular-eslint/directive-class-suffix': 'error',
            '@angular-eslint/prefer-standalone': 'error',
            '@angular-eslint/no-uncalled-signals': 'error',
            '@angular-eslint/no-input-rename': 'error',
            '@angular-eslint/no-output-rename': 'error',
            '@angular-eslint/no-output-native': 'error',
            '@angular-eslint/no-duplicates-in-metadata-arrays': 'error',
            '@angular-eslint/use-injectable-provided-in': 'error',
        },
    },
    {
        files: ['**/*.html'],
        extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
        rules: {
            '@angular-eslint/template/banana-in-box': 'error',
            '@angular-eslint/template/prefer-control-flow': 'error',
            '@angular-eslint/template/eqeqeq': 'error',
            '@angular-eslint/template/no-any': 'error',
            '@angular-eslint/template/no-distracting-elements': 'error',
            '@angular-eslint/template/no-duplicate-attributes': 'error',
            '@angular-eslint/template/prefer-at-else': 'error',
            '@angular-eslint/template/prefer-contextual-for-variables': 'error',
            '@angular-eslint/template/prefer-static-string-properties': 'error',
            '@angular-eslint/template/use-track-by-function': 'error',
        },
    },
);
