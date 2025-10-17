<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { useCanvasStore } from "@/store/useCanvasStore";

const store = useCanvasStore();
const reversed = computed(() => [...store.shapes].reverse());
const visibleMap = reactive<Record<string, boolean>>({});
// init map
for (const s of store.shapes) visibleMap[s.id] = s.visible !== false;

watch(
  visibleMap,
  (nv) => {
    for (const k in nv) {
      const sh = store.shapes.find((s) => s.id === k);
      if (sh) sh.visible = nv[k];
    }
  },
  { deep: true }
);

function select(id: string) {
  store.setSelected(id);
}
function toggle(id: string) {
  store.toggleVisibility(id);
}
function isSelected(id: string) {
  return store.selectedIds.includes(id);
}
</script>

<template>
  <div class="leftPanel">
    <div class="leftPanel_Icon">
      <div class="icon_box">
        <icons class="icon" name="figma" />
      </div>
      <div class="icon_box">
        <icons class="icon" name="move" />
      </div>
    </div>
    <div class="layers">Layers</div>
    <div class="layers_list">
      <div
        class="layers_list_item"
        v-for="shape in reversed"
        :key="shape.id"
        :class="{ selected: isSelected(shape.id) }"
        @click="select(shape.id)"
      >
        <!-- <input
          type="checkbox"
          v-model="visibleMap[shape.id]"
          @change="toggle(shape.id)"
        /> -->
        <div class="cover">{{ shape.type.charAt(0).toUpperCase() }}</div>
        <div class="pageName">{{ shape.id }}</div>
      </div>
    </div>
  </div>
</template>
<style scoped lang='less'>
.leftPanel {
  width: 240px;
  height: 100vh;
  overflow: hidden;
  background: #fff;
  border-right: 1px solid #0000001a;
  &_Icon {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .icon_box {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    .icon_box:hover {
      background: #f5f5f5;
      cursor: pointer;
    }
  }
  .layers {
    height: 40px;
    line-height: 40px;
    color: #000000e6;
    box-sizing: border-box;
    padding-left: 16px;
    font-size: 14px;
    border-top: 1px solid #e6e6e6;
  }
  .layers_list {
    height: 100%;
    overflow: scroll;
    &_item {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      box-sizing: border-box;

      padding-left: 16px;
      font-size: 12px;
      .cover {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        background: #eee;
        text-align: center;
        line-height: 32px;
      }
      .pageName {
        flex: 1;
        overflow: hidden;
        box-sizing: border-box;
        padding: 0 8px;
      }
      &:hover {
        border-radius: 4px;
        background: #f5f5f5;
        cursor: pointer;
      }
    }
  }
}
</style>
