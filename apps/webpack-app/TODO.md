# 待办清单

- [ ] **清理 webpack 生产配置**
  - 修正 `build/webpack.prod.js` 中的引入路径、`output.path` 配置，以及 loader 名称，确保生产打包可用。
- [ ] **补齐缺少的 loader / plugin**
  - 安装并配置 `@svgr/webpack` 等在配置文件中引用却尚未安装的依赖，让 SVG 等资源处理流程正常。
- [ ] **改进 React 入口类型**
  - 在 `src/index.tsx` 中为 `document.getElementById('root')` 做安全的空值检查，并使用 `HTMLElement` 类型断言。
- [ ] **补充构建说明文档**
  - 在 README 中写明依赖安装、开发调试 (`pnpm start`) 与生产构建 (`pnpm build`) 的操作步骤。
- [ ] **添加基础测试**
  - 为核心 React 组件添加至少一个单元测试或渲染测试，为后续迭代提供回归保障。



Webpack 生产环境优化 To-Do List
🔴 高优先级 (性能与体验)
[ ] 配置 MiniCssExtractPlugin

现状：styles.scss 目前被打包进了 main.js (体积 59 bytes)，这意味着使用了 style-loader。

问题：JS 加载完之前页面无样式 (FOUC)，且 JS 包体积略大。

行动：在生产环境配置中，将 style-loader 替换为 MiniCssExtractPlugin.loader，并添加插件实例。

[ ] 验证 CSS 压缩 (CssMinimizerPlugin)

行动：提取 CSS 后，确保安装并配置了 css-minimizer-webpack-plugin，否则提取出来的 CSS 文件可能包含多余空格和注释。

🟡 中优先级 (调试与可维护性)
[ ] 优化 Chunk 文件命名 (Named Chunks)

现状：Vendor 包的文件名是 701.b9b7...js，数字 ID (701) 可读性差。

行动：修改 optimization.splitChunks 配置，强制将 node_modules 下的包命名为 vendors 或 framework。

目标代码：vendors.b9b7...js。

[ ] 配置 output.chunkFilename

现状：Webpack 默认使用 ID 命名异步/拆分包。

行动：在 output 中添加 chunkFilename: '[name].[contenthash].js'，配合上面的 splitChunks 配置生效。

🟢 低优先级 (长期维护)
[ ] 检查 Source Map 策略

现状：Bundle Analyzer 能读到具体行号，说明生成了 Source Map。

行动：确认生产环境 (mode: 'production') 的 devtool 是否设置为了 false 或 'source-map' (生成独立 .map 文件)，避免将巨大的 map 信息内联到 JS 中导致体积膨胀。

[ ] 锁定 React 19 版本

现状：使用了 React 19.2.3 (RC/Canary 版本)。

行动：React 19 目前可能还在频繁更新，留意官方发布日志，确保生产环境稳定性。