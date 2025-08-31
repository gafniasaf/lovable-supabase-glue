"use client";

import React from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
	return (
		<div className="p-4" role="alert">
			<h2>Something went wrong</h2>
			<p>{error?.message || 'Unknown error'}</p>
			<button onClick={() => reset()}>Retry</button>
		</div>
	);
}


