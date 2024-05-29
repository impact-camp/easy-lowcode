// modules/animation.ts
import { reactive } from 'vue'

type AnimationState = {
  curComponent: {
    animations: any[]
  }
}

const state = reactive<AnimationState>({
  curComponent: {
    animations: [],
  },
})

const addAnimation = (animation: any) => {
  state.curComponent.animations.push(animation)
}

const removeAnimation = (index: number) => {
  state.curComponent.animations.splice(index, 1)
}

const alterAnimation = ({ index, data = {} }: { index: number; data: any }) => {
  if (typeof index === 'number') {
    const original = state.curComponent.animations[index]
    state.curComponent.animations[index] = { ...original, ...data }
  }
}

export default {
  state,
  mutations: {
    addAnimation,
    removeAnimation,
    alterAnimation,
  },
}
