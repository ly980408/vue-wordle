<template>
  <div>
    <header>
      <h1>Wordle</h1>
      <div class="operations">
        <div>
          <a @click="answerVisible = !answerVisible" v-if="success">
            {{ answerVisible ? '隐藏答案' : '显示答案' }}
          </a>
        </div>
        <div>
          <a @click="helpVisible = true">玩法</a>
          <a @click="shareVisible = true">分享</a>
        </div>
      </div>
    </header>

    <HowToPlay :visible.sync="helpVisible" />
    <Share :visible.sync="shareVisible" :success="success" />

    <div id="board">
      <div
        v-for="(row, index) in board"
        :class="[
          'row',
          shakeRowIndex === index && 'shake',
          success && currentRowIndex === index && 'jump'
        ]"
      >
        <div
          v-for="(tile, i) in row"
          :class="['tile', tile.letter && 'filled', tile.state && 'reversed']"
        >
          <!-- 瓷砖正面 用于初始状态和输入状态显示 -->
          <div class="front" :style="{ transitionDelay: `${i * 300}ms` }">
            {{ tile.letter }}
          </div>
          <!-- 瓷砖背面 用于结果展示 -->
          <div 
            :class="['back', tile.state]"
            :style="{
              transitionDelay: `${i * 300}ms`,
              animationDelay: `${i * 100}ms`
            }"
          >
            {{ answerVisible ? tile.letter : '' }}
          </div>
        </div>
      </div>
    </div>

    <Keyboard :keyboardLetterStates="keyboardLetterStates" @key="onKey" />

    <transition>
      <div class="message" v-if="message" v-show="answerVisible">
        {{ message }}
      </div>
    </transition>
  </div>
</template>

<script>
import Keyboard from './Keyboard.vue'
import HowToPlay from './HowToPlay.vue'
import Share from './Share.vue'
import { allWords, getWordOfTheDay } from './words'
const TileStates = {
  NORMAL: '',
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent'
}

// 获取今日单词
const answer = getWordOfTheDay()

export default {
  name: 'App',
  components: {
    Keyboard,
    HowToPlay,
    Share
},
  data() {
    return {
      // 创建一个5x6的 board 记录游戏状态
      // 每个 tile 表现为 { letter, state }
      board: Array(6).fill().map(() => Array(5).fill(null).map(() => ({ letter: '', state: TileStates.NORMAL }))),
      currentRowIndex: 0,

      message: '',
      shakeRowIndex: -1,
      success: false,
  
      // 记录键盘上对应 letter 的状态
      keyboardLetterStates: {},
      allowInput: true,
      // 弹出层 visible 控制
      helpVisible: false,
      shareVisible: false,
      // 答案可见性，用于分享防剧透
      answerVisible: true
    }
  },
  computed: {
    currentRow() {
      return this.board[this.currentRowIndex]
    }
  },
  methods: {
    onKey(key) {
      if (!this.allowInput) return
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
        if (!allWords.includes(guess) && guess !== answer) {
          this.showMessage('我好像不认识这个单词')
          this.shake()
          return
        }

        const answerLetters = answer.split('')
        // 遍历该行所有 tile 标记状态
        // 1. 标记 correct
        this.currentRow.forEach((tile, i) => {
          if (tile.letter === answerLetters[i]) {
            // 字母和位置都正确 -> CORRECT
            tile.state = TileStates.CORRECT
            answerLetters[i] = null
            // 通过 `$set` API 设置 对应 letter 在键盘上的状态
            // 因为 keyboardLetterStates 初始化为 `{}`, 直接使用 this.keyboardLetterStates[tile.letter] 赋值将无法触发页面响应
            this.$set(this.keyboardLetterStates, tile.letter, TileStates.CORRECT)
          }
        })
        // 2. 标记 present
        this.currentRow.forEach((tile) => {
          if (!tile.state && answerLetters.includes(tile.letter)) {
            // 字母存在但位置不对 -> PRESENT
            tile.state = TileStates.PRESENT
            answerLetters[answerLetters.indexOf(tile.letter)] = null
            if (!this.keyboardLetterStates[tile.letter]) {
              // 防止出现之前添加的 CORRECT 状态被覆盖的情况
              this.$set(this.keyboardLetterStates, tile.letter, TileStates.PRESENT)
            }
          }
        })
        // 3. 标记 absent
        this.currentRow.forEach((tile) => {
          if (!tile.state) {
            // 不存在该字母 -> ABSENT
            tile.state = TileStates.ABSENT
            if (!this.keyboardLetterStates[tile.letter]) {
              this.$set(this.keyboardLetterStates, tile.letter, TileStates.ABSENT)
            }
          }
        })

        // 暂时禁用输入，处理后续逻辑
        this.allowInput = false
        if (guess === answer) {
          // 猜对了！
          setTimeout(() => {
            this.showMessage(
              '🎉 ' +
              ['Genius', 'Magnificent', 'Impressive', 'Splendid', 'Great', 'Phew'][
                this.currentRowIndex
              ],
              -1
            )
            this.success = true
          }, 1600)
        } else if (this.currentRowIndex < this.board.length - 1) {
          // 开始下一行
          this.currentRowIndex++
          setTimeout(() => {
            this.allowInput = true
          }, 1600)
        } else {
          // game over :(
          setTimeout(() => {
            this.showMessage('很遗憾，机会用完了 :(\n答案是：' + answer.toUpperCase(), -1)
          }, 1600)
        }

      } else {
        this.showMessage('单词长度不够哦')
        this.shake()
      }
    },

    showMessage(message, duration = 1500) {
      this.message = message
      if (duration > 0) {
        setTimeout(() => {
          this.message = ''
        }, duration)
      }
    },
    shake() {
      this.shakeRowIndex = this.currentRowIndex
      setTimeout(() => {
        this.shakeRowIndex = -1
      }, 1000)
    }

  }
}
</script>

<style scoped>
#board {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 5px;
  --height: min(420px, calc(var(--vh, 100vh) - 310px));
  height: var(--height);
  width: min(350px, calc(var(--height) / 6 * 5));
  padding: 10px;
  margin: 0 auto;
  box-sizing: border-box;
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
.tile.filled {
  animation: zoom 0.2s;
}
@keyframes zoom {
  0% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
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
.tile.filled .front {
  border-color: #999;
}
.tile.reversed .front {
  transform: rotateX(180deg);
}
.tile.reversed .back {
  transform: rotateX(0);
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

.shake {
  animation: shake 0.5s;
}
@keyframes shake {
  0% {
    transform: translate(1px);
  }
  10% {
    transform: translate(-2px);
  }
  20% {
    transform: translate(2px);
  }
  30% {
    transform: translate(-2px);
  }
  40% {
    transform: translate(2px);
  }
  50% {
    transform: translate(-2px);
  }
  60% {
    transform: translate(2px);
  }
  70% {
    transform: translate(-2px);
  }
  80% {
    transform: translate(2px);
  }
  90% {
    transform: translate(-2px);
  }
  100% {
    transform: translate(1px);
  }
}


.jump .tile .back {
  animation: jump 0.5s;
}
@keyframes jump {
  0% {
    transform: translateY(0px);
  }
  20% {
    transform: translateY(5px);
  }
  60% {
    transform: translateY(-25px);
  }
  90% {
    transform: translateY(3px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>
