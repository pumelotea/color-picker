<template>
  <div>
    <img id="img" :src="src" style="height: 500px;" ref="img" @click="pickColor($event)"
         @mousemove="move($event)" @load="load"/>
    <canvas ref="canv" style="display: none"></canvas>
    <div class="current-color">
      <div class="current-box" :style="'background:'+color" v-if="src"></div>
      <div>
        <!--<input type="file" @change="loadFIle($event)"/>-->
        <Upload name="pic" action="" :before-upload="handleUpload" :show-upload-list="false">
          <Button icon="ios-cloud-upload-outline">上传图片</Button>
        </Upload>
      </div>
    </div>
    <div style="padding: 20px;">
      <div v-for="e in colorList" class="picker-box" :style="'background:'+e" @dblclick.stop="copy($event,e)"
           @click.stop="copy($event,rgb2hex(e))">
        {{rgb2hex(e)}}
      </div>
    </div>
    <input ref="willCopy" style="position: fixed;left: -100vw" type="text" v-model="willCopy"></input>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        src: '',
        context: null,
        color: 'rgba(0,0,0,0)',
        canvas: null,
        colorList: [],
        willCopy: ''
      }
    },
    methods: {

      handleUpload(file) {
        this.src = URL.createObjectURL(file)
        return false;
      },
      move(e) {
        console.log(document.documentElement.scrollTop)
        let imageData = this.context.getImageData(event.clientX, event.clientY + document.documentElement.scrollTop, 1, 1).data;
        this.color = this.getColor(imageData)
      },
      copy(e, data) {
        this.willCopy = data
        this.$nextTick(() => {
          this.$refs.willCopy.select()
          document.execCommand("Copy")
          this.$Message.info('Copied');
        })
      },
      syncSize() {
        this.canvas.width = this.$refs.img.width
        this.canvas.height = this.$refs.img.height
        this.context = this.canvas.getContext('2d');
        this.context.drawImage(this.$refs.img, 0, 0, this.$refs.img.width, this.$refs.img.height);
      },
      load() {
        this.$refs.img.crossOrigin = 'Anonymous';
        this.canvas = this.$refs.canv
        this.canvas.width = this.$refs.img.width
        this.canvas.height = this.$refs.img.height
        this.context = this.canvas.getContext('2d');
        this.context.drawImage(this.$refs.img, 0, 0, this.$refs.img.width, this.$refs.img.height);
      },
      getColor(imageData) {
        return `rgba(${imageData[0]},${imageData[1]},${imageData[2]},${imageData[3] / 255})`
      },
      pickColor(e) {
        let imageData = this.context.getImageData(event.clientX, event.clientY + document.documentElement.scrollTop, 1, 1).data;
        this.colorList.push(this.getColor(imageData))
      },
      zero_fill_hex(num, digits) {
        var s = num.toString(16);
        while (s.length < digits)
          s = "0" + s;
        return s;
      },
      rgb2hex(rgb) {
        if (rgb.charAt(0) == '#')
          return rgb;
        var ds = rgb.split(/\D+/);
        var decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
        return "#" + this.zero_fill_hex(decimal, 6);
      }
    },
    mounted() {
      let that = this
      window.onresize = function () {
        that.syncSize()
      }

    }
  }
</script>

<style scoped>
  .current-color {
    padding: 20px;
    margin-bottom: 10px
  }

  .current-box {
    width: 100px;
    height: 32px;
    border: 1px solid #dcdee2;
    float: left;
    margin-right: 10px;
    border-radius: 5px;
  }

  .picker-box {
    text-align: center;
    line-height: 32px;
    width: 100px;
    height: 32px;
    margin-right: 10px;
    margin-bottom: 10px;
    float: left;
    border-radius: 5px;
    color:white;
    box-shadow: 0 3px 30px 0 rgba(0, 0, 0, 0.5);
  }
</style>
