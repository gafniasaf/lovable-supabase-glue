// @ts-nocheck
"use client";
import { useNotificationsPoll } from "@/lib/hooks/useNotificationsPoll";

export default function NotifPoller() {
	useNotificationsPoll(15000);
	return null;
}


