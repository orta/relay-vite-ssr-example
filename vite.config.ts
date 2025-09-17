import { defineConfig, UserConfig } from "vite"
import react from "@vitejs/plugin-react"
import relay from "vite-plugin-relay"
import { cjsInterop } from "vite-plugin-cjs-interop"

// https://vitejs.dev/config/
export default defineConfig((): UserConfig => {
  return {
    plugins: [
      react(),
      relay,
      cjsInterop({
        dependencies: [
          "react-relay",
          "react-helmet-async"
        ]
      })
    ],
    optimizeDeps: {
      include: [
        "relay-runtime",
        "relay-runtime/experimental",
        "react-relay",
        "react-helmet-async",
      ],
    },
  }
})
