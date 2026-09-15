/** @type {import("prettier").Config} */
const config = {
    tabWidth: 4,
    overrides: [
        {
            files: ["*.yml", "*.yaml", "*.json", "*.jsonc", "*.md"],
            options: { tabWidth: 2 },
        },
    ],
};

export default config;
