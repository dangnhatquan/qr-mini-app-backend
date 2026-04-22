import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ),
  {
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[callee.object.name=configService][callee.property.name=/^(get|getOrThrow)$/]:not(:has([arguments.1] Property[key.name=infer][value.value=true])), CallExpression[callee.object.property.name=configService][callee.property.name=/^(get|getOrThrow)$/]:not(:has([arguments.1] Property[key.name=infer][value.value=true]))',
          message:
            'Add "{ infer: true }" to configService.get() for correct typechecking. Example: configService.get("database.port", { infer: true })',
        },
        {
          selector:
            'CallExpression[callee.name=it][arguments.0.value!=/^should/]',
          message: '"it" should start with "should"',
        },
      ],
      // Best Practices cho Backend (Node.js/NestJS)
      'eqeqeq': ['error', 'always'], // Bắt buộc dùng ===
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Hạn chế console.log, chỉ cho phép warn, error, info
      'complexity': ['warn', 15], // Cảnh báo nếu function quá phức tạp (vượt quá 15 nhánh logic)
      'max-depth': ['warn', 4], // Cảnh báo nếu lồng if/for quá 4 tầng
      'curly': ['error', 'all'], // Bắt buộc luôn dùng ngoặc nhọn cho if/for
      'consistent-return': 'error', // Bắt buộc hàm phải return nhất quán
      
      // Strict TypeScript Rules
      '@typescript-eslint/no-explicit-any': 'warn', // Cảnh báo dùng any (mặc định tắt, giờ bật lên warn)
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }], // Yêu cầu khai báo kiểu return cho function
      '@typescript-eslint/no-unnecessary-condition': 'error', // Báo lỗi nếu check điều kiện thừa (ví dụ if(true))
      '@typescript-eslint/await-thenable': 'error', // Báo lỗi nếu await một hàm không phải async
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'] },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'memberLike', modifiers: ['private'], format: ['camelCase'], leadingUnderscore: 'require' },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE'] }
      ]
    },
  },
];
