<template>
  <div id="share" v-show="visible" v-if="mounted">
    <header>
      <h2>分享</h2>
      <span class="close" @click="close">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
          <path fill="" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
      </span>
    </header>
    <section>
      <p>一天就一个单词没猜够？</p>
      <p>那么通过下面的自定义单词分享功能，来和你的朋友互相出题、互相折磨吧！</p>
      <p>如果不输入单词，直接点击按钮可以复制默认链接，猜测今天的随机单词哦。</p>
    </section>
    <section>
      <div class="custom">
        <input v-model="word" type="text" placeholder="在这里输入单词">
        <button @click="getURL">生成分享链接🔗</button>
      </div>
      <div v-if="message" :class="['message', { error }]">
        <p>{{ message }}</p>
        <p v-if="url">{{ url }}</p>
      </div>
    </section>
  </div>
</template>

<script>
const BASE_URL = location.origin
const wordCheckReg = new RegExp(/^[a-z]{5}$/i)

export default {
  name: '',
  props: {
    visible: Boolean
  },
  data () {
    return {
      mounted: false,
      word: '',
      url: '',
      message: '',
      error: false
    }
  },
  created () {},
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.mounted = true
        } else {
          this.word = ''
          this.url = ''
          this.message = ''
          this.error = ''
        }
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    getURL() {
      const word = this.word.trim()
      if (wordCheckReg.test(word) || !word) {
        let url = BASE_URL
        if (word) {
          url = url + '?' + btoa(word.toLowerCase())
        }
        this.url = url
        // copy
        const textarea = document.createElement('textarea')
        textarea.readOnly = 'readonly'
        textarea.style.position = 'fixed'
        textarea.style.top = '-99999px'
        textarea.value = url
        document.body.appendChild(textarea)
        textarea.select()
        const res = document.execCommand('Copy')
        document.body.removeChild(textarea)
        if (res) {
          console.log('复制成功！')
          this.message = '分享链接已成功复制到剪切板！'
        }
      } else {
        this.url = ''
        this.message = '请输入字母长度为5的单词'
      }
    }
  }
}
</script>

<style scoped>
#share {
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
  max-width: 500px;
  margin: 0 auto;
}

/* @media (min-width: 450px) {
  .custom {
    display: flex;
  }
  .custom input {
    flex: 1.2;
  }
  .custom button {
    flex: 1;
  }
} */

input {
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  display: inline-block;
  text-align: center;
  font-size: 1rem;
  width: 100%;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);

  margin-bottom: 5px;
}
input:focus {
  border-color: #6aaa64;
}

button {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0;
  font-size: 1rem;
  line-height: 1.2;
  text-align: center;
  border-radius: 2px;
  cursor: pointer;
  transition: opacity 0.2s;
  outline: 0;
  color: #fff;
  background-color: #6aaa64;
  border: 1px solid #6aaa64;
  text-align: center;
}

.message {
  text-align: center;
  font-size: 14px;
  color: #6aaa64;
}

</style>
