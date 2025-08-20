// @ts-nocheck
import { defineConfig } from 'cypress';

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:3030',
		defaultCommandTimeout: 10000,
		video: !!process.env.CI,
		retries: { runMode: 2, openMode: 0 },
		setupNodeEvents(on, config) {
			return config;
		},
	},
});


