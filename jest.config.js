module.exports = {
	preset: '@vue/cli-plugin-unit-jest',
	transformIgnorePatterns: ['/node_modules/(?!vuetify)'],
	setupFiles: ['<rootDir>/tests/stubs/register-context.js'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^.+\\.(css|scss)$': '<rootDir>/tests/stubs/css.js',
		'^@mocks/(.*)$': '<rootDir>/tests/mocks/$1',
	},
};
