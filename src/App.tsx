import React, { useEffect, useReducer } from "react";
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
import TaskUtil from "./task/TaskUtil";

TaskUtil.initDataFromConfig(window.qeConfig?.dataConfig());
export default function App() {
    const { i18n } = useTranslation();
    const [themeMode, setThemeMode] = useState("dark");
    const [, forceUpdate] = useReducer((i) => i + 1, 0);

    const [allowCamera, setAllowCamera] = useState(window.__env?.config?.isAllowCamara ?? false);

    const windowList = TaskUtil.currentTaskConfig?.getWindowList();
    useEffect(() => {
        syncThemeWithLocal();
        updateAppLanguage(i18n);
        window.themeMode?.system().then((isDark) => {
            setThemeMode(isDark ? "dark" : "light");
        });
    }, [i18n]);

    return (
        <div
            style={{
                background: "#333",
                width: "100%",
                height: window.screen.height,
                marginTop: "-6px",
            }}
        >
            {/* <RouterProvider router={router} />; */}
            <Row gutter={[16, 16]} style={{ marginTop: "6px" }}>
                <Col span={1}></Col>
                <Col span={3}>
                    <Checkbox
                        style={{ width: "100%", color: "white" }}
                        type="link"
                        checked={allowCamera}
                        onClick={() => {
                            setAllowCamera(!allowCamera);
                            window.web3.setIsAllowCamera(!allowCamera, window.__env.id);
                        }}
                        onChange={(e) => {
                            // alert('e.target.checked')
                            // setAllowCamera(e.target.checked);
                            // window.web3.setIsAllowCamera(e.target.checked, window.__env.id);
                        }}
                    >
                        是否允许摄像头
                    </Checkbox>
                </Col>
                <Col span={18}>
                    {windowList?.map((win) => {
                        return (
                            <Checkbox
                                checked={win.isOpen}
                                onChange={() => {}}
                                onClick={() => {
                                    window.web3.setWindowIsOpen(!win.isOpen, win.account.account);
                                    win.isOpen = !win.isOpen;
                                    forceUpdate();
                                }}
                            >
                                {win.account.account + "-" + (win.account.kyc || "")}
                            </Checkbox>
                        );
                    })}
                </Col>
                <Col span={1}>dsd</Col>
            </Row>
        </div>
    );
}

const root = createRoot(document.getElementById("app")!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
