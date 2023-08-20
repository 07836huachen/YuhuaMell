<template>
  <view class="my-settle-container">
    <!-- 全选 -->
    <label class="radio" @click="changeAllState">
      <radio color="#C00000" :checked="isFullCheck" /><text>全选</text>
    </label>
    <!-- 合计 -->
    <view class="amount-box">
      合计: <text class="amount">￥{{checkedGoodsAmount}}</text>
    </view>
    <!-- 结算按钮 -->
    <view class="btn-settle" @click="settlement">结算({{checkedCount}})</view>
  </view>
</template>

<script>
  import {
    mapState,
    mapGetters,
    mapMutations
  } from 'vuex'
  export default {
    name: "my-settle",
    data() {
      return {
        // 倒计时的秒数
        seconds: 3,
        // 定时器的 Id
        timer: null
      };
    },
    methods: {
      ...mapMutations('m_cart', ['updateAllGoodsState']),
      ...mapMutations('m_user', ['updateRedirectInfo']),
      // 用户和登录成功之后的 token 字符串
      // label 的点击事件处理函数
      changeAllState() {
        // 修改购物车中所有商品的选中状态
        // !this.isFullCheck 表示：当前全选按钮的状态取反之后，就是最新的勾选状态
        this.updateAllGoodsState(!this.isFullCheck)
      },

      // 用户点击了结算按钮
      settlement() {
        // 先判断是否勾选了要结算的商品
        if (!this.checkedCount) return uni.$showMsg("请选择要结算的商品！")

        // 再判断用户是否选择了收货地址
        if (!this.addstr) return uni.$showMsg("请选择收货地址！")

        // 最后判断用户是否登录了
        // if (!this.token) return uni.$showMsg("请先登录！")
        if (!this.token) return this.delayNavigate()

        // 实现微信支付功能
        this.payOrder()
      },

      // 展示倒计时的提示消息
      showTips(n) {
        // 调用 uni.showToast() 方法，展示提示消息
        uni.showToast({
          // 不展示任何图标
          icon: 'none',
          // 提示的信息
          title: '请登录后再结算！' + n + '秒后自动跳转到登录页',
          // 为页面添加透明遮罩，防止点击穿透
          mask: true,
          // 1.5 秒后自动消失
          duration: 1500
        })
      },

      // 延迟导航到 my 页面
      delayNavigate() {
        this.seconds = 3
        // 展示提示消息，此时 seconds 的值等于 3
        this.showTips(this.seconds)
        // 创建定时器，每隔 1 秒执行一次
        // 将定时器的 Id 存储到 timer 中
        this.timer = setInterval(() => {
          // 先让秒数自减 1
          this.seconds--

          // 判断秒数是否 <= 0
          if (this.seconds <= 0) {
            // 清除定时器
            clearInterval(this.timer)

            // 跳转到 my 页面
            uni.switchTab({
              url: '/pages/my/my',
              success: () => {
                this.updateRedirectInfo({
                  openType: 'switchTab',
                  from: '/pages/cart/cart'
                })
              }
            })

            // 终止后续代码的运行（当秒数为 0 时，不再展示 toast 提示消息）
            return
          }
          // 再根据最新的秒数，进行消息提示
          this.showTips(this.seconds)
        }, 1000)
      },

      // 微信支付
      async payOrder() {
        // 1. 创建订单
        const orderInfo = {
          // 组织订单的信息对象
          // 开发期间，注释掉真实的订单价格，
          // order_price: this.checkedGoodsAmount,
          // 写死订单总价为 1 分钱
          order_price: 0.01,
          consignee_addr: this.addstr,
          goods: this.cart.filter(x => x.goods_state).map(x => ({
            goods_id: x.goods_id,
            goods_number: x.goods_count,
            goods_price: x.goods_price
          }))
        }

        // 发起请求创建订单
        const {
          date: res
        } = await uni.$http.post('/api/public/v1/my/orders/create', orderInfo)
        // 由于接口出错问题：此处使用 newRes 代替 res
        const newRes = {
          "message": {
            "pay": {
              "timeStamp": "1525681145",
              "nonceStr": "BkPggorBXZwPGXe3",
              "package": "prepay_id=wx071619042918087bb4c1d3d72999385683",
              "signType": "MD5",
              "paySign": "D1642DEEF1663C8012EDEB9297E1D516"
            },
            "order_number": "GD20180507000000000110"
          },
          "meta": {
            "msg": "预付订单生成成功",
            "status": 200
          }
        }        
        if (newRes.meta.status !== 200) return uni.$showMsg('创建订单失败！')
        console.log("newRes:")
        console.log(newRes)
        // 得到服务器响应的“订单编号”
        const orderNumber = newRes.message.order_number
        console.log("orderNumber:")
        console.log(orderNumber)
        
        // 2. 订单预支付
        // 2.1 发起请求获取订单的支付信息
        const {
          data: res2
        } = await uni.$http.post('/api/public/v1/my/orders/req_unifiedorder', {
          order_number: orderNumber
        })
        // 由于接口出错问题：此处使用 newRes2 代替 res2
        const newRes2 = {
          "message": {
            "pay": {
              "timeStamp": "1525681145",
              "nonceStr": "BkPggorBXZwPGXe3",
              "package": "prepay_id=wx071619042918087bb4c1d3d72999385683",
              "signType": "MD5",
              "paySign": "D1642DEEF1663C8012EDEB9297E1D516"
            },
            "order_number": "GD20180507000000000110"
          },
          "meta": {
            "msg": "预付订单生成成功",
            "status": 200
          }
        }
        // 2.2 预付订单生成失败
        if (newRes2.meta.status !== 200) return uni.$showMsg('预付订单生成失败！')
        console.log("newRes2:")
        console.log(newRes2)
        // 2.3 得到订单支付相关的必要参数
        const payInfo = newRes2.message.pay
        console.log("payInfo:")
        console.log(payInfo)

        // 3. 发起微信支付
        // 3.1 调用 uni.requestPayment() 发起微信支付
        const [err, succ] = await uni.requestPayment(payInfo)
        console.log("err:")
        console.log(err)
        console.log("succ:")
        console.log(succ)
        // 3.2 未完成支付
        // if (err) return uni.$showMsg('订单未支付！')
        // 3.3 完成了支付，进一步查询支付的结果
        const {
          data: res3
        } = await uni.$http.post('/api/public/v1/my/orders/chkOrder', {
          order_number: orderNumber
        })
        
        // 由于接口出错问题：此处使用 newRes3 代替 res3
        // 支付成功
        const newRes3 = {
          "message": "支付成功",
          "meta": {
            "msg": "验证成功",
            "status": 200
          }
        }
        console.log('newRes3:')
        console.log(newRes3)
        // 支付失败
        // newRes3 = {
        //   "message": null,
        //   "meta": {
        //     "msg": "订单未支付",
        //     "status": 400
        //   }
        // }
        
        // 3.4 检测到订单未支付
        if (newRes3.meta.status !== 200) return uni.$showMsg('订单未支付！')
        // 3.5 检测到订单支付完成
        uni.showToast({
          title: '支付完成！',
          icon: 'success'
        })
      }
    },
    computed: {
      ...mapGetters('m_cart', ['checkedCount', 'total', 'checkedGoodsAmount']),
      // addstr 是详细的收货地址
      ...mapGetters('m_user', ['addstr']),
      ...mapState('m_user', ['token']),
      ...mapState('m_cart', ['cart']),
      // 是否全选
      isFullCheck() {
        return this.total === this.checkedCount
      }
    }
  }
</script>

<style lang="scss">
  .my-settle-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-left: 5px;

    .radio {
      display: flex;
      align-items: center;
    }

    .amount-box {
      .amount {
        color: #c00000;
        font-weight: bold;
      }
    }

    .btn-settle {
      background-color: #c00000;
      height: 50px;
      color: white;
      line-height: 50px;
      padding: 0 10px;
      min-width: 100px;
      text-align: center;
    }
  }
</style>