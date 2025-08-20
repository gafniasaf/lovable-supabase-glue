"use client";

import React from "react";

export default function SignOutClient({ action }: { action: (formData: FormData) => Promise<void> }) {
  const onClick = React.useCallback(() => {
    try {
      // Proactively clear the test-mode cookie in the browser so SSR reflects anonymous immediately
      document.cookie = "x-test-auth=; Max-Age=0; Path=/";
      document.cookie = "x-test-auth=; Max-Age=0; Path=/; Domain=localhost";
    } catch {}
  }, []);
  return (
    <form action={action}>
      <button className="underline" type="submit" onClick={onClick} data-testid="signout-btn">Sign out</button>
    </form>
  );
}



