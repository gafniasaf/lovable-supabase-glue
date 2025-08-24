/**
 * ESLint configuration for apps/web
 *
 * - Forbid importing server-only fetch helper inside dashboard pages to enforce Gateway usage.
 */
module.exports = {
	root: true,
	extends: ["next/core-web-vitals", "plugin:jsx-a11y/recommended"],
	plugins: ["jsx-a11y"],
	overrides: [
		{
			files: ["src/**/*.{ts,tsx}"],
			rules: {
				"no-restricted-imports": [
					"error",
					{
						patterns: [
							"../../apps/web/src/**",
							"../apps/web/src/**",
							"../../**/src/**"
						],
						paths: [
							{ name: "../../apps/web/src/lib/jobs", message: "Use '@/lib/jobs' alias" },
							{ name: "../lib/jobs", message: "Use '@/lib/jobs' alias" },
							{ name: "../../apps/web/src/lib/rateLimit", message: "Use '@/lib/rateLimit' alias" },
							{ name: "../lib/rateLimit", message: "Use '@/lib/rateLimit' alias" }
						]
					}
				]
			}
		},
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


