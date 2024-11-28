import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { type ReactNode, type FC } from "react";

export const metadata: Metadata = {
  title: "Wall Area Calculator",
};

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <html lang="en" className={`${GeistSans.variable}`}>
    <body>{children}</body>
  </html>
);

export default RootLayout;
