const WARN_LOCAL = process.env.NODE_ENV === "development" ? "warn" : "error";

module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
    "plugin:promise/recommended",
    "plugin:import/errors",
    "plugin:import/typescript",
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],

  rules: {
    curly: "error",
    "@typescript-eslint/camelcase": "off", // removed in next releaase v7
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-unused-vars": [WARN_LOCAL, { args: "none", ignoreRestSiblings: true }],
    "promise/param-names": "off",
    "no-void": ["error", { allowAsStatement: true }], // allows us to void unawaited
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit",
        overrides: {
          accessors: "off",
          constructors: "off",
          methods: "explicit",
          properties: "explicit",
          parameterProperties: "explicit",
        },
      },
    ],
    "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: true }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "no-use-before-define": [0], // rely on TS version
    "@typescript-eslint/no-use-before-define": [2],
    "import/order": ["error"],
    "import/namespace": "off", // handled by typescript-eslint
    "import/default": "off", // handled by typescript-eslint
    "import/named": "off", // handled by typescript-eslint
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.ts",
          "**/*.test.js",
          "**/*TestHelper.ts",
          "**/*.test.tsx",
          "**/setupTests.ts",
          "**/Setup*Tests.ts",
          "**/__mocks__/*",
          "**/Teardown*Tests.ts",
          "**/test/**",
          "**/testUtils/**",
          "**/*.e2e.ts",
          "**/*.harness.ts",
          "**/TestData.ts",
          "**/*Tests.ts",
          "**/*.csv.ts",
        ],
      },
    ],
    "no-restricted-imports": [
      "error",
      {
        paths: ["."],
        patterns: ["@hatch-team/**/src", "../**/dist"],
      },
    ],
  },
};
