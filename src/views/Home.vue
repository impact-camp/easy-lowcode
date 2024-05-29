<template>
  <div class="home">
    <Toolbar />

    <main>
      <!-- 左侧组件列表 -->
      <section :class="leftList ? 'left active' : 'left inactive'">
        <ComponentList />
        <RealTimeComponentList />
      </section>
      <el-button
        title="show-list-btn"
        class="btn show-list left-btn"
        :icon="leftList ? 'el-icon-arrow-left' : 'el-icon-arrow-right'"
        @click="isShowLeft"
      />
      <!-- 中间画布 -->
      <section class="center" :style="rightList ? 'margin-right:288px' : 'margin-right:10px'">
        <div
          class="content"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @mousedown="handleMouseDown"
          @mouseup="deselectCurComponent"
        >
          <Editor />
        </div>
      </section>
      <!-- 右侧属性列表 -->
      <section :class="rightList ? 'right active' : 'right inactive'">
        <el-tabs v-if="curComponent" v-model="activeName">
          <el-tab-pane label="属性" name="attr">
            <component :is="curComponent.component + 'Attr'" />
          </el-tab-pane>
          <el-tab-pane label="动画" name="animation" style="padding-top: 20px">
            <AnimationList />
          </el-tab-pane>
          <el-tab-pane label="事件" name="events" style="padding-top: 20px">
            <EventList />
          </el-tab-pane>
        </el-tabs>
        <CanvasAttr v-else />
      </section>
      <el-button
        title="show-list-btn"
        class="btn show-list right-btn"
        :icon="rightList ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"
        @click="isShowRight"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '@/store'
import Editor from '@/components/Editor/index'
import ComponentList from '@/components/ComponentList'
import AnimationList from '@/components/AnimationList'
import EventList from '@/components/EventList'
import componentList from '@/custom-component/component-list'
import Toolbar from '@/components/Toolbar'
import { deepCopy } from '@/utils/utils'
import generateID from '@/utils/generateID'
import { listenGlobalKeyDown } from '@/utils/shortcutKey'
import RealTimeComponentList from '@/components/RealTimeComponentList'
import CanvasAttr from '@/components/CanvasAttr'
import { changeComponentSizeWithScale } from '@/utils/changeComponentsSizeWithScale'
import { setDefaultcomponentData } from '@/store/snapshot'

const store = useStore()
const activeName = ref('attr')
const reSelectAnimateIndex = ref<undefined | number>(undefined)
const leftList = ref(true)

function restore() {
  if (localStorage.getItem('canvasData')) {
    setDefaultcomponentData(JSON.parse(localStorage.getItem('canvasData')))
    store.$patch({
      componentData: JSON.parse(localStorage.getItem('canvasData')),
    })
  }
  if (localStorage.getItem('canvasStyle')) {
    store.$patch({
      canvasStyleData: JSON.parse(localStorage.getItem('canvasStyle')),
    })
  }
}

onMounted(() => {
  restore()
  listenGlobalKeyDown()
  const savedMode = localStorage.getItem('isDarkMode')
  if (savedMode !== null) {
    store.toggleDarkMode(JSON.parse(savedMode))
  } else {
    store.isDarkMode = false
  }
})

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()

  const index = e.dataTransfer?.getData('index')
  const rectInfo = store.editor.value?.getBoundingClientRect()
  if (index && rectInfo) {
    const component = deepCopy(componentList[index])
    component.style.top = e.clientY - rectInfo.top
    component.style.left = e.clientX - rectInfo.left
    component.id = generateID()

    changeComponentSizeWithScale(component)
    store.$patch((state) => {
      state.componentData.push(component)
      // Assuming you have a method `recordSnapshot` in your store
      state.recordSnapshot()
    })
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy'
}

function handleMouseDown(e: MouseEvent) {
  e.stopPropagation()
  store.$patch({
    isClickComponent: false,
    editor: true,
  })
}

function deselectCurComponent(e: MouseEvent) {
  if (!store.isClickComponent) {
    store.$patch({
      curComponent: null,
    })
  }

  if (e.button !== 2) {
    store.$patch({
      contextMenuVisible: false,
    })
  }
}

function isShowLeft() {
  leftList.value = !leftList.value
}

function isShowRight() {
  store.$patch({
    rightList: !store.rightList,
  })
}
</script>

