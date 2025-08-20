// @ts-nocheck
"use client";
import React, { useEffect, useState } from "react";

export default function DarkModeToggle() {
	const [dark, setDark] = useState(false);
	useEffect(() => {
		setDark(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
	}, []);
	function toggle() {
		if (typeof document === 'undefined') return;
		document.documentElement.classList.toggle('dark');
		setDark(document.documentElement.classList.contains('dark'));
	}
	return <button className="underline text-xs" onClick={toggle} aria-pressed={dark} title="Toggle dark mode">{dark ? 'Light' : 'Dark'}</button>;
}


