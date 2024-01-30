import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environmentMatchGlobs: [
      ['src/http/controllers/**/*.spec.ts', 'vitest-environments/prisma.ts'],
    ],
    dir: 'src',
  },
})
