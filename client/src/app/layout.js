'use client'
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";

import { Provider } from "react-redux";
import store, { persistor } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "@/components/ui/sonner";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

console.log("Google Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png"  />
        <title>GlideGO</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans`}
      >
         <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>

        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {children}

            {/* 🔔 Global Toaster */}
            <Toaster
              position="bottom-right"
              gutter={12}
              containerStyle={{
                bottom: 20,
                right: 20,
              }}
              toastOptions={{
                duration: 3500,
                style: {
                  background: "white",   // dark gray
                  color: "black",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                },
                success: {
                  style: {
                    background: "#16a34a", // green
                  },
                  iconTheme: {
                    primary: "#fff",
                    secondary: "#16a34a",
                  },
                },
                error: {
                  style: {
                    background: "#dc2626", // red
                  },
                  iconTheme: {
                    primary: "#fff",
                    secondary: "#dc2626",
                  },
                },
              }}
            />

          </PersistGate>
        </Provider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
