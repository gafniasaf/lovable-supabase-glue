export default function Icon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
			<defs>
				<linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
					<stop offset="0%" stopColor="#6EE7B7" />
					<stop offset="100%" stopColor="#3B82F6" />
				</linearGradient>
			</defs>
			<rect x="4" y="4" width="40" height="40" rx="8" fill="url(#g)" />
			<path d="M16 30l8-12 8 12" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="24" cy="20" r="2" fill="#0F172A" />
		</svg>
	);
}


