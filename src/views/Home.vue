<template>
  <div>
    <div style="display: flex">
      <canvas ref="canv" @mousedown="dragMove($event)" @click="pickColor($event)"></canvas>
    </div>
    <div class="current-color">
      <div style="float: left;line-height: 30px;margin-right: 30px"><span style="margin-right:10px">RGBA MODE</span>
        <i-Switch v-model="mode"/>
      </div>
      <div>
        <Upload name="pic" action="" :before-upload="handleUpload" :show-upload-list="false">
          <Button icon="ios-cloud-upload-outline">上传图片</Button>
        </Upload>
      </div>
    </div>
    <input ref="willCopy" style="position: fixed;left: -100vw" type="text" v-model="willCopy"></input>
    <div class="color-list">
      <div style="display: flex;padding: 4px" v-for="e in colorList">
        <div class="picker-box" :style="'background:'+e"
             @click.stop="copy($event,mode?e:rgb2hex(e))">
          {{mode?e:rgb2hex(e)}}
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        mode: false,
        image: null,
        context: null,
        canvas: null,
        colorList: [],
        willCopy: '',
        currentScale: 1,
        imgX: 0,
        imgY: 0,
        shadowImgX: 0,
        shadowImgY: 0,
        isDragging: false
      }
    },
    methods: {
      handleUpload(file) {
        let that = this
        let src = URL.createObjectURL(file)
        this.image = new Image()
        this.image.src = src
        this.image.onload = function () {
          let scale = 1
          //画图
          if (this.width > this.height) {
            if (this.width > that.canvas.width) {
              scale = that.canvas.width / this.width
            }
          } else {
            if (this.height > that.canvas.height) {
              scale = that.canvas.height / this.height
            }
          }
          that.currentScale = scale
          that.draw()

        }
        return false;
      },
      draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid(this.context, "#d5dfff", 10, 10);
        this.context.drawImage(
          this.image, //规定要使用的图像、画布或视频。
          0, 0,
          this.image.width, this.image.height,
          this.imgX, this.imgY,
          this.image.width * this.currentScale, this.image.height * this.currentScale,
        )
      },

      windowToCanvas(x, y) {
        let box = this.canvas.getBoundingClientRect();  //这个方法返回一个矩形对象，包含四个属性：left、top、right和bottom。分别表示元素各边与页面上边和左边的距离
        return {
          x: (x - box.left - (box.width - this.canvas.width / 2) / 2) * 2,
          y: (y - box.top - (box.height - this.canvas.height / 2) / 2) * 2
        };
      },
      dragMove(event) {
        if (!this.image) {
          return
        }
        this.shadowImgX = this.imgX
        this.shadowImgY = this.imgY
        let that = this
        let pos = that.windowToCanvas(event.clientX, event.clientY);
        this.canvas.onmousemove = function (evt) {
          let pos1 = that.windowToCanvas(evt.clientX, evt.clientY);
          let x = pos1.x - pos.x;
          let y = pos1.y - pos.y;
          pos = pos1;
          that.imgX += x;
          that.imgY += y;
          that.draw()
        }

        this.canvas.onmouseup = function () {
          that.canvas.onmousemove = null;
          that.canvas.onmouseup = null;
        };

      },
      drawGrid(context, color, stepx, stepy) {
        context.strokeStyle = color;
        context.lineWidth = 0.5;
        for (let i = stepx + 0.5; i < context.canvas.width; i += stepx) {
          context.beginPath();
          context.moveTo(i, 0);
          context.lineTo(i, context.canvas.height);
          context.stroke();
        }

        for (let i = stepy + 0.5; i < context.canvas.height; i += stepy) {
          context.beginPath();
          context.moveTo(0, i);
          context.lineTo(context.canvas.width, i);
          context.stroke();
        }
      },
      copy(e, data) {
        this.willCopy = data
        this.$nextTick(() => {
          this.$refs.willCopy.select()
          document.execCommand("Copy")
          this.$Message.info('Copied');
        })
      },
      getColor(imageData) {
        return `rgba(${imageData[0]},${imageData[1]},${imageData[2]},${imageData[3] / 255})`
      },
      pickColor(event) {
        if (this.shadowImgX !== this.imgX || this.shadowImgY !== this.imgY) {
          return
        }
        let pos = this.windowToCanvas(event.clientX, event.clientY);
        let imageData = this.context.getImageData(pos.x, pos.y, 1, 1).data;
        this.colorList.unshift(this.getColor(imageData))
      },
      zero_fill_hex(num, digits) {
        let s = num.toString(16);
        while (s.length < digits)
          s = "0" + s;
        return s;
      },
      rgb2hex(rgb) {
        if (rgb.charAt(0) === '#')
          return rgb;
        let ds = rgb.split(/\D+/);
        let decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
        return "#" + this.zero_fill_hex(decimal, 6);
      },
    },
    mounted() {
      let that = this
      this.canvas = this.$refs.canv
      this.canvas.width = (document.documentElement.clientWidth - 50 ) * 2
      this.canvas.style.width = document.documentElement.clientWidth - 50  + 'px'
      this.canvas.height = 600 * 2
      this.canvas.style.height = 600 + 'px'
      this.context = this.canvas.getContext('2d')

      this.canvas.onmousewheel = this.canvas.onwheel = function (event) {    //滚轮放大缩小
        let pos = that.windowToCanvas(event.clientX, event.clientY);
        let wheelDelta = event.wheelDelta ? event.wheelDelta : (event.deltaY * (-40));  //获取当前鼠标的滚动情况
        if (wheelDelta > 0) {
          that.currentScale *= 2;
          that.imgX = that.imgX * 2 - pos.x;
          that.imgY = that.imgY * 2 - pos.y;
        } else {
          that.currentScale /= 2;
          that.imgX = that.imgX * 0.5 + pos.x * 0.5;
          that.imgY = that.imgY * 0.5 + pos.y * 0.5;
        }
        that.draw();   //重新绘制图片
      };
    }
  }
</script>

<style scoped>
  .current-color {
    padding: 20px;
    margin-bottom: 10px;
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
    height: 32px;
    width: 100%;
    border-radius: 5px;
    color: white;
    box-shadow: 0 3px 30px 0 rgba(0, 0, 0, 0.5);
  }

  canvas {
    margin: auto;
    border: 1px solid #d5dfff;
  }

  .color-list {
    width: 160px;
    height: 100vh;
    position: fixed;
    right: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.5);
    overflow: auto;
    text-align: center;
    box-shadow: 0px 0px 30px 10px rgba(0, 0, 0, 0.5)
  }
</style>
