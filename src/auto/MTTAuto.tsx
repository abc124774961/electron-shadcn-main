import {} from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import Menu, { SubMenu, MenuItem } from "rc-menu";
import App from "./App";
import React from "react";

setTimeout(() => {
    const root = document.createElement("div");
    root.id = "content-view-root";

    document.body.append(root);

    const rootIntoShadow = document.createElement("div");
    rootIntoShadow.id = "shadow-root";
    rootIntoShadow.style.position = "absolute";
    rootIntoShadow.style.top = document.body.clientHeight / 2 + "px";
    rootIntoShadow.style.zIndex = "1111";

    const shadowRoot = root.attachShadow({ mode: "open" });

    if (navigator.userAgent.includes("Firefox")) {
        /**
         * In the firefox environment, adoptedStyleSheets cannot be used due to the bug
         * @url https://bugzilla.mozilla.org/show_bug.cgi?id=1770592
         *
         * Injecting styles into the document, this may cause style conflicts with the host page
         */
        // const styleElement = document.createElement("style");
        // styleElement.innerHTML = tailwindcssOutput;
        // shadowRoot.appendChild(styleElement);
        // const styleElement2 = document.createElement("style");
        // styleElement.innerHTML = injectedStyle;
        // shadowRoot.appendChild(styleElement2);
    } else {
        /** Inject styles into shadow dom */
        // const globalStyleSheet = new CSSStyleSheet();
        // globalStyleSheet.replaceSync(tailwindcssOutput);
        // /** Inject styles into shadow dom */
        // const globalStyleSheet2 = new CSSStyleSheet();
        // globalStyleSheet2.replaceSync(injectedStyle);
        // shadowRoot.adoptedStyleSheets = [globalStyleSheet2];
        // shadowRoot.adoptedStyleSheets = [globalStyleSheet, globalStyleSheet2];
    }

    shadowRoot.appendChild(rootIntoShadow);
    // createRoot(rootIntoShadow).render(<App />);
    ReactDOM.render(<App />, rootIntoShadow);
}, 1000);
