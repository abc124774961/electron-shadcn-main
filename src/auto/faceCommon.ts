function recorderCanvas() {
    // 假设您已经有了一个video元素，并且它已经在播放
    const video = document.querySelector("video");
    const stream = video.srcObject;

    // 检查MediaRecorder是否支持视频类型
    if (!MediaRecorder.isTypeSupported("video/webm")) {
        console.error("MediaRecorder does not support the video type");
        return;
    }

    // 创建一个MediaRecorder实例
    let mediaRecorder;
    if (stream.getVideoTracks()[0].getSettings) {
        const options = { mimeType: "video/webm;codecs=vp9" };
        mediaRecorder = new MediaRecorder(stream, options);
    } else {
        mediaRecorder = new MediaRecorder(stream);
    }

    // 创建一个数组来保存录制的数据
    const recordedBlobs = [];

    // 监听数据事件来收集数据
    mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    };

    // 监听stop事件来下载视频
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedBlobs, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "exported-video.webm";
        a.click();
        URL.revokeObjectURL(url);
    };

    // 开始录制
    mediaRecorder.start();
}

async function waitForElement(
    selector: string,
    condition?: (element: HTMLElement) => boolean,
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
            const element = document.querySelectorAll(selector);
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

// setTimeout(async () => {
//     await waitForElement(".amplify-button", undefined, 300000);
//     let buttonStarts = document.querySelectorAll(".amplify-button");
//     buttonStarts.forEach((button) => {
//         button.addEventListener("click", function () {
//             console.log("Button clicked!");
//             recorderCanvas();
//         });
//     });
// }, 500);

window.recorderCanvas = recorderCanvas;
