import React, { useEffect, useReducer } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "../helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import "../localization/i18n";
import { updateAppLanguage } from "../helpers/language_helpers";
import { router } from "../routes/router";
import { RouterProvider } from "@tanstack/react-router";
import { Theme } from "@radix-ui/themes";
import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { Button, Col, ConfigProvider, Row } from "antd";
import "./index.css";

export default function App() {
    const { i18n } = useTranslation();
    const [themeMode, setThemeMode] = useState("dark");

    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    useEffect(() => {
        syncThemeWithLocal();
        updateAppLanguage(i18n);
        window.themeMode?.system().then((isDark) => {
            setThemeMode(isDark ? "dark" : "light");
        });
        setTimeout(() => {
            forceUpdate();
        }, 2000);
    }, [i18n]);

    return (
        <>
            <Row gutter={[16, 16]} style={{ background: "#222" }}>
                <Col
                    span={6}
                    style={{
                        color: "white",
                        justifyContent: "center",
                        lineHeight: "30px",
                        paddingLeft: "18px",
                    }}
                >
                    {window.__env?.id}

                </Col>
                <Col span={12}
                    style={{
                        color: "white",
                        justifyContent: "center",
                        lineHeight: "30px",
                        paddingLeft: "18px",
                    }}>
                    {window.__env?.kyc}</Col>
                <Col span={6}>
                    <Button
                        style={{ width: "100%" }}
                        type="link"
                        onClick={() => {
                            // alert(window.wv.reload());
                            window.swv.reload(window.__env?.id);
                        }}
                    >
                        刷新
                    </Button>
                </Col>
            </Row>
        </>
    );
}

const root = createRoot(document.getElementById("app")!);
root.render(
    <React.StrictMode>
        <ConfigProvider
            theme={{
                token: {
                    // // Seed Token，影响范围大
                    // colorPrimary: "#00b96b",
                    // borderRadius: 2,
                    // // 派生变量，影响范围小
                    // colorBgContainer: "#f6ffed",
                },
            }}
        >
            <App />
        </ConfigProvider>
    </React.StrictMode>
);
