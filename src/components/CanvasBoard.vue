<template>
  <div class="canvas-wrapper" @contextmenu.prevent>
    <div class="left-panel">
      <LayersPanel />
    </div>

    <div class="main-area">
      <Toolbar class="toolbar" />
      <v-stage
        ref="stageRef"
        :config="stageConfig"
        @wheel="onWheel"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
      >
        <!-- 新增网格层 -->
        <v-layer ref="gridLayer">
          <v-line v-for="line in gridLines" :key="line.id" :config="line" />
        </v-layer>
        <v-layer ref="mainLayer">
          <!-- alignment guides -->
          <v-line
            v-if="store.guides.v"
            :config="{
              points: store.guides.v,
              stroke: '#00aaff',
              dash: [6, 4],
              strokeWidth: 1,
            }"
          />
          <v-line
            v-if="store.guides.h"
            :config="{
              points: store.guides.h,
              stroke: '#00aaff',
              dash: [6, 4],
              strokeWidth: 1,
            }"
          />

          <!-- shapes -->
          <CanvasShape
            v-for="shape in store.shapes"
            :key="shape.id"
            :shape="shape"
            :selected="store.selectedIds.includes(shape.id)"
            @select="onShapeSelect"
            @dragging="onShapeDragging"
            @dragend="onShapeDragEnd"
            @transform="onShapeTransform"
          />

          <!-- transformer -->
          <v-transformer
            v-if="transformNode"
            :config="transformConfig"
            ref="transformerRef"
          />
          <!-- selection rectangle -->
          <v-rect
            v-if="selection.active"
            :config="{
              x: selection.x,
              y: selection.y,
              width: selection.width,
              height: selection.height,
              stroke: '#007bff',
              dash: [6, 4],
              strokeWidth: 1,
              listening: false,
              fill: 'rgba(0,123,255,0.05)',
            }"
          />
        </v-layer>
      </v-stage>
    </div>
    <div class="right-panel">
      <RightPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from "vue";
import CanvasShape from "./CanvasShape.vue";
import { useCanvasStore } from "@/store/useCanvasStore";
import LayersPanel from "./LayersPanel.vue";
import Toolbar from "./Toolbar.vue";
import RightPanel from "./RightPanel.vue";

const store = useCanvasStore();
const gridLayer = ref<any>(null);
const gridLines = ref<any[]>([]);
const isPanning = ref(false);
const lastPos = ref({ x: 0, y: 0 });
const GRID_SIZE = 50;

const stageRef = ref<any>(null);
const mainLayer = ref<any>(null);
const transformerRef = ref<any>(null);

const stageConfig = reactive({
  width: window.innerWidth - 300,
  height: window.innerHeight,
  draggable: false,
  scaleX: store.zoom,
  scaleY: store.zoom,
});

const selection = reactive({ active: false, x: 0, y: 0, width: 0, height: 0 });
const transformNode = ref(null);

onMounted(() => {
  // nothing else
  drawGrid();
  initTouchpadGestures();
});

// watch selection to attach transformer to selected node
watch(
  () => store.selectedIds.slice(),
  async () => {
    await nextTick();
    const stage = stageRef.value.getNode();
    const tr = transformerRef.value?.getNode();
    if (!tr) return;
    if (store.selectedIds.length === 1) {
      const id = store.selectedIds[0];
      const node = findNodeById(id);
      if (node) {
        tr.nodes([node]);
        tr.getLayer().batchDraw();
        transformNode.value = node;
      }
    } else {
      tr.nodes([]);
      transformNode.value = null;
      tr.getLayer().batchDraw();
    }
  }
);
watch(
  () => store.zoom,
  () => {
    drawGrid();
  }
);
onMounted(() => {
  drawGrid();
  initTouchpadGestures();
});

/**
 * ✅ 初始化触控板手势（支持 Mac 双指滑动平移 + 捏合缩放）
 */
