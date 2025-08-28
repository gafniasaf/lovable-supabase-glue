export default function HomePage() {
  if (typeof window !== 'undefined') {
    window.location.replace('/labs/expertfolio');
    return null as any;
  }
  // SSR fallback
  return (
    <meta httpEquiv="refresh" content="0; url=/labs/expertfolio" />
  ) as any;
}