<style lang="scss">
.home {
  height: 100vh;
  background: var(--main-bg-color);

  main {
    height: calc(100% - 64px);
    position: relative;
    background: var(--secondary-bg-color);

    .show-list {
      position: absolute;
      z-index: 9;
      top: 40%;
      transition: all 0.3s;
    }

    .left-btn,
    .right-btn {
      background: var(--main-bg-color);
      color: var(--button-text-color);
      border: 1px;
    }

    .left-btn {
      margin-left: 200px;
      border-radius: 0 50% 50% 0;
      padding: 9px 4px 9px 2px;
    }

    .right-btn {
      right: 0;
      margin-right: 288px;
      border-radius: 50% 0 0 50%;
      padding: 9px 2px 9px 4px;
    }

    .left,
    .right {
      position: absolute;
      height: 100%;
      top: 0;
      transition: all 0.3s;
      background: var(--main-bg-color);
      color: var(--text-color);
    }

    .left {
      width: 200px;
      left: 0;

      .real-time-component-list .list:hover {
        color: var(--text-color);
      }

      .real-time-component-list .actived.list {
        color: var(--actived-text-color);
        background-color: var(--actived-bg-color);
      }

      .real-time-component-list .list {
        color: var(--text-color);
      }

      & > div {
        overflow: auto;

        &:first-child {
          border-bottom: 1px solid var(--border-color);
        }
      }
    }

    .center {
      margin: 0 288px 0 200px;
      background: var(--secondary-bg-color);
      height: 100%;
      overflow: auto;
      padding: 20px;
      transition: all 0.3s;
    }

    .placeholder {
      text-align: center;
      color: var(--placeholder-text-color);
    }

    .left.inactive {
      width: 10px;
      overflow: hidden;

      div {
        opacity: 0;
      }
    }

    .left.inactive ~ .center,
    .left.inactive ~ .btn.left-btn {
      margin-left: 10px;
    }

    .right {
      position: absolute;
      height: 100%;
      width: 288px;
      right: 0;
      top: 0;
      transition: all 0.3s;
      background-color: var(--main-bg-color);

      .el-select {
        width: 100%;
      }

      .el-form-item__label {
        color: var(--text-color);
      }

      .el-tabs__item.is-top {
        color: var(--text-color);

        &.is-active {
          color: var(--actived-text-color);
        }
      }

      .el-input__inner {
        background-color: var(--placeholder-bg-color);
        color: var(--text-color);
        border-color: var(--border-color);
      }

      textarea.el-textarea__inner {
        background-color: var(--placeholder-bg-color);
        color: var(--text-color);
      }

      .el-select-dropdown__item {
        color: var(--text-color);
      }

      .linkage-container .linkage-component {
        border-color: var(--border-color);

        .div-guanbi {
          color: var(--border-color);
          border-color: var(--border-color);
        }
      }
    }

    .right.inactive {
      width: 10px;
      overflow: hidden;

      div {
        opacity: 0;
      }
    }

    .right.inactive ~ .btn.right-btn {
      margin-right: 10px;
    }

    .center {
      margin-left: 200px;
      margin-right: 288px;
      background: var(--secondary-bg-color);
      height: 100%;
      overflow: auto;
      padding: 20px;
      transition: all 0.3s;

      .content {
        width: 100%;
        height: 100%;
        overflow: auto;
      }
    }
  }

  .placeholder {
    text-align: center;
    color: var(--placeholder-text-color);
  }

  .global-attr {
    padding: 10px;
  }

  .el-collapse {
    border-color: var(--border-color);
  }

  .el-collapse-item__header,
  .el-collapse-item__wrap {
    border-color: var(--border-color);
    background-color: var(--main-bg-color);
    color: var(--text-color);
  }

  .el-collapse-item__header.is-active {
    border-bottom-color: transparent !important;
  }

  .el-tabs__item {
    color: var(--text-color);
  }

  .animation-list {
    .el-tabs.el-tabs--top {
      background-color: var(--main-bg-color);
    }

    .el-scrollbar__view {
      margin-top: 30px;
    }
  }

  .ace {
    background: var(--ace-bg-color);
    border-color: var(--main-bg-color);

    .ace_editor,
    .ace_gutter {
      background-color: var(--main-bg-color);
      color: var(--text-color);
    }
  }
}
</style>
