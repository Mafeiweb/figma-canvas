<template>
  <v-group v-if="shape.visible !== false">
    <v-rect
      v-if="shape.type === 'rect'"
      :config="{
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        fill: shape.fill || '#ccc',
        stroke: selected ? '#007bff' : 'transparent',
        strokeWidth: selected ? 3 : 1,
        draggable: true,
        rotation: shape.rotation || 0,
      }"
      @click.stop="onSelect"
      @dragmove="onDragMove"
      @dragend="onDragEnd"
      @transformend="onTransformEnd"
    />
    <v-circle
      v-else-if="shape.type === 'circle'"
      :config="{
        x: shape.x + shape.width / 2,
        y: shape.y + shape.height / 2,
        radius: shape.width / 2,
        fill: shape.fill || '#ccc',
        stroke: selected ? '#007bff' : 'transparent',
        strokeWidth: selected ? 3 : 1,
        draggable: true,
      }"
      @click.stop="onSelect"
      @dragmove="onDragMoveCircle"
      @dragend="onDragEndCircle"
    />
  </v-group>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps({
  shape: Object,
  selected: Boolean,
});
const emit = defineEmits(["select", "dragging", "dragend", "transform"]);

const onSelect = () => {
  emit("select", props.shape.id);
};

const onDragMove = (e: any) => {
  const node = e.target;
  emit("dragging", props.shape.id, node.x(), node.y());
};

const onDragEnd = (e: any) => {
  const node = e.target;
  emit("dragend", props.shape.id, node.x(), node.y());
};

const onDragMoveCircle = (e: any) => {
  const node = e.target;
  emit(
    "dragging",
    props.shape.id,
    node.x() - props.shape.width / 2,
    node.y() - props.shape.height / 2
  );
};

const onDragEndCircle = (e: any) => {
  const node = e.target;
  emit(
    "dragend",
    props.shape.id,
    node.x() - props.shape.width / 2,
    node.y() - props.shape.height / 2
  );
};

const onTransformEnd = (e: any) => {
  const node = e.target;
  // update shape properties: rotation and scale -> adjust width/height and x/y
  const rotation = node.rotation();
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  const newW = Math.max(10, props.shape.width * scaleX);
  const newH = Math.max(10, props.shape.height * scaleY);
  // reset scale to 1
  node.scale({ x: 1, y: 1 });
  emit("transform", props.shape.id, {
    x: node.x(),
    y: node.y(),
    width: newW,
    height: newH,
    rotation,
  });
};
</script>
