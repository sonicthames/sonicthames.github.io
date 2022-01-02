const path = require("path");

module.exports = {
  // Javascript
  extends: [
    "plugin:functional/external-recommended",
    "plugin:functional/recommended",
    "plugin:functional/stylistic",
    "plugin:import/recommended",
    "prettier",
  ],
  plugins: ["functional", "import", "unused-imports"],
  env: {
    browser: true,
    es6: true,
  },
  rules: {
    // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/functional-parameters.md
    // TODO disallow for pure libraries (@stonehenge/typescript). For React applications, enable all permutations.
    "functional/functional-parameters": "off",
    // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/immutable-data.md
    // Explicitly define the more common cases in which mutation is inevitable, otherwise disable on a per-line basis
    "functional/immutable-data": [
      "warn",
      {
        // Naming convention for `useRef`
        ignoreAccessorPattern: ["ref.current", "**Ref.current"],
        ignorePattern: ["document.title", "module.exports"],
      },
    ],
    // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/no-conditional-statement.md
    // Too much of a departure from the language's core syntax. There's no point in allowing it on dev
    // with a warning, since fixing it later would warrant an important rewrite
    // REVIEW for pure libraries (@stonehenge/typescript), consider no-conditional-statement
    "functional/no-conditional-statement": "off",
    // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/no-expression-statement.md
    // TODO disallow for pure libraries (@stonehenge/typescript). For React applications, enable all permutations.
    "functional/no-expression-statement": ["off", { ignoreVoid: true }],
    // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/no-mixed-type.md
    // REVIEW
    "functional/no-mixed-type": "off",
    // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/no-return-void.md
    // Too much of a departure from the language's core syntax. `void` is an acceptable way to signal effectful code
    "functional/no-return-void": "off",
    // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/no-throw-statement.md
    // Avoid throwing errors, and instead handle them gracefully using fp-ts' [Either/TaskEither](https://rlee.dev/practical-guide-to-fp-ts-part-3)
    // If that's not possible, disable the eslint warning.
    "functional/no-throw-statement": "warn",
    // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/no-try-statement.md
    // Avoid throwing errors, and instead handle them gracefully using fp-ts' [Either/TaskEither](https://rlee.dev/practical-guide-to-fp-ts-part-3)
    // If that's not possible, disable the eslint warning.
    "functional/no-try-statement": "warn",
    // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/prefer-tacit.md
    "functional/prefer-tacit": "warn",
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/extensions.md
    // Rule is incompatible with our bundler's setup
    "import/extensions": "off",
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/first.md
    // Enforce all imports, and any potential side-effects, at the top of the file
    "import/first": "error",
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-mutable-exports.md
    // To avoid any nasty side-effects, all exports must be defined in immutable terms
    "import/no-mutable-exports": "error",
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-unresolved.md
    // Rule collides with aliases and monorepo settings
    "import/no-unresolved": "off",
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-unused-modules.md
    "import/no-unused-modules": "warn",
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
    // Using the alphabetic order simil to the one by VSCode's import sort configuration.
    // The only difference being that, due to the comparison function used by the plugin,
    // names that begin with an underscore are placed after letters, rather than before
    // [See](https://github.com/import-js/eslint-plugin-import/issues/1742#issuecomment-968376099)
    "import/order": [
      "warn",
      {
        alphabetize: { order: "asc", caseInsensitive: true },
        groups: [
          ["builtin", "external", "internal"],
          "index",
          "parent",
          "sibling",
        ],
      },
    ],
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/prefer-default-export.md
    // In my opinion, default exports are bothersome to maintain, as it forces import names
    // to be arbitrarily defined
    "import/prefer-default-export": "off",
    // https://eslint.org/docs/rules/no-use-before-define#options
    // JS variables are particularly problematic because of hoisting
    "no-use-before-define": ["error", { variables: true }],
    // https://eslint.org/docs/rules/no-unused-vars
    // Only emit warnings during development
    "no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    // https://eslint.org/docs/rules/no-console
    // A logger with dev/prod distinctions should be used instead
    "no-console": "warn",
    // https://eslint.org/docs/rules/no-nested-ternary
    // This rule is incompatible with the functional way of doing things
    "no-nested-ternary": "off",
    // https://eslint.org/docs/rules/no-shadow
    // shadow names are often the cause of many errors, even during development
    "no-shadow": "error",
    // https://eslint.org/docs/rules/no-underscore-dangle
    // We are using underscore for other purposes than pretending variables are 'private'
    "no-underscore-dangle": "off",
    // https://github.com/sweepline/eslint-plugin-unused-imports/blob/master/docs/rules/no-unused-imports.md
    // For best results with tree shaking, we want to avoid any unnecessary imports
    "unused-imports/no-unused-imports": "warn",
  },
  ignorePatterns: ["node_modules"],
  overrides: [
    // Typescript
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        // "plugin:import/typescript",
      ],
      parserOptions: {
        ecmaversion: 2020,
        sourceType: "module",
        project: path.resolve(__dirname, "./tsconfig.json"),
        ecmaFeatures: {
          jsx: true,
        },
      },
      settings: {
        react: {
          version: "detect",
        },
      },

      rules: {
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/no-empty-interface": ["warn"],
        "@typescript-eslint/no-shadow": ["error"],
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/prefer-readonly-parameter-types": "off",
        "default-case": "warn",
        // On typescript, it breaks when you need to reify parameter types
        "functional/prefer-tacit": "off",
        "no-else-return": "warn",
        "no-shadow": "off",
        "no-unused-vars": "off",
        "no-use-before-define": "off",
      },
    },
    {
      files: ["*.test.js", "*.test.jsx"],
      plugins: ["jest"],
      env: { "jest/globals": true },
    },
  ],
};