const initTouchpadGestures = () => {
  const stage = stageRef.value.getNode();
  let lastCenter = null;
  let lastDistance = 0;
  let isTouch = false;
  let lastStagePos = { x: 0, y: 0 };

  /** ----------------------------
   * 🖐️ 移动端两指捏合缩放（iPad / 手机）
   * ---------------------------- */
  stage.on("touchstart", (e: any) => {
    // console.log("touchstart");
    const touches = e.evt.touches;
    if (touches.length === 2) {
      isTouch = true;
      lastCenter = getTouchCenter(touches[0], touches[1]);
      lastDistance = getTouchDistance(touches[0], touches[1]);
      lastStagePos = { x: stage.x(), y: stage.y() };
    }
  });

  stage.on("touchmove", (e: any) => {
    // console.log("touchmove");
    if (!isTouch) return;
    const touches = e.evt.touches;
    if (touches.length !== 2) return;
    e.evt.preventDefault();

    const center = getTouchCenter(touches[0], touches[1]);
    const distance = getTouchDistance(touches[0], touches[1]);
    const scaleBy = distance / lastDistance;
    const oldScale = stage.scaleX();
    const newScale = Math.max(0.2, Math.min(oldScale * scaleBy, 4));

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: -(mousePointTo.x - center.x / newScale) * newScale,
      y: -(mousePointTo.y - center.y / newScale) * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();

    lastDistance = distance;
    lastCenter = center;
  });

  stage.on("touchend", () => {
    isTouch = false;
    lastDistance = 0;
    lastCenter = null;
  });

  /** ----------------------------
   * Mac 触控板双指滑动 = 平移
   * ---------------------------- */
  stage.on("wheel", (e: any) => {
    console.log("wheel");
    e.evt.preventDefault();

    const evt = e.evt as WheelEvent;

    // 🖱️ Ctrl / Meta 按下 = 缩放
    if (evt.ctrlKey || evt.metaKey) {
      console.log("wheel: 缩放");
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      const scaleBy = 1.05;
      const direction = evt.deltaY > 0 ? 1 / scaleBy : scaleBy;
      const newScale = Math.max(0.02, Math.min(oldScale * direction, 6));
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      stage.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      console.log("wheel: 平移", newScale);
      const clamped = Math.max(0.02, Math.min(newScale, 6));
      store.zoom = clamped;
      stage.position(newPos);
      stage.batchDraw();
      return;
    }

    // 双指滑动平移（普通平滑滚动时禁止缩放）
    // 如果 deltaX 或 deltaY 很小且没有 ctrl/meta，则只平移
    stage.x(stage.x() - evt.deltaX);
    stage.y(stage.y() - evt.deltaY);
    stage.batchDraw();
  });
};

/** 获取两指间距离 */
const getTouchDistance = (p1: Touch, p2: Touch) =>
  Math.sqrt((p2.clientX - p1.clientX) ** 2 + (p2.clientY - p1.clientY) ** 2);

/** 获取两指中点 */
const getTouchCenter = (p1: Touch, p2: Touch) => ({
  x: (p1.clientX + p2.clientX) / 2,
  y: (p1.clientY + p2.clientY) / 2,
});

const drawGrid = () => {
  const lines = [];
  const range = 5000; // 无限画布区域
  for (let i = -range; i <= range; i += GRID_SIZE) {
    lines.push({
      id: `v-${i}`,
      points: [i, -range, i, range],
      stroke: "#eee",
      strokeWidth: 1 / window.devicePixelRatio,
      listening: false,
    });
    lines.push({
      id: `h-${i}`,
      points: [-range, i, range, i],
      stroke: "#eee",
      strokeWidth: 1 / window.devicePixelRatio,
      listening: false,
    });
  }
  gridLines.value = lines;
};

const findNodeById = (id: string) => {
  const layer = mainLayer.value.getNode();
  // iterate children to find Konva node with matching attrs
  const children = layer.getChildren().toArray();
  for (const c of children) {
    if (c.getAttr && c.getAttr("id") === id) return c;
    // also check shape types (rect/circle) - we set id via attr below
    if (c._id === id) return c;
  }
  return null;
};

// shape select
const onShapeSelect = (id: string) => {
  store.setSelected(id);
};

