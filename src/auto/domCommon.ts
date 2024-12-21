import $ from "jquery";
import axios from "axios";

export function touchClick(element: HTMLElement) {
    // 创建一个鼠标点击事件
    var mouseClickEvent = new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    // 创建一个触摸结束事件
    var touchEndEvent = new TouchEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    var event = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    // 触发鼠标点击事件
    element.dispatchEvent(mouseClickEvent);
    // // 触发触摸结束事件
    element.dispatchEvent(touchEndEvent);
    element.dispatchEvent(event);
}

/**
 * 创建一个返回 Promise 的函数，该 Promise 在指定的毫秒数后解析。
 *
 * @param arg0 延迟的时间（毫秒）
 * @returns 返回一个 Promise，该 Promise 在指定的毫秒数后解析
 */
export function sleep(arg0: number) {
    return new Promise((resolve) => setTimeout(resolve, arg0));
}

export async function simulateInput(selector: string, text: string, interval: number = 100) {
    try {
        const inputElement = await waitForElement(selector);
        if (inputElement.length === 0) {
            throw new Error(`Element with selector "${selector}" not found`);
        }

        inputElement.trigger("focusin");
        // 清空输入框
        inputElement.val("");

        // 模拟逐个字符输入
        for (let char of text) {
            const keyCode = char.charCodeAt(0);

            // 触发 keydown 事件
            inputElement.trigger({
                type: "keydown",
                key: char,
                keyCode: keyCode,
                which: keyCode,
            });

            // 触发 keypress 事件
            inputElement.trigger({
                type: "keypress",
                key: char,
                keyCode: keyCode,
                which: keyCode,
            });

            // 更新输入框的值
            //inputid是需要赋值的input的id
            let event = new Event("input", { bubbles: true });
            let input = inputElement.get(0);
            if (input) {
                input.value = inputElement.val() + char;
                let tracker = input._valueTracker;
                if (tracker) {
                    tracker.setValue(inputElement.val() + char);
                }
                input.dispatchEvent(event);
                inputElement.get(0)?.dispatchEvent(event);
            }

            // 触发 input 事件
            inputElement.trigger("input");

            // 触发 keyup 事件
            inputElement.trigger({
                type: "keyup",
                key: char,
                keyCode: keyCode,
                which: keyCode,
            });

            await sleep(interval); // 模拟打字间隔
        }
    } catch (error) {
        console.error("Error simulating input:", error);
    }
}

export async function waitForElement(
    selector: string,
    condition?: (element: JQuery<HTMLElement>) => boolean,
    timeout: number = 10000
): Promise<JQuery<HTMLElement>> {
    return new Promise((resolve, reject) => {
        console.log(`Waiting for element with selector "${selector}"...`);
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "childList") {
                    checkElement();
                }
            }
        });

        const checkElement = () => {
            const element = $(selector);
            if (element.length > 0) {
                if (!condition || condition(element)) {
                    observer.disconnect();
                    resolve(element);
                }
            }
        };

        checkElement();

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            reject(
                new Error(
                    `Element with selector "${selector}" not found or condition not met within ${timeout}ms`
                )
            );
        }, timeout);
    });
}

export function waitForRouteChange(timeout: number = 10000): Promise<string> {
    return new Promise((resolve, reject) => {
        const originalUrl = window.location.href;

        const onPopState = () => {
            if (window.location.href !== originalUrl) {
                window.removeEventListener("popstate", onPopState);
                clearTimeout(timer);
                resolve(window.location.href);
            }
        };

        window.addEventListener("popstate", onPopState);

        const timer = setTimeout(() => {
            window.removeEventListener("popstate", onPopState);
            reject(new Error(`Route change did not occur within ${timeout}ms`));
        }, timeout);
    });
}

export async function waitForPageLoad(
    targetNode?: Node,
    config: MutationObserverInit = { childList: true, subtree: true },
    timeout: number = 15000
): Promise<void> {
    let _targetNode = targetNode;
    if (!_targetNode) _targetNode = document.querySelector(".box-content") as Node;
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === "childList") {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                    observer.disconnect();
                    break;
                }
            }
        });

        observer.observe(_targetNode, config);
        setTimeout(() => {
            observer.disconnect();
            reject(
                new Error(
                    `Element with selector "${_targetNode}" not found or condition not met within ${timeout}ms`
                )
            );
        }, timeout);
    });
}
function getCurrentUrl(): string {
    // 这里返回当前网址
    return "https://sports.mtt.xyz";
}

/**
 * 获取网页标题
 * @param url - 网页URL
 * @returns 页面标题
 * @throws 如果请求失败，抛出错误
 */
export async function fetchPageDom(url: string): Promise<JQuery<any>> {
    try {
        const response = await axios.get(url, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
            },
        });
        const html = response.data;
        // const $ = $(html);
        return $(html);
    } catch (error) {
        throw new Error(`Error fetching the page: ${error.message}`);
    }
}
