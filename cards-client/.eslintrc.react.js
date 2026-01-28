const WARN_LOCAL = process.env.NODE_ENV === "development" ? "warn" : "error";

module.exports = {
  plugins: [],
  extends: [
    "./.eslintrc.base.js",
    "react-app",
  ],
  ignorePatterns: [ "node_modules"],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    curly: "error",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "react/jsx-no-undef": [1, { allowGlobals: true }],
    "react/display-name": "off",
    "react/no-unescaped-entities": "off",
    "react/react-in-jsx-scope": "off", // not needed as of 16.14
  },
  settings: {
    react: {
      version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  env: {
    browser: true,
  },
};
