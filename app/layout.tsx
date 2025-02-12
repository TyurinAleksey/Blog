import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <title>MyBlog</title>
      <body>
        {children}
      </body>
    </html>
  );
}
