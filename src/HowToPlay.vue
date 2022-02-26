<template>
  <div id="how-to-play" v-show="visible" v-if="mounted">
    <header>
      <h2>游戏规则</h2>
      <span class="close" @click="close">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
          <path fill="var(--color-tone-1)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
      </span>
    </header>
    <section class="instructions">
      <p>共有六次机会来猜一个单词。</p>
      <p>每个猜测必须是一个有效的五个字母的单词。点击 Enter 按钮提交。</p>
      <p>每次猜测后，瓷砖的颜色都会改变，以显示您的猜测与单词的接近程度。</p>
    </section>
    <section class="examples">
      <div class="row">
        <div class="tile correct">H</div>
        <div class="tile normal">E</div>
        <div class="tile normal">L</div>
        <div class="tile normal">L</div>
        <div class="tile normal">O</div>
      </div>
      <p>表示字母 H 在单词中，并且处在正确的位置。</p>
      <div class="row">
        <div class="tile normal">W</div>
        <div class="tile present">O</div>
        <div class="tile normal">R</div>
        <div class="tile normal">L</div>
        <div class="tile normal">D</div>
      </div>
      <p>表示字母 O 在单词中，但处在错误的位置。</p>
      <div class="row">
        <div class="tile normal">F</div>
        <div class="tile normal">I</div>
        <div class="tile normal">R</div>
        <div class="tile absent">S</div>
        <div class="tile normal">T</div>
      </div>
      <p>表示字母 S 不在单词的任何位置</p>
    </section>

    <section>
      <strong>每天只会有一个随机单词哦！</strong>
    </section>

  </div>
</template>

<script>
export default {
  name: '',
  props: {
    visible: Boolean
  },
  data () {
    return {
      mounted: false
    }
  },
  created () {},
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.mounted = true
        } else {
        }
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
#how-to-play {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 9;
  box-sizing: border-box;
  padding: 16px;
  padding-top: 0;
}

header {
  display: flex;
  align-content: center;
  justify-content: center;
}

h2 {
  font-weight: 700;
  font-size: 1rem;
  text-align: center;
  margin: 10px 0;
}

.close {
  position: absolute;
  right: 4px;
  top: 10px;
  cursor: pointer;
}

section {
  text-align: left;
  padding: 32px;
  padding-top: 0;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 40px);
  grid-gap: 5px;
}
.tile {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  line-height: 2rem;
  font-weight: 600;
  box-sizing: border-box;
}
.tile.normal {
  border: 2px solid #d3d6da;
}

</style>
