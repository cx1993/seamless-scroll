require('comutils/animationFrame')()
const copyObj = require('comutils/copyObj')
const addEventListener = require('./event')
const getStyle = require('./getCss')

let defaultOptions = {
  step: 1, //步长
  hoverStop: true, //是否启用鼠标hover控制
  direction: 1, // 0 往下 1 往上 2向左 3向右
  singleHeight: 0, //单条数据高度有值hoverStop关闭
  singleWidth: 0, //单条数据宽度有值hoverStop关闭
  waitTime: 1000 //单步停止等待时间
}

let seamless = function (options) {
  this.options = copyObj({}, defaultOptions, options)
  let dom = this.options.dom
  if (!dom) throw new Error('you must set a dom')
  dom.style.position = 'relative'
  dom.style.overflow = 'hidden'
  this.reqFrame = null
  this._top = 0
  this._left = 0
  dom.innerHTML += dom.innerHTML
  if (this.options.direction > 1) {
    //水平向滚动
    let child = dom.children,
      childFirst = child[0],
      len = child.length;
    this._width = (childFirst.offsetWidth + this._getInt(childFirst, 'margin-left') + this._getInt(childFirst, 'margin-right')) * len
    dom.style.width = this._width + 'px'
  }
  this._move()
  this._bindEvent()
}

seamless.prototype = {
  _getInt (dom, name) {
    return parseInt(getStyle(dom, name))
  },
  _cancle () {
    cancelAnimationFrame(this.reqFrame || '')
  },
  _returnHoverStop () {
    return !this.options.hoverStop || !!this.options.singleHeight || !!this.options.singleWidth
  },
  _bindEvent () {
    if (this._returnHoverStop()) return
    let that = this
    let dom = this.options.dom
    addEventListener(dom, 'mouseenter', function () {
      that._cancle()
    })
    addEventListener(dom, 'mouseleave', function () {
      that._move()
    })
  },
  _move () {
    this._cancle()
    let that = this
    let dom = this.options.dom
    this.reqFrame = requestAnimationFrame(
      function () {
        let h = dom.offsetHeight / 2  //实际高度
        let direction = that.options.direction //滚动方向

        if (direction === 1) { // 上
          if (Math.abs(that._top) >= h) that._top = 0
          that._top -= that.options.step
          dom.style.top = that._top + 'px'
        } else if (direction === 0) { // 下
          if (that._top >= 0) that._top = h * -1
          that._top += that.options.step
          dom.style.top = that._top + 'px'
        } else if (direction === 2) { // 左
          if (Math.abs(that._left) >= that._width / 2) that._left = 0
          that._left -= that.options.step
          dom.style.left = that._left + 'px'
        } else if (direction === 3) { // 右
          if (that._left >= 0) that._left = that._width / 2 * -1
          that._left += that.options.step
          dom.style.left = that._left + 'px'
        }
        that._judgeSingle()
      }
    )
  },
  _judgeSingle () {
    let singleH = this.options.singleHeight
    let singleW = this.options.singleWidth
    let timer
    if (!!singleH) { //是否启动了单行暂停配置
      if (Math.abs(this._top) % singleH === 0) { // 符合条件暂停waitTime
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          this._move()
        }, this.options.waitTime)
      } else {
        this._move()
      }
    } else if (!!singleW) {
      if (Math.abs(this._left) % singleW === 0) { // 符合条件暂停waitTime
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          this._move()
        }, this.options.waitTime)
      } else {
        this._move()
      }
    } else {
      this._move()
    }
  }
}

module.exports = seamless