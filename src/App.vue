<template>
  <div>
    <header>
      <h1>Wordle</h1>
      <div style="position:absolute;right:0;bottom:4px">
        <button @click="restart">Restart</button>
      </div>
    </header>
    <div id="board">
      <div v-for="row in board" class="row">
        <div
          v-for="tile in row"
          :class="['tile', tile.letter && 'filled', tile.state && 'reversed']"
        >
          <!-- 瓷砖正面 用于初始状态和输入状态显示 -->
          <div class="front">{{ tile.letter }}</div>
          <!-- 瓷砖背面 用于结果展示 -->
          <div :class="['back', tile.state]">{{ tile.letter }}</div>
        </div>
      </div>
    </div>

    <Keyboard :keyboardLetterStates="keyboardLetterStates" @key="onKey" />

    <transition>
      <div class="message" v-if="message">
        {{ message }}
      </div>
    </transition>

    <!-- <div class="tips">仅供学习娱乐</div> -->
  </div>
</template>

<script>
import Keyboard from './Keyboard.vue'
import { allWords } from './words'
const TileStates = {
  NORMAL: '',
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent'
}

const answer = 'hello'

export default {
  name: 'App',
  components: {
    Keyboard
  },
  data() {
    return {
      // 创建一个5x6的 board 记录游戏状态
      // 每个 tile 表现为 { letter, state }
      board: Array(6).fill().map(() => Array(5).fill(null).map(() => ({ letter: '', state: TileStates.NORMAL }))),
      currentRowIndex: 0,

      message: '',
  
      // 记录键盘上对应 letter 的状态
      keyboardLetterStates: {}
    }
  },
  computed: {
    currentRow() {
      return this.board[this.currentRowIndex]
    }
  },
  methods: {
    onKey(key) {
      if (/^[a-zA-Z]$/.test(key)) {
        this.fillTile(key)
      } else if (key === 'Backspace') {
        this.clearTile()
      } else if (key === 'Enter') {
        this.completeRow()
      }
    },
    fillTile(letter) {
      // 找到当前行第一个没有填充的 tile 并填充该 letter
      for(const tile of this.currentRow) {
        if (!tile.letter) {
          tile.letter = letter
          break
        }
      }
    },
    clearTile() {
      // 反转当前行找到第一个有填充的 tile 并清除
      for(const tile of this.currentRow.slice().reverse()) {
        if (tile.letter) {
          tile.letter = ''
          break
        }
      }
    },
    completeRow() {
      // 当前行是否所有 tile 都已填充了 letter
      if (this.currentRow.every(tile => tile.letter)) {
        // 得到用户猜测的单词
        const guess = this.currentRow.map(tile => tile.letter).join('')
        // 检查是否在猜测范围
        // if (!allWords.includes(guess) && guess !== answer) {
        //   this.showMessage('不在猜测范围内！')
        //   return
        // }

        const answerLetters = answer.split('')
        // 遍历该行所有 tile 标记状态
        this.currentRow.forEach((tile, i) => {
          if (tile.letter === answerLetters[i]) {
            // 字母和位置都正确 -> CORRECT
            tile.state = TileStates.CORRECT
            answerLetters[i] = null
            // 通过 `$set` API 设置 对应 letter 在键盘上的状态
            // 因为 keyboardLetterStates 初始化为 `{}`, 直接使用 this.keyboardLetterStates[tile.letter] 赋值将无法触发页面响应
            this.$set(this.keyboardLetterStates, tile.letter, TileStates.CORRECT)
          } else if (answerLetters.includes(tile.letter)) {
            // 字母存在但位置不对 -> PRESENT
            tile.state = TileStates.PRESENT
            answerLetters[answerLetters.indexOf(tile.letter)] = null
            this.$set(this.keyboardLetterStates, tile.letter, TileStates.PRESENT)
          } else {
            // 不存在该字母 -> ABSENT
            tile.state = TileStates.ABSENT
            this.$set(this.keyboardLetterStates, tile.letter, TileStates.ABSENT)
          }
        })
      }
    },

    showMessage(message, duration = 1500) {
      this.message = message
      if (duration > 0) {
        setTimeout(() => {
          this.message = ''
        }, duration);
      }
    },

    restart() {
      Object.assign(this.$data, this.$options.data())
    }
  }
}
</script>

<style>
body {
  font-family: Clear Sans,Helvetica Neue,Arial,sans-serif;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}
header {
  border-bottom: 1px solid #ccc;
  margin-bottom: 30px;
  position: relative;
}
.tips {
  position: fixed;
  bottom: 0;
  right: 0;
  text-align: right;
  font-size: 12px;
  color: #cdcdcd;
}
#board {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 5px;
  width: 400px;
  height: 480px;
  padding: 10px;
  margin: 0 auto;
}
.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;
}

.tile {
  font-size: 2rem;
  line-height: 2rem;
  font-weight: 700;
  vertical-align: middle;
  text-transform: uppercase;
  user-select: none;
  position: relative;
}
.tile .front,
.tile .back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  transition: transform .6s;
}
.tile .front {
  border: 2px solid #d3d6da;
}
.tile .back {
  transform: rotateX(180deg);
}

.tile.reversed .front {
  transform: rotateX(180deg);
}
.tile.reversed .back {
  transform: rotateX(0);
}

.correct, .present, .absent {
  color: #fff!important;
}
.correct {
  background: #6aaa64!important;
}
.present {
  background: #c9b458!important;
}
.absent {
  background: #787c7e!important;
}

.message {
  position: absolute;
  left: 50%;
  top: 80px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.85);
  padding: 16px 20px;
  z-index: 2;
  border-radius: 4px;
  transform: translateX(-50%);
  transition: opacity 0.3s ease-out;
  font-weight: 600;
}
.message.v-leave-to {
  opacity: 0;
}
</style>
