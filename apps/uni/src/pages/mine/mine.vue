<template>
  <view class="page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar">
        <text class="avatar-text">墨</text>
      </view>
      <view class="user-info">
        <text class="nickname">{{ user.nickname }}</text>
        <text class="stats">已创作 {{ user.totalCreations }} 首</text>
      </view>
      <view class="vip-btn" @tap="onVip">
        <text>开通会员 →</text>
      </view>
    </view>

    <!-- 今日额度 -->
    <view class="quota-card">
      <text class="quota-text">
        今日免费额度：{{ user.dailyUsed }} / {{ user.dailyLimit }}
      </text>
      <view class="quota-bar">
        <view
          class="quota-fill"
          :style="{ width: `${(user.dailyUsed / user.dailyLimit) * 100}%` }"
        />
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" @tap="onNavigate('/pages/history/history')">
        <text>📝 我的作品</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item" @tap="onNavigate('/pages/history/history')">
        <text>📜 历史记录</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item">
        <text>⭐ 我的收藏</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item">
        <text>🏷️ 我的印章</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item">
        <text>⚙️ 设置</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item">
        <text>📋 关于墨韵</text>
        <text class="arrow">→</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UserProfile } from '@moyun/core'

const user = ref<UserProfile>({
  id: 'guest',
  nickname: '墨客',
  membership: 'free',
  dailyUsed: 0,
  dailyLimit: 3,
  totalCreations: 0,
})

function onVip() {
  uni.showToast({ title: '会员功能即将上线', icon: 'none' })
}

function onNavigate(url: string) {
  uni.navigateTo({ url })
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f0e8;
  padding: 32rpx;
}

.user-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  background: #1a1a1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.avatar-text {
  color: #f5f0e8;
  font-size: 40rpx;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a1a1a;
  display: block;
}

.stats {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.vip-btn {
  background: linear-gradient(135deg, #c0a060, #8b7340);
  border-radius: 24rpx;
  padding: 12rpx 24rpx;
  color: #fff;
  font-size: 24rpx;
}

.quota-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
}

.quota-text {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.quota-bar {
  height: 8rpx;
  background: #e8e0d4;
  border-radius: 4rpx;
  overflow: hidden;
}

.quota-fill {
  height: 100%;
  background: #1a1a1a;
  border-radius: 4rpx;
  transition: width 0.3s;
}

.menu-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0ebe0;
  font-size: 28rpx;
  color: #333;

  &:last-child {
    border-bottom: none;
  }
}

.arrow {
  color: #ccc;
  font-size: 28rpx;
}
</style>
