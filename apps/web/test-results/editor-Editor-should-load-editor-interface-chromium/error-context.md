# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e5]:
    - img [ref=e7]
    - generic [ref=e10]: 加载中...
  - generic [ref=e15]:
    - generic [ref=e16]: "[plugin:vite:import-analysis] Failed to resolve import \"../components/CanvasToolbar.vue\" from \"src/views/EditorView.vue\". Does the file exist?"
    - generic [ref=e17]: G:/桌面代码/大屏/bigscreen-pro/apps/web/src/views/EditorView.vue:71:26
    - generic [ref=e18]: "9 | import ComponentPanel from \"../components/ComponentPanel.vue\"; 10 | import PropertyPanel from \"../components/PropertyPanel.vue\"; 11 | import CanvasToolbar from \"../components/CanvasToolbar.vue\"; | ^ 12 | const _sfc_main = /* @__PURE__ */ _defineComponent({ 13 | __name: \"EditorView\","
    - generic [ref=e19]: at TransformPluginContext._formatError (file:///G:/%E6%A1%8C%E9%9D%A2%E4%BB%A3%E7%A0%81/%E5%A4%A7%E5%B1%8F/bigscreen-pro/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.33_sass@1.97.3/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49258:41) at TransformPluginContext.error (file:///G:/%E6%A1%8C%E9%9D%A2%E4%BB%A3%E7%A0%81/%E5%A4%A7%E5%B1%8F/bigscreen-pro/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.33_sass@1.97.3/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49253:16) at normalizeUrl (file:///G:/%E6%A1%8C%E9%9D%A2%E4%BB%A3%E7%A0%81/%E5%A4%A7%E5%B1%8F/bigscreen-pro/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.33_sass@1.97.3/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64307:23) at process.processTicksAndRejections (node:internal/process/task_queues:95:5) at async file:///G:/%E6%A1%8C%E9%9D%A2%E4%BB%A3%E7%A0%81/%E5%A4%A7%E5%B1%8F/bigscreen-pro/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.33_sass@1.97.3/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64439:39 at async Promise.all (index 10) at async TransformPluginContext.transform (file:///G:/%E6%A1%8C%E9%9D%A2%E4%BB%A3%E7%A0%81/%E5%A4%A7%E5%B1%8F/bigscreen-pro/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.33_sass@1.97.3/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64366:7) at async PluginContainer.transform (file:///G:/%E6%A1%8C%E9%9D%A2%E4%BB%A3%E7%A0%81/%E5%A4%A7%E5%B1%8F/bigscreen-pro/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.33_sass@1.97.3/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49099:18) at async loadAndTransform (file:///G:/%E6%A1%8C%E9%9D%A2%E4%BB%A3%E7%A0%81/%E5%A4%A7%E5%B1%8F/bigscreen-pro/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.33_sass@1.97.3/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51978:27
    - generic [ref=e20]:
      - text: Click outside, press Esc key, or fix the code to dismiss.
      - text: You can also disable this overlay by setting
      - code [ref=e21]: server.hmr.overlay
      - text: to
      - code [ref=e22]: "false"
      - text: in
      - code [ref=e23]: vite.config.ts
      - text: .
```