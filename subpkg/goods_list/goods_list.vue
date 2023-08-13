<template>
  <view class="goods-list">
    <view v-for="(goods,i) in goodsList" :key="i" @click="gotoDetail(goods)">
      <!-- 为 my-goods 自定义组件动态绑定 goods 属性的值 -->
      <my-goods :goods="goods"></my-goods>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        // 请求参数对象
        queryObj: {
          // 查询关键词
          query: '',
          // 商品分类Id
          cid: '',
          // 页码值
          pagenum: 1,
          // 每页显示多少条数据
          pagesize: 10,
          // 是否正在请求数据
          isloading: false
        },
        // 商品列表数据
        goodsList: [],
        // 总数量，用来实现分页
        total: 0
      };
    },
    onLoad(options) {
      // 将页面参数转存到 this.queryObj 对象中
      this.queryObj.query = options.query || ''
      this.queryObj.cid = options.cid || ''

      // 调用方法，获取商品列表数据
      this.getGoodsList()
    },
    methods: {
      // 获取商品列表数据的方法
      async getGoodsList(cb) {
        // 打开节流阀
        this.isloading = true
        // 发起请求
        const {
          data: res
        } = await uni.$http.get('/api/public/v1/goods/search', this.queryObj)
        // 关闭节流阀
        this.isloading = false
        // 只要数据请求完毕，就立刻按需调用cb回调函数
        cb && cb()
        if (res.meta.status !== 200) {
          return uni.$showMsg()
        }
        // 为数据赋值，通过展开运算符的形式，进行新旧数据的拼接
        this.goodsList = [...this.goodsList, ...res.message.goods]
        this.total = res.message.total
      },

      // 点击跳转到商品详情页码
      gotoDetail(goods) {
        uni.navigateTo({
          url: '/subpkg/goods_detail/goods_detail?goods_id=' + goods.goods_id
        })
      }
    },

    // 触底事件
    onReachBottom() {
      // 判断是否还有下一页数据
      if (this.queryObj.pagenum * this.queryObj.pagesize >= this.total) return uni.$showMsg('数据加载完毕！')
      // 判断是否正在请求其它的数据，如果是，则不发起额外的请求
      if (this.isloading) return
      // 让页码值自增 +1
      this.queryObj.pagenum += 1
      // 重新获取列表数据
      this.getGoodsList()
    },

    // 下拉刷新的事件
    onPullDownRefresh() {
      // 重置关键数据
      this.queryObj.pagenum = 1
      this.total = 0
      this.isloading = false
      this.goodsList = []

      // 重新发起请求，并向该函数中传递一个回调函数，即当数据请求成功后，关闭下拉效果
      this.getGoodsList(() => {
        uni.stopPullDownRefresh()
      })
    }


  }
</script>

<style lang="scss">

</style>