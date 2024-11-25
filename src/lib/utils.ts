import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// 判断操作系统
export function getSystemInfo() {
    let platform = process.platform;
    switch (platform) {
        case "win32":
            return "windows";
        case "darwin":
            return "macOS";
        case "linux":
            return "Linux";
        default:
            return "unknown";
    }
}
