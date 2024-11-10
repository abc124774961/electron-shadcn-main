import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "./helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import { updateAppLanguage } from "./helpers/language_helpers";
import { router } from "./routes/router";
import { RouterProvider } from "@tanstack/react-router";
import { Theme } from "@radix-ui/themes";
import { useState } from "react";
import { ThemeProvider } from "next-themes";
export default function App() {
    const { i18n } = useTranslation();
    const [themeMode, setThemeMode] = useState("dark");

    useEffect(() => {
        syncThemeWithLocal();
        updateAppLanguage(i18n);
        window.themeMode?.system().then((isDark) => {
            setThemeMode(isDark ? "dark" : "light");
        });
    }, [i18n]);

    return (
        <>
            <ThemeProvider attribute="class">
                <Theme appearance={"dark"}>
                    <RouterProvider router={router} />;
                </Theme>
            </ThemeProvider>
        </>
    );
}

const root = createRoot(document.getElementById("app")!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
