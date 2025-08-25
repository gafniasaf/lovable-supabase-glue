"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<html lang="en">
			<body>
				<div style={{ padding: 16 }}>
					<h1>Something went wrong</h1>
					<p>{error?.message || "unknown_error"}</p>
					<button onClick={() => reset()}>Try again</button>
				</div>
			</body>
		</html>
	);
}


