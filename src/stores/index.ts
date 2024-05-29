// store.ts
import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import animation from './animation'
import compose from './compose'
import contextmenu from './contextmenu'
import copy from './copy'
import event from './event'
import layer from './layer'
import snapshot from './snapshot'
import lock from './lock'

export const useMainStore = defineStore('main', () => {
  const state = reactive({
    ...animation.state,
    ...compose.state,
    ...contextmenu.state,
    ...copy.state,
    ...event.state,
    ...layer.state,
    ...snapshot.state,
    ...lock.state,
    lastScale: 100,
    editMode: 'edit',
    canvasStyleData: {
      width: 1200,
      height: 740,
      scale: 100,
      color: '#000',
      opacity: 1,
      background: '#fff',
      fontSize: 14,
    },
    isInEditor: false,
    componentData: [] as any[],
    curComponent: null as any | null,
    curComponentIndex: null as number | null,
    isClickComponent: false,
    rightList: true,
    isDarkMode: false,
  })

  const toggleDarkMode = (status: boolean) => {
    state.isDarkMode = status
    state.canvasStyleData.background = status ? '#817f7f' : '#fff'
    localStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode))
  }

  // Computed properties can be defined using the `computed` function.
  const curComponentData = computed(() => state.curComponent)

  const aceSetCanvasData = (value: any) => {
    state.canvasStyleData = value
  }

  const setLastScale = (value: number) => {
    state.lastScale = value
  }

  const aceSetcurComponent = (value: any) => {
    state.componentData = state.componentData.filter((item) => item.id !== value.id)
    state.componentData.push(value)
    state.curComponent = value
  }

  const setClickComponentStatus = (status: boolean) => {
    state.isClickComponent = status
  }

  const isShowRightList = () => {
    state.rightList = !state.rightList
  }

  const setEditMode = (mode: string) => {
    state.editMode = mode
  }

  const setInEditorStatus = (status: boolean) => {
    state.isInEditor = status
  }

  const setCanvasStyle = (style: Record<string, any>) => {
    state.canvasStyleData = style
  }

  const setCurComponent = ({ component, index }: { component: any; index: number | null }) => {
    state.curComponent = component
    state.curComponentIndex = index
  }

  const setShapeStyle = ({ top, left, width, height, rotate, padding }: any) => {
    if (state.curComponent) {
      if (top !== undefined) state.curComponent.style.top = Math.round(top)
      if (left !== undefined) state.curComponent.style.left = Math.round(left)
      if (width) state.curComponent.style.width = Math.round(width)
      if (padding) state.curComponent.style.padding = Math.round(padding)
      if (height) state.curComponent.style.height = Math.round(height)
      if (rotate) state.curComponent.style.rotate = Math.round(rotate)
    }
  }

  const setShapeSingleStyle = ({ key, value }: { key: string; value: any }) => {
    if (state.curComponent) {
      state.curComponent.style[key] = value
    }
  }

  const setComponentData = (componentData: any[] = []) => {
    state.componentData = componentData
  }

  const addComponent = ({ component, index }: { component: any; index?: number }) => {
    if (index !== undefined) {
      state.componentData.splice(index, 0, component)
    } else {
      state.componentData.push(component)
    }
  }

  const deleteComponent = (index?: number) => {
    if (index === undefined) {
      index = state.curComponentIndex!
    }

    if (index == state.curComponentIndex) {
      state.curComponentIndex = null
      state.curComponent = null
    }

    if (/\d/.test(index.toString())) {
      state.componentData.splice(index, 1)
    }
  }

  return {
    state,
    curComponentData,
    aceSetCanvasData,
    setLastScale,
    aceSetcurComponent,
    setClickComponentStatus,
    isShowRightList,
    toggleDarkMode,
    setEditMode,
    setInEditorStatus,
    setCanvasStyle,
    setCurComponent,
    setShapeStyle,
    setShapeSingleStyle,
    setComponentData,
    addComponent,
    deleteComponent,
    ...animation.mutations,
    ...compose.mutations,
    ...contextmenu.mutations,
    ...copy.mutations,
    ...event.mutations,
    ...layer.mutations,
    ...snapshot.mutations,
    ...lock.mutations,
  }
})
