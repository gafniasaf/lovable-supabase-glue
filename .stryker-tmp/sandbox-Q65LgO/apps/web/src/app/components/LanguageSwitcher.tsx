// @ts-nocheck
"use client";
import React from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function LanguageSwitcher() {
	const { locale, setLocale } = useI18n();
	return (
		<select
			className="border rounded p-1 text-xs"
			value={locale}
			onChange={(e) => setLocale(e.target.value as any)}
			aria-label="Language"
		>
			<option value="en">EN</option>
			<option value="es">ES</option>
		</select>
	);
}


