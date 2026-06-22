import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import stylistic from "@stylistic/eslint-plugin";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            "@stylistic/indent": ["error", 4]
        },
    },
    // Override default ignores of eslint-config-next.
    globalIgnores([
    // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
    ]),
]);

export default eslintConfig;
