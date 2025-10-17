<template>
  <div class="toolbar">
    <div @click="addRect" class="btn">添加矩形</div>
    <div @click="deleteSelected" class="btn">删除</div>
    <div @click="undo" class="btn">撤销</div>
    <div @click="redo" class="btn">还原</div>
  </div>
</template>

<script setup lang="ts">
import { useCanvasStore } from "@/store/useCanvasStore";
const store = useCanvasStore();
function addRect() {
  store.addRect();
}
function deleteSelected() {
  store.deleteSelected();
}
function undo() {
  store.undo();
}
function redo() {
  store.redo();
}
</script>

<style scoped lang="less">
.toolbar {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.btn {
  text-align: center;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
}
</style>