// 使用捕捉功能拖动处理
const onShapeDragging = (id: string, x: number, y: number) => {
  // 根据预期的 bbox 从 store 计算 snap
  const s = store.shapes.find((sh) => sh.id === id);
  if (!s) return;
  // 使用建议的 x/y 构建临时形状来计算
  const temp = { ...s, x, y };
  const snap = store.computeGuidesAndSnap(temp as any);
  const nx = x + snap.dx;
  const ny = y + snap.dy;
  store.updateShapePos(id, nx, ny);
};

const onShapeDragEnd = (id: string, x: number, y: number) => {
  // push history and finalize
  store.pushHistory();
  store.clearGuides();
};

// transformer transform end
const onShapeTransform = (id: string, props: any) => {
  store.pushHistory();
  store.updateShapeTransform(id, props);
};

const getRelativePointer = (stage: any) => {
  const pos = stage.getPointerPosition();
  const scale = store.zoom;
  return {
    x: (pos.x - stage.x()) / scale,
    y: (pos.y - stage.y()) / scale,
  };
};

const onMouseDown = (e: any) => {
  const stage = stageRef.value.getNode();

  // 右键拖动画布
  if (e.evt.button === 2 || e.evt.button === 1) {
    isPanning.value = true;
    lastPos.value = { x: e.evt.clientX, y: e.evt.clientY };
    return;
  }

  // 框选逻辑（原本的）
  if (e.target === stage) {
    const p = getRelativePointer(stage);
    selection.active = true;
    selection.x = p.x;
    selection.y = p.y;
    selection.width = 0;
    selection.height = 0;
    store.setSelected(null);
  }
};

const onMouseMove = (e: any) => {
  const stage = stageRef.value.getNode();

  //  右键拖动画布
  if (isPanning.value) {
    const dx = e.evt.clientX - lastPos.value.x;
    const dy = e.evt.clientY - lastPos.value.y;
    stage.x(stage.x() + dx);
    stage.y(stage.y() + dy);
    lastPos.value = { x: e.evt.clientX, y: e.evt.clientY };
    stage.batchDraw();
    return;
  }

  // 框选逻辑
  if (!selection.active) return;
  const p = getRelativePointer(stage);
  selection.width = p.x - selection.x;
  selection.height = p.y - selection.y;
};

const onMouseUp = () => {
  //  结束画布拖动
  isPanning.value = false;

  if (!selection.active) return;
  selection.active = false;
  store.selectByBox({
    x: selection.x,
    y: selection.y,
    width: selection.width,
    height: selection.height,
  });
};

// wheel zoom centered on mouse
const onWheel = (e: any) => {
  e.evt.preventDefault();
  // const stage = stageRef.value.getNode();
  // const oldScale = store.zoom;
  // const pointer = stage.getPointerPosition();
  // const mousePointTo = {
  //   x: (pointer.x - stage.x()) / oldScale,
  //   y: (pointer.y - stage.y()) / oldScale,
  // };
  // const scaleBy = 1.07;
  // const direction = e.evt.deltaY > 0 ? -1 : 1;
  // const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
  // const clamped = Math.max(0.2, Math.min(newScale, 4));
  // store.zoom = clamped;
  // stage.scale({ x: clamped, y: clamped });
  // const newPos = {
  //   x: -(mousePointTo.x - pointer.x / clamped) * clamped,
  //   y: -(mousePointTo.y - pointer.y / clamped) * clamped,
  // };
  // stage.position(newPos);
  // stage.batchDraw();
};

const transformConfig = {
  rotateEnabled: true,
  enabledAnchors: [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
    "middle-left",
    "middle-right",
    "top-center",
    "bottom-center",
  ],
  keepRatio: false,
  boundBoxFunc(oldBox: any, newBox: any) {
    // prevent too small
    if (newBox.width < 10 || newBox.height < 10) return oldBox;
    return newBox;
  },
};
</script>

<style scoped>
.canvas-wrapper {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: #f7f7f7;
  overflow: hidden;
}
.left-panel {
  width: 240px;
  border-right: 1px solid #e6e6e6;
  background: #fff;
}
.right-panel {
  width: 240px;
  border-left: 1px solid #e6e6e6;
  background: #fff;
}
.main-area {
  flex: 1;
  max-width: calc(100vw - 480px);
  position: relative;
}
.toolbar {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 20;
}
.panel {
  position: sticky;
  top: 12px;
  font-size: 13px;
}
</style>
