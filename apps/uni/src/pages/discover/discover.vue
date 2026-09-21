<template>
  <view class="page">
    <text class="page-title">发现</text>
    <view class="placeholder">
      <text class="placeholder-icon">🎨</text>
      <text class="placeholder-text">精选作品即将上线</text>
      <text class="placeholder-desc">在这里你将看到社区优秀的 AI 诗词书法作品</text>
    </view>
  </view>
</template>

<style lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f0e8;
  padding: 32rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #1a1a1a;
  display: block;
  margin-bottom: 64rpx;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.placeholder-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.placeholder-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.placeholder-desc {
  font-size: 24rpx;
  color: #999;
  text-align: center;
}
</style>
