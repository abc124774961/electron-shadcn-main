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
import { Button, Checkbox, Col, ConfigProvider, Row } from "antd";
import "./index.css";

export default function App() {
    const { i18n } = useTranslation();
    const [themeMode, setThemeMode] = useState("dark");

    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const { autoSetting } = window.__env || {};
    const [autoMining, setAutoMining] = useState(false);
    const [autoPlay, setAutoPlay] = useState(false);

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
                    span={18}
                    style={{
                        color: "white",
                        justifyContent: "center",
                        lineHeight: "30px",
                        paddingLeft: "18px",
                        fontSize: "12px",
                    }}
                >
                    {window.__env?.id}-{window.__env?.kyc}{" "}
                    <Checkbox
                        checked={autoMining}
                        style={{ color: "white", fontSize: "12px" }}
                        onChange={(e) => {
                            setAutoMining(e.target.checked);
                            window.web3.setAutoMining(e.target.checked, window.__env?.id);
                        }}
                    >
                        自动进入挖矿
                    </Checkbox>
                    <Checkbox
                        checked={autoPlay}
                        style={{ color: "white", fontSize: "12px" }}
                        onChange={(e) => {
                            setAutoPlay(e.target.checked);
                            window.web3.setAutoPlay(e.target.checked, window.__env?.id);
                        }}
                    >
                        自动打牌
                    </Checkbox>
                </Col>
                <Col span={6}>
                    <Button
                        style={{ width: "100%" }}
                        type="link"
                        onClick={() => {
                            // alert(window.wv.reload());
                            window.web3.reload(window.__env?.id);
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
