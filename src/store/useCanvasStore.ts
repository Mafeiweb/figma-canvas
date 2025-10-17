
import { defineStore } from 'pinia'
import { reactive, ref, toRaw } from 'vue'
import cloneDeep from 'lodash.clonedeep'

export type Shape = {
  id: string
  type: 'rect' | 'circle'
  x: number
  y: number
  width: number
  height: number
  fill?: string
  rotation?: number
  visible?: boolean
}

export const useCanvasStore = defineStore('canvas', () => {
  const shapes = reactive<Shape[]>([
    { id: '1', type: 'rect', x: 80, y: 60, width: 140, height: 100, fill: '#FFB6C1', rotation: 0, visible: true },
    { id: '2', type: 'rect', x: 320, y: 160, width: 150, height: 110, fill: '#90EE90', rotation: 0, visible: true },
    { id: '3', type: 'circle', x: 600, y: 240, width: 100, height: 100, fill: '#87CEFA', rotation: 0, visible: true },
    { id: '4', type: 'rect', x: 940, y: 220, width: 200, height: 120, fill: '#FFD700', rotation: 0, visible: true },
    { id: '5', type: 'rect', x: 220, y: 480, width: 130, height: 100, fill: '#FFA07A', rotation: 0, visible: true },
    { id: '6', type: 'rect', x: 560, y: 580, width: 100, height: 80, fill: '#B0C4DE', rotation: 0, visible: true },
    { id: '7', type: 'rect', x: 820, y: 480, width: 140, height: 110, fill: '#98FB98', rotation: 0, visible: true },
    { id: '8', type: 'circle', x: 1160, y: 360, width: 120, height: 120, fill: '#FF69B4', rotation: 0, visible: true },
    { id: '9', type: 'rect', x: 420, y: 720, width: 150, height: 130, fill: '#20B2AA', rotation: 0, visible: true },
    { id: '10', type: 'rect', x: 760, y: 120, width: 100, height: 100, fill: '#9370DB', rotation: 0, visible: true },
  ])

  const selectedIds = ref<string[]>([])
  const zoom = ref(1)
  const stagePos = reactive({ x: 0, y: 0 })
  const guides = reactive<{ v: number[] | null; h: number[] | null }>({ v: null, h: null })

  // undo/redo stacks store deep clones of shapes array
  const undoStack: Shape[][] = []
  const redoStack: Shape[][] = []

  const pushHistory = () => {
    undoStack.push(cloneDeep(toRaw(shapes)))
    // clear redo on new action
    redoStack.length = 0
    // keep history short
    if (undoStack.length > 50) undoStack.shift()
  }
  // 撤销
  const undo = ()=> {
    if (undoStack.length === 0) return
    const last = undoStack.pop()!
    redoStack.push(cloneDeep(toRaw(shapes)))
    // restore
    shapes.splice(0, shapes.length, ...cloneDeep(last))
  }
  // 重做
  const redo = () => {
    if (redoStack.length === 0) return
    const next = redoStack.pop()!
    undoStack.push(cloneDeep(toRaw(shapes)))
    shapes.splice(0, shapes.length, ...cloneDeep(next))
  }

  // 选中的模块
  const setSelected = (id: string | null, append = false) => {
    if (!id) {
      selectedIds.value = []
      return
    }
    if (append) {
      if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
    } else {
      selectedIds.value = [id]
    }
  }
  //  更新形状位置
  const updateShapePos = (id: string, x: number, y: number) => {
    const s = shapes.find((sh) => sh.id === id)
    if (s) {
      s.x = x
      s.y = y
    }
  }

  // 更新形状变换
  const updateShapeTransform = (id: string, props: Partial<Shape>) =>  {
    const s = shapes.find((sh) => sh.id === id)
    if (s) {
      Object.assign(s, props)
    }
  }

  const selectByBox = (box: { x: number; y: number; width: number; height: number }) =>{
    const x1 = Math.min(box.x, box.x + box.width)
    const y1 = Math.min(box.y, box.y + box.height)
    const x2 = Math.max(box.x, box.x + box.width)
    const y2 = Math.max(box.y, box.y + box.height)
    const hits = shapes.filter((s) => {
      const sx1 = s.x
      const sy1 = s.y
      const sx2 = s.x + s.width
      const sy2 = s.y + s.height
      return !(sx2 < x1 || sx1 > x2 || sy2 < y1 || sy1 > y2)
    }).map(s => s.id)
    selectedIds.value = hits
  }

  const computeGuidesAndSnap = (movingShape: Shape | null) =>{
    // returns snap adjustments {dx, dy} and also fills guides in store
    const tol = 6
    guides.v = null
    guides.h = null
    if (!movingShape) return { dx: 0, dy: 0 }
    const others = shapes.filter(s => s.id !== movingShape.id)
    const cx = movingShape.x + movingShape.width / 2
    const cy = movingShape.y + movingShape.height / 2

    let snapX: number | null = null
    let snapY: number | null = null

    for (const o of others) {
      const ocx = o.x + o.width / 2
      const ocy = o.y + o.height / 2

      // center align
      if (Math.abs(ocx - cx) <= tol) {
        guides.v = [ocx, 0, ocx, 4000]
        snapX = ocx - movingShape.width / 2
      }
      if (Math.abs(ocy - cy) <= tol) {
        guides.h = [0, ocy, 4000, ocy]
        snapY = ocy - movingShape.height / 2
      }

      // left/right align
      const oLeft = o.x
      const oRight = o.x + o.width
      const mLeft = movingShape.x
      const mRight = movingShape.x + movingShape.width
      if (Math.abs(oLeft - mLeft) <= tol) {
        guides.v = [oLeft, 0, oLeft, 4000]
        snapX = oLeft
      }
      if (Math.abs(oRight - mRight) <= tol) {
        guides.v = [oRight, 0, oRight, 4000]
        snapX = oRight - movingShape.width
      }

      // top/bottom align
      const oTop = o.y
      const oBottom = o.y + o.height
      const mTop = movingShape.y
      const mBottom = movingShape.y + movingShape.height
      if (Math.abs(oTop - mTop) <= tol) {
        guides.h = [0, oTop, 4000, oTop]
        snapY = oTop
      }
      if (Math.abs(oBottom - mBottom) <= tol) {
        guides.h = [0, oBottom, 4000, oBottom]
        snapY = oBottom - movingShape.height
      }
    }

    return { dx: snapX !== null ? (snapX - movingShape.x) : 0, dy: snapY !== null ? (snapY - movingShape.y) : 0 }
  }

  const clearGuides = () => {
    guides.v = null
    guides.h = null
  }

  const addRect = () =>{
    pushHistory()
    const id = Date.now().toString()
    shapes.push({ id, type: 'rect', x: 200, y: 200, width: 140, height: 90, fill: '#cccccc', rotation: 0, visible: true })
    selectedIds.value = [id]
  }

  const deleteSelected =() => {
    if (selectedIds.value.length === 0) return
    pushHistory()
    for (const id of selectedIds.value) {
      const idx = shapes.findIndex(s => s.id === id)
      if (idx >= 0) shapes.splice(idx, 1)
    }
    selectedIds.value = []
  }

  const toggleVisibility = (id: string) =>{
    const s = shapes.find(sh => sh.id === id)
    if (s) s.visible = !s.visible
  }

  return { shapes, selectedIds, zoom, stagePos, guides, setSelected, updateShapePos, updateShapeTransform, selectByBox, computeGuidesAndSnap, clearGuides, pushHistory, undo, redo, addRect, deleteSelected, toggleVisibility }
})
