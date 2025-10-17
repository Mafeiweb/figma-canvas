<script lang='ts' setup>
import { useCanvasStore } from "@/store/useCanvasStore";
const store = useCanvasStore();
// Undo/Redo wrapper
const undo = () => {
  store.undo();
};
const redo = () => {
  store.redo();
};
const getZoom = () => {
  const zoomNumber = Number(store.zoom);
  return (zoomNumber * 100).toFixed(2);
};
</script>
<template>
  <div class="panel">
    <div class="title">Zoom: {{ getZoom() }}%</div>
    <div class="title">Selected: {{ store.selectedIds.join(", ") || "-" }}</div>
    <div class="btnList">
      <div @click="undo" class="btn">撤销</div>
      <div @click="redo" class="btn">还原</div>
    </div>
  </div>
</template>
<style scoped lang='less'>
.panel {
  width: 240px;
  height: 100vh;
  border-left: 1px solid #e6e6e6;
  background: #fff;
  font-size: 14px;
  padding: 8px;
  .title {
    font-size: 14px;
    margin-bottom: 12px;
    font-weight: 500;
    color: #333;
  }
  .btnList {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
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
  }
}
</style>
