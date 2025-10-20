# Figma-like Canvas (Vite + Vue 3)

Run:
```bash
npm install
npm run dev
```



# 🎯 Vue3 + Konva Canvas 类 Figma 画布 — 技术点汇总

## 使用技术栈
- **Vue 3 + Composition API**: 组件化、响应式管理
- **Pinia**: 管理图形数据、选中状态、历史记录 (undo/redo)
- **Konva + vue-konva**: Canvas 渲染、图层管理、Transformer 控件
- **TypeScript**: 类型约束和事件参数校验
- **Vite**: 开发和构建工具

## 已实现功能
- 多节点绘制（Rect、Circle、Line 等）
- 框选（Rubber Band Selection）
- 拖拽移动 + 磁性吸附（Snap to Guide）
- 对齐辅助线显示/隐藏
- Transformer 支持旋转和缩放控制点
- 网格渲染 + 无限画布（模拟 ±5000px 范围）
- 右键/双指平移画布
- 滚轮及双指缩放（缩放中心为指针）
- 撤销 / 重做（历史栈管理）
- 图层面板（LayersPanel）和右侧属性面板 UI
- Toolbar 工具条示例
- 测试数据自动注入

## 交互支持
- 鼠标拖拽 / 触控板双指平移画布
- 双指 Pinch 缩放画布
- Shift + 框选多选
- Transformer 旋转/缩放
- 对齐辅助线吸附

## 可扩展能力
- 文本编辑
- Group / Ungroup
- 图层锁定 / 隐藏
- 导出 PNG / SVG
- 多选对齐工具（左对齐 / 居中 / 右对齐）
- 标尺及参考线
- 插件架构扩展

## 适用场景
- 在线白板
- UI 原型设计工具
- 流程图 / 脑图编辑器
- 海报排版工具
- PPT 在线编辑器
- 组件拖拽设计器（低代码）
