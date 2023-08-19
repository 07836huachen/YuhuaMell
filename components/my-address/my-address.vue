<template>
  <view>
    <!-- 选择收货地址的盒子 -->
    <view class="address-choose-box" v-if="JSON.stringify(address) === '{}'">
      <button type="primary" size="mini" class="btnChooseAddress" @click="chooseAddress">请选择收货地址+</button>
    </view>

    <!-- 渲染收货地址的盒子 -->
    <view class="address-info-box" v-else @click="chooseAddress">
      <view class="row1">
        <view class="row1-left">
          <view class="username">收货人：<text>{{address.userName}}</text></view>
        </view>
        <view class="row1-right">
          <view class="phone">电话：<text>{{address.telNumber}}</text></view>
          <uni-icons type="arrowright" size="16"></uni-icons>
        </view>
      </view>
      <view class="row2">
        <view class="row2-left">收货地址：</view>
        <view class="row2-right">{{addstr}}</view>
      </view>
    </view>

    <!-- 底部的边缘线 -->
    <image src="/static/cart_border@2x.png" class="address-border"></image>
  </view>
</template>

<script>
  // 按需导入 mapState 和 mapMutations 这两个辅助函数
  import {
    mapState,
    mapMutations,
    mapGetters
  } from 'vuex'
  export default {
    name: "my-address",
    data() {
      return {
        // 收货地址
        // address: {},
      };
    },
    methods: {
      ...mapMutations('m_user', ['updateAddress']),
      // 选择收货地址
      async chooseAddress() {
        // 1. 调用小程序提供的 chooseAddress() 方法，即可使用选择收货地址的功能
        //    返回值是一个数组：第 1 项为错误对象；第 2 项为成功之后的收货地址对象
        const [err, succ] = await uni.chooseAddress().catch(err => err)

        // 2. 用户成功的选择了收货地址
        if (err === null && succ.errMsg === 'chooseAddress:ok') {
          // 为 data 里面的收货地址对象赋值
          // this.address = succ
          this.updateAddress(succ)
        }

        // 用户没有授权（前面报错信息是安卓和模拟器的报错信息，后面是iPhone真机上的报错信息）
        if (err && (err.errMsg === 'chooseAddress:fail auth deny' || err.errMsg === 'chooseAddress:fail authorize no response')) {
          // 调用 this.reAuth() 方法，向用户重新发起授权申请
          this.reAuth()
        }
      },
      // 让用户重新授权
      async reAuth() {
        // 提示用户对地址进行授权
        const [err2, confirmResult] = await uni.showModal({
          content: '检测到您还没打开地址权限，是否去设置打开？',
          confirmText: "确认",
          cancelText: "取消"
        })

        // 如果弹框异常，则直接退出
        if (err2) return

        // 如果用户点击了 “取消” 按钮，则提示用户 “您取消了地址授权！”
        if (confirmResult.cancel) return uni.$showMsg("您取消了地址授权！")
        if (confirmResult.confirm) return uni.openSetting({
          // 授权结束，需要对授权的结果做进一步判断
          success:(settingResult) =>{
            // 地址授权的值等于 true，提示用户授权成功
            if(settingResult.authSetting['scope.address']) return uni.$showMsg('授权成功！请选择地址')
            // 地址授权的值等于 false，提示用户授权失败
            if(!settingResult.authSetting['scope.address']) return uni.$showMsg('您取消了地址授权！')
          }
        })
      }
    },
    computed: {
      ...mapState('m_user', ['address']),
      ...mapGetters('m_user', ['addstr'])
    }
  }
</script>

<style lang="scss">
  .address-choose-box {
    height: 90px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .address-info-box {
    font-size: 12px;
    height: 90px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 5px;

    .row1 {
      display: flex;
      justify-content: space-between;

      .row1-right {
        display: flex;
        justify-content: space-between;
      }
    }

    .row2 {
      margin-top: 10px;
      display: flex;
      align-items: center;

      .row2-left {
        white-space: nowrap;
      }
    }
  }

  .address-border {
    height: 5px;
    width: 100%;
    display: block;
  }
</style>