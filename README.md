# Figma-like Canvas (Vite + Vue 3)

🎯 技术点汇总 — Vue3 + Konva Canvas Figma 式画布
1️⃣ 框架 & 核心技术
技术	用途
Vue 3 + <script setup> + Composition API	响应式状态管理、组件化结构、轻量化开发
Pinia（useCanvasStore）	画布状态管理：图形列表、选中状态、缩放比例、对齐线、撤销重做历史
Vue-Konva	将 Konva 封装为 Vue 组件，操作 Canvas 元素（Shape / Layer / Stage / Transformer）
Konva.js	HTML5 Canvas 的高级封装，支持拖拽、旋转、缩放、分组、事件处理

2️⃣ 画布结构 & UI
功能模块	技术点	说明
无限画布	Konva Stage + 拖拽 + 缩放	使用 Stage 的 scale 和 position 配合鼠标/触控板操作，实现无限可滚动画布
图形渲染	v-layer + CanvasShape.vue	支持矩形、圆、图片等，通过循环渲染 store.shapes
选择框	Konva Rect + 响应式 selection	鼠标或触控板点击拖动生成矩形选择框，实现框选功能
Transformer	Konva Transformer	支持选中图形的缩放、旋转、控制点操作（八个角 + 中边 + 保持比例选项）
对齐线 / 吸附	Konva Line + store 计算	鼠标拖动时，显示虚线对齐线，并自动 snap 到对齐线（水平/垂直）
栅格网格	Konva Line 循环生成	用循环绘制水平 + 垂直线，实现 50px 栅格，支持无限画布
UI 面板	Vue 组件（Toolbar、LayersPanel、RightPanel）	可扩展工具栏按钮、图层面板，方便未来功能扩展
3️⃣ 交互事件 & 手势
类型	技术点	实现方式
鼠标操作	mousedown / mousemove / mouseup / wheel	- 鼠标拖动选择框
- 鼠标滚轮缩放
- 右键拖动平移画布
触控板 / 移动端	touchstart / touchmove / touchend / wheel	- 双指滑动 → 平移画布
- 双指捏合 → 缩放
- 阻止默认滚动 evt.preventDefault()
拖拽图形	Konva dragmove / dragend	- 拖动图形时计算 snap
- 拖动结束时更新 store 并记录历史
框选图形	自定义矩形选择逻辑	- 鼠标/触控起点 + 移动中计算矩形宽高
- store.selectByBox 选中范围内图形
缩放中心控制	计算鼠标/手指相对画布位置	- 缩放以鼠标/手指中心为中心，避免画布偏移
4️⃣ 缩放 & 平移逻辑
功能	技术点
缩放	- stage.scale({x, y})
- 缩放中心计算 (pointer.x - stage.x)/scale
- 最大最小值限制 Math.max(MIN, Math.min(MAX, newScale))
平移	- stage.position({x, y})
- 鼠标右键拖动 / 双指滑动
- 平滑惯性可选 requestAnimationFrame
5️⃣ 响应式 & 计算
功能	技术点
响应式缩放	Vue watch(store.zoom) 重新绘制栅格线
选中图形变化	Vue watch(store.selectedIds) 自动绑定 Transformer
图形吸附	store 计算 dx/dy → 自动 snap
6️⃣ 其他关键点
功能	技术点
撤销 / 重做	store 维护 history 数组，pushHistory() / undo() / redo()
设备像素比	strokeWidth: 1 / window.devicePixelRatio 确保栅格线在 Retina 屏幕清晰
无限画布范围	for (let i = -range; i <= range; i += GRID_SIZE) 生成网格线
高性能绘制	- 分层 v-layer（网格层 vs 主图形层）
- batchDraw() 避免频繁重绘
7️⃣ 可扩展点

支持 多类型 Shape：矩形、圆、图片、SVG 等

图层面板控制图形显示/隐藏/锁定

插件式工具栏增加功能：文字、箭头、路径

拓展触控手势：三指滑动切换工具

协同编辑 / WebSocket 实时更新
Run:
```bash
npm install
npm run dev
```
