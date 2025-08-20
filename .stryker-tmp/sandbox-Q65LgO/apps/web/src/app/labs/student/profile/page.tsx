// @ts-nocheck
import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

type Profile = {
	id: string;
	email: string;
	role: string;
};

export default async function StudentProfilePage() {
	const hdrs = headers();
	const cookieHeader = hdrs.get("cookie") ?? "";
	const testAuthHeader = hdrs.get("x-test-auth") ?? "";

	const res = await serverFetch("/api/user/profile", {
		cache: "no-store",
		headers: {
			cookie: cookieHeader,
			"x-test-auth": testAuthHeader
		}
	});

	if (res.status === 401) {
		return (
			<main className="p-6 space-y-3">
				<h1 className="text-xl font-semibold" data-testid="profile-title">Student Profile</h1>
				<p className="text-gray-700" data-testid="signin-prompt">You are not signed in</p>
				<a className="underline" href="/login" data-testid="signin-link">Go to login</a>
			</main>
		);
	}

	let profile: Profile | null = null;
	if (res.ok) {
		profile = (await res.json()) as Profile;
	}

	return (
		<main className="p-6 space-y-3">
			<h1 className="text-xl font-semibold" data-testid="profile-title">Student Profile</h1>
			{profile ? (
				<div className="space-y-1">
					<div>
						<span className="font-medium">Email: </span>
						<span data-testid="profile-email">{profile.email}</span>
					</div>
					<div>
						<span className="font-medium">Role: </span>
						<span data-testid="profile-role">{profile.role}</span>
					</div>
				</div>
			) : (
				<p className="text-gray-600">Unable to load profile.</p>
			)}
		</main>
	);
}


