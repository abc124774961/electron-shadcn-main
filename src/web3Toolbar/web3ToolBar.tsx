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
import { Button, Checkbox, Col, ConfigProvider, Dropdown, Radio, Row, Select } from "antd";
import "./index.css";
import TaskUtil from "@/task/TaskUtil";
import DragWindowRegion from "@/components/DragWindowRegion";

TaskUtil.initDataFromConfig(window.qeConfig?.dataConfig());

export default function App() {
    const { i18n } = useTranslation();
    const [themeMode, setThemeMode] = useState("dark");
    const [, forceUpdate] = useReducer((i) => i + 1, 0);

    const [allowCamera, setAllowCamera] = useState(window.__env?.config?.isAllowCamara ?? true);
    const [displayColumn, setDisplayColumn] = useState(
        window.__env?.config?.displayMaxColumnNumber ?? 8
    );
    const [autoLogin, setAutoLogin] = useState(window.__env?.config?.autoLogin ?? true);
    const [groupName, setGroupName] = useState(window.__env?.config?.groupName ?? 1);

    const windowList = TaskUtil.currentTaskConfig?.getWindowList(groupName);
    useEffect(() => {
        syncThemeWithLocal();
        updateAppLanguage(i18n);
        window.themeMode?.system().then((isDark) => {
            setThemeMode(isDark ? "dark" : "light");
        });
    }, [i18n]);

    // alert(window.qeConfig?.dataConfig())

    useEffect(() => {
        console.log("num", displayColumn);
        if (window.web3 && window.__env && displayColumn) {
            window.web3.setLayoutColumnMaxNumber(displayColumn, window.__env.id);
        }
    }, [displayColumn]);

    return (
        <div
            style={{
                background: "#333",
                width: "100%",
                height: window.screen.height,
                marginTop: "-6px",
            }}
        >
            {/* <DragWindowRegion title="" /> */}
            {/* <RouterProvider router={router} />; */}
            <Row gutter={[16, 16]} style={{ marginTop: "6px" }}>
                <Col span={3} style={{ textAlign: "left", justifyContent: "left" }}>
                    <div style={{ flexDirection: "row" }}>
                        <Checkbox
                            style={{ color: "white", fontSize: "12px" }}
                            type="link"
                            checked={allowCamera}
                            onClick={() => {
                                setAllowCamera(!allowCamera);
                                window.web3.setIsAllowCamera(!allowCamera);
                            }}
                            onChange={(e) => {
                                // alert('e.target.checked')
                                // setAllowCamera(e.target.checked);
                                // window.web3.setIsAllowCamera(e.target.checked, window.__env.id);
                            }}
                        >
                            摄像头
                        </Checkbox>
                        <Checkbox
                            style={{ color: "white", fontSize: "12px" }}
                            type="link"
                            checked={autoLogin}
                            onClick={() => {
                                setAutoLogin(!autoLogin);
                                window.web3.setAutoLogin(!autoLogin);
                            }}
                            onChange={(e) => {
                                // alert('e.target.checked')
                                // setAllowCamera(e.target.checked);
                                // window.web3.setIsAllowCamera(e.target.checked, window.__env.id);
                            }}
                        >
                            自动登录
                        </Checkbox>
                    </div>
                    <div>
                        {["所有", 1, 2, 3, 4, 5].map((v, i) => {
                            return (
                                <Radio
                                    checked={groupName == i}
                                    style={{ color: "white", fontSize: "12px" }}
                                    value={i}
                                    onChange={(e) => {
                                        setGroupName(e.target.value == "所有" ? 0 : e.target.value);
                                        window.web3.setGroupName(
                                            e.target.value == "所有" ? 0 : e.target.value
                                        );
                                    }}
                                >
                                    {v}
                                </Radio>
                            );
                        })}
                    </div>
                    {[6, 7, 8, 9, 10].map((n) => {
                        return (
                            <Radio
                                checked={displayColumn == n}
                                style={{ color: "white", fontSize: "12px" }}
                                value={n}
                                onChange={(e) => {
                                    setDisplayColumn(e.target.value);
                                    window.web3.setLayoutColumnMaxNumber(e.target.value);
                                }}
                            >
                                {n}列
                            </Radio>
                        );
                    })}
                    {/* <Select
                        onChange={(e) => {
                            // alert(e)
                            window.web3.setLayoutColumnMaxNumber(e, window.__env.id);
                        }}
                        options={[
                            // { value: "6", label: <span>6</span> },
                            { value: "7", label: <span>7</span> },
                            { value: "9", label: <span>9</span> },
                        ]}
                    /> */}
                </Col>
                <Col span={17}>
                    <div
                        style={{
                            paddingTop: "0px",
                            height: "60px",
                            overflowY: "auto",
                            overflowX: "hidden",
                        }}
                    >
                        {windowList?.map((win) => {
                            return (
                                <Checkbox
                                    style={{ color: "white", fontSize: "12px" }}
                                    checked={win.isOpen}
                                    onChange={() => {}}
                                    onClick={() => {
                                        window.web3.setWindowIsOpen(
                                            !win.isOpen,
                                            win.account.account
                                        );
                                        win.isOpen = !win.isOpen;
                                        forceUpdate();
                                    }}
                                >
                                    {(win.account.kyc || "") + "-" + win.account.account}
                                </Checkbox>
                            );
                        })}
                    </div>
                </Col>
            </Row>
        </div>
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
