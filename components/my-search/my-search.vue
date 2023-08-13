<template>
  <view class="my-search-container" :style="{'background-color':bgcolor}" @click="searchBoxHandler">
    <!-- 使用 view 组件模拟 input 输入框的样式 -->
    <view class="my-search-box" :style="{'border-radius':radius +'px'}">
      <!-- 使用uni-ui提供的图标组件 -->
      <uni-icons type="search" size="17"></uni-icons>
      <text class="placeholder">搜索</text>
    </view>
  </view>
</template>

<script>
  export default {
    name: "my-search",
    data() {
      return {

      };
    },
    props:{
      //背景颜色
      bgcolor:{
        type:String,
        default:'#C00000'
      },
      //圆角尺寸
      radius:{
        type:Number,
        //单位是px
        default:18
      }
    },
    methods:{
      searchBoxHandler(){
        console.log('~~~~~~~~~~')
        this.$emit('myclick')
      }
    }
  }
</script>

<style lang="scss">
  .my-search-container {
    height: 50px;
    //移除背景颜色，改由 props 属性控制
    // background-color: #C00000;
    display: flex;
    align-items: center;
    padding: 0 10px;
    .my-search-box{
      height: 36px;
      background-color: #FFFFFF;
      //移除圆角尺寸，改由 props 属性控制
      // border-radius:18px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      .placeholder{
        font-size: 15px;
        margin-left: 5px;
      }
    }
  }
</style>