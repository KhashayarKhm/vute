module.exports = {
	root: true,

	env: {
		browser: true,
		es6: true,
	},

	extends: [
		'plugin:vue/essential',
		'plugin:vue/strongly-recommended',
		'plugin:vue/recommended',
		'plugin:import/recommended',
		'plugin:import/warnings',
		'airbnb-base',
	],

	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},

	parserOptions: {
		ecmaVersion: 2018,
		parser: 'babel-eslint',
		sourceType: 'module',
	},

	plugins: ['vue'],

	rules: {
		'no-console': 'off',
		indent: [2, 'tab', { SwitchCase: 1 }],
		'no-tabs': 0,
		'vue/html-indent': [2, 'tab'],
		'no-underscore-dangle': ['error', { allow: ['_id'] }],
		'object-shorthand': ['error', 'properties'],
		'no-param-reassign': ['error', {
			props: true,
			ignorePropertyModificationsFor: ['state'],
		}],
	},

	settings: {
		'import/resolver': {
			'eslint-import-resolver-custom-alias': {
				alias: {
					'@': './src',
				},
				extensions: ['.js'],
			},
		},
	},

	overrides: [
		{
			files: [
				'**/__tests__/*.{j,t}s?(x)',
				'**/tests/unit/**/*.spec.{j,t}s?(x)',
			],
			env: {
				jest: true,
			},
		},
	],
};
