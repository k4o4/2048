// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        include: [
            'tests/unit/**/*.spec.ts',
            'tests/integration/**/*.spec.ts',
            'tests/acceptance/**/*.spec.ts',
            'tests/property/**/*.spec.ts',
        ],
        exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['engine/**'],
            thresholds: { lines: 95, functions: 95, statements: 95, branches: 90 },
        },
    },
});
