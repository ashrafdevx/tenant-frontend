"use client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./globals.css";
import Header from "./components/Navbar";
export default function RootLayout({ children }) {
  return (
    <Provider store={store}>
      <html lang="en">
        <body>
          <Header />
          {children}
        </body>
      </html>
    </Provider>
  );
}
