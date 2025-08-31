/** @type {import('next').NextConfig} */
const nextConfig = {
	headers: async () => {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'Referrer-Policy', value: 'no-referrer' },
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
					{ key: 'X-XSS-Protection', value: '0' },
				]
			},
		];
	},
};

module.exports = nextConfig;


