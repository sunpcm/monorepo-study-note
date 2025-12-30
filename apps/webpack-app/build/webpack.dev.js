const { merge } = require('webpack-merge');
const comon = require('./webpack.common.js')
const path = require('path')

module.exports = merge(comon, {
	mode: 'development',
	// 源码映射 (Source Map)
  // 决定了你在浏览器 F12 里看到的是什么代码
  // eval-source-map: 构建速度中等，重构建速度快，质量高（能看到源码原始行号）
	devtool: 'eval-source-map',
	// 开发服务器 (DevServer)
  // 这是一个基于 Express 的小型服务器，把资源跑在内存里
	devServer: {
		static: path.resolve(__dirname, '../dist'), // 静态文件目录
		port: 3000,
		hot: true, // 开启热模块替换 (HMR)
		open: true, // 启动后自动打开浏览器
		compress: true, // 开启 gzip 压缩
		historyApiFallback: true,
		proxy: [
			{
				context: ['/api/datasets'],
				target: "http://localhost:8080",
				changeOrigin: true,
				pathRewrite: { '^/api/datasets': '' },
				logLevel: 'debug',
				// 如果后端是 https 且证书是自签名的，需要设为 false
        		secure: false,
			},
			{
				context: ['/api/experiments'],
				target: "http://localhost:8081",
				changeOrigin: true,
				pathRewrite: { '^/api/experiments': '' },
				logLevel: 'debug',
				// 如果后端是 https 且证书是自签名的，需要设为 false
        		secure: false,
			}
		]
			
	},
	module: {
		rules: [
			{
				test: /\.(css|scss)$/,
				use: [
					'style-loader', // 把 JS 里的 CSS 插入到 HTML 的 <style> 标签
					'css-loader', // 把 CSS 转换成 CommonJS 模块
					'sass-loader' // 把 SCSS 编译成 CSS
				]
			}
		]
	}
})