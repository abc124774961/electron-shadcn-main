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
import { Row, Col, Button, Checkbox } from "antd";
export default function App() {
    const { i18n } = useTranslation();
    const [themeMode, setThemeMode] = useState("dark");

    const [allowCamera, setAllowCamera] = useState(window.__env?.config?.isAllowCamara ?? false);

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
                    {/* <RouterProvider router={router} />; */}
                    <Row gutter={[16, 16]} style={{ marginTop: "6px" }}>
                        <Col span={1}></Col>
                        <Col span={6}>
                            <Checkbox
                                style={{ width: "100%", color: "white" }}
                                type="link"
                                checked={allowCamera}
                                onClick={() => {
                                    setAllowCamera(!allowCamera);
                                    window.swv.setIsAllowCamera(!allowCamera, window.__env.id);
                                }}
                                onChange={(e) => {
                                    // alert('e.target.checked')
                                    // setAllowCamera(e.target.checked);
                                    // window.swv.setIsAllowCamera(e.target.checked, window.__env.id);
                                }}
                            >
                                是否允许摄像头
                            </Checkbox>
                        </Col>
                        <Col span={6} />
                        <Col span={6}></Col>
                    </Row>
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
