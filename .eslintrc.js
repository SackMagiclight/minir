module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
        // indentを4に
        indent: [
            'error',
            4,
            {
                SwitchCase: 1,
                ObjectExpression: 1,
                flatTernaryExpressions: false,
                ignoredNodes: ['ConditionalExpression *'],
            },
        ],
        // オブジェクトの最後の要素には常にカンマをつける
        'comma-dangle': ['error', 'always-multiline'],
        // 実装のない空の関数は無視する
        '@typescript-eslint/no-empty-function': [0],
        // if,while文などを一行で書く時は波括弧を省略
        curly: ['error', 'multi-or-nest'],
        // シングルクオートに統一、prettierに合わせる
        quotes: ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
        'arrow-parens': ['error', 'always'],
        // Interfaceの前にかならずIをつける
        // 'interface-name-prefix': 0,
        // functionの返値の型指定を必須にする
        // '@typescript-eslint/explicit-module-boundary-types': 0,
        // any の型定義を禁止
        '@typescript-eslint/no-explicit-any': 2,
        // 初期化済みの型変数を禁止しない
        '@typescript-eslint/no-inferrable-types': 0,
        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    '{}': false,
                },
                extendDefaults: true,
            },
        ],
        // 不要なカッコは消す
        'no-extra-parens': 0,
        // 無駄なスペースは削除
        'no-multi-spaces': 2,
        // 不要な改行は削除
        'no-multiple-empty-lines': [2, { max: 2 }],
        // 関数とカッコはあけない
        'space-before-function-paren': [0, 'never'],
        // true/falseを無駄に使うな
        'no-unneeded-ternary': 2,
        // varは禁止
        'no-var': 2,
        // コンソールは本番環境ではwarning
        'no-console': process.env.NODE_ENV === 'production' ? 1 : 0,
        'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 0,
        // 配列のindexには空白入れるな(hogehoge[ x ])
        'computed-property-spacing': 2,
        // キー
        'key-spacing': 2,
        // キーワードの前後には適切なスペースを
        'keyword-spacing': 2,
        // 使ってない変数は警告
        '@typescript-eslint/no-unused-vars': [
            1,
            {
                vars: 'all',
                args: 'after-used',
                ignoreRestSiblings: false,
                argsIgnorePattern: '^_',
            },
        ],
        'react/self-closing-comp': 'error',
        // nullableのメソッドからの返り値をnon nullに強制キャストしない
        '@typescript-eslint/no-non-null-assertion': 0,
        // キャメルケースの使用を容認
        camelcase: 'off',
        // 変数の存在確認はTypeScriptでチェックするため無効化
        'no-undef': 0,
        // ts-ignoreを使わない
        '@typescript-eslint/ban-ts-comment': [
            2,
            {
                'ts-expect-error': false,
            },
        ],
        'import/no-unresolved': 'error',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'no-restricted-syntax': [
            // for in, for of, enumは使ってはいけない
            'error',
            {
                selector: 'ForInStatement',
                message:
                    'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
            },
            {
                selector: 'ForOfStatement',
                message:
                    'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
            },
            {
                selector: 'TSEnumDeclaration',
                message: "Don't declare enums",
            },
        ],
        // Arrow関数を強制
        'prefer-arrow-callback': 'error',
        // constを強制
        'prefer-const': 'error',
    },
    "overrides": [
        // 一部ルールを除外する
        {
            files: ['src/pages/**/*.tsx'], // pagesのdefault exportは仕方ないので除外
            rules: { 'import/no-default-export': 'off' },
        },
        {
            files: ['**/*.tsx'], // componentの戻り値の型定義の記述は必須にしない
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                'import/no-unresolved': 'off', // 相対パスとして認識されてしまうライブラリがあるので無効にする
            },
        },
        {
            files: ['*.mdx'],
            extends: ['plugin:mdx/recommended', 'plugin:mdx/overrides'],
        },
    ],
}
