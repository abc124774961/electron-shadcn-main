import { _electron as electron } from "playwright";
import { test, expect } from "@playwright/test";

// test("Launch electron app", async () => {
const electronApp = await electron.launch({ args: ["."] });

const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    debugger;

    // const getState = () => ({
    //     isVisible: mainWindow.isVisible(),
    //     isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
    //     isCrashed: mainWindow.webContents.isCrashed(),
    // });

    // return new Promise((resolve) => {
    //     if (mainWindow.isVisible()) {
    //         resolve(getState());
    //     } else {
    //         mainWindow.once("ready-to-show", () => setTimeout(() => resolve(getState()), 0));
    //     }
    // });
});

// expect(windowState.isVisible).toBeTruthy();
// expect(windowState.isDevToolsOpened).toBeFalsy();
// expect(windowState.isCrashed).toBeFalsy();

// await electronApp.close();
// });
