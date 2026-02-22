import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2563eb", // Royal Blue
                secondary: "#f59e0b", // Orange
                background: "#f8fafc", // Light Slate
                text: "#1e293b", // Dark Slate
            },
        },
    },
    plugins: [],
};
export default config;
