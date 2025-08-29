export const metadata = {
  title: 'Education Platform v2',
  description: 'MVP-first education platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


