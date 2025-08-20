/**
 * ESLint configuration for apps/web
 *
 * - Forbid importing server-only fetch helper inside dashboard pages to enforce Gateway usage.
 */
// @ts-nocheck

module.exports = {
	root: true,
	extends: ["next/core-web-vitals"],
	overrides: [
		{
			files: ["src/app/dashboard/**/*.{ts,tsx}"],
			rules: {
				"no-restricted-imports": [
					"error",
					{
						patterns: [
							"@/lib/serverFetch",
							"../lib/serverFetch",
							"../../lib/serverFetch",
							"../../../lib/serverFetch"
						]
					}
				]
			}
		}
	]
};


