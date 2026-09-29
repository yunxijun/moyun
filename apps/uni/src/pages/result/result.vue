<template>
  <view class="page">
    <view class="page-texture" aria-hidden="true" />

    <!-- 顶部导航 48px -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="nav-arrow">←</text>
      </view>
      <view class="nav-center">
        <text class="nav-logo">墨</text>
      </view>
      <view class="nav-action" @tap="onRegenerate">
        <text class="nav-action-text">重新创作</text>
      </view>
    </view>

    <!-- 主内容：三栏布局（卡片 | 控制 | 诗词） -->
    <view class="main-layout" ref="layoutRef">
      <!-- 左栏：书法卡片预览 -->
      <view class="panel panel-left" :style="panelLeftStyle">
        <view class="card-section">
          <!-- 装裱画框 -->
          <view class="mount-frame" :class="`mount-${currentMount}`">
            <view v-if="currentMount === 'li-zhou'" class="scroll-rod scroll-rod--top" />
            <view class="mount-mat">
              <view
                class="card-container"
                :class="{ 'stamp-mode': showStampPanel }"
                ref="cardContainer"
                @click="showStampPanel && onCardClick($event)"
                @touchstart.prevent="showStampPanel && onCardClick($event)"
              />
              <text v-if="showStampPanel" class="card-hint">点击卡片移动印章</text>
            </view>
            <view v-if="currentMount === 'li-zhou'" class="scroll-rod scroll-rod--bottom" />
          </view>
        </view>
        <view class="preview-zoom-bar">
          <text class="preview-zoom-label">预览大小</text>
          <text class="preview-zoom-value">{{ previewScale }}%</text>
          <slider
            class="preview-zoom-slider"
            :value="previewScale"
            :min="50"
            :max="200"
            :step="5"
            activeColor="#5b7f95"
            backgroundColor="rgba(26, 26, 46, 0.1)"
            block-size="14"
            @changing="(e: any) => previewScale = e.detail.value"
            @change="(e: any) => previewScale = e.detail.value"
          />
        </view>
      </view>

      <!-- 拖拽分割线 1 -->
      <div class="panel-divider" ref="divider0Ref"></div>

      <!-- 中栏：控制面板 -->
      <view class="panel panel-center" :style="panelCenterStyle">
        <view class="control-panel">
            <!-- 书法家模式选择 -->
            <view class="master-row">
              <view
                class="master-chip"
                :class="{ active: !selectedMaster }"
                @tap="selectMaster(null)"
              >
                <text class="master-chip-text">字体</text>
              </view>
              <view
                v-for="m in masterList"
                :key="m.name"
                class="master-chip"
                :class="{ active: selectedMaster === m.name }"
                @tap="selectMaster(m.name)"
              >
                <text class="master-chip-text">{{ m.name }}</text>
              </view>
            </view>

            <!-- 书体选择（仅书法家模式） -->
            <view v-if="selectedMaster" class="script-row">
              <view
                v-for="s in availableScripts"
                :key="s"
                class="script-chip"
                :class="{ active: selectedScript === s }"
                @tap="selectedScript = s"
              >
                <text class="script-chip-text">{{ scriptLabels[s] }}</text>
              </view>
              <text class="master-hint">· AI 书法家模式（即将上线）</text>
            </view>

            <view class="control-row">
              <view class="selector" @tap="showFontPanel = !showFontPanel">
                <text class="selector-label">字</text>
                <text class="selector-name">{{ currentFontLabel }}</text>
              </view>
              <view class="selector" @tap="showPaperPanel = !showPaperPanel">
                <text class="selector-label">纸</text>
                <text class="selector-name">{{ currentBgLabel }}</text>
              </view>
              <view class="selector" @tap="onChangeTemplate">
                <text class="selector-label">式</text>
                <text class="selector-name">{{ currentTmplLabel }}</text>
              </view>
            </view>

            <view class="control-row">
              <view class="selector" @tap="showMountPanel = !showMountPanel">
                <text class="selector-label">裱</text>
                <text class="selector-name">{{ currentMountLabel }}</text>
              </view>
              <view class="selector" @tap="showBorderPanel = !showBorderPanel">
                <text class="selector-label">线</text>
                <text class="selector-name">{{ currentBorderLabel }}</text>
              </view>
              <view class="selector" @tap="showTexturePanel = !showTexturePanel">
                <text class="selector-label">纹</text>
                <text class="selector-name">{{ currentTextureLabel }}</text>
              </view>
            </view>

            <view class="control-row">
              <view class="selector selector--slider">
                <text class="selector-label">字号</text>
                <text class="selector-name">{{ fontScale }}%</text>
                <slider
                  class="font-scale-slider"
                  :value="fontScale"
                  :min="60"
                  :max="160"
                  :step="10"
                  activeColor="#5b7f95"
                  backgroundColor="rgba(26, 26, 46, 0.1)"
                  block-size="14"
                  @changing="onFontScaleChanging"
                  @change="onFontScaleChange"
                />
              </view>
            </view>

            <view class="control-row control-row--offset">
              <view class="selector selector--slider">
                <text class="selector-label">横移</text>
                <text class="selector-name">{{ offsetX }}</text>
                <slider
                  class="font-scale-slider"
                  :value="offsetX"
                  :min="-200"
                  :max="200"
                  :step="5"
                  activeColor="#5b7f95"
                  backgroundColor="rgba(26, 26, 46, 0.1)"
                  block-size="14"
                  @changing="(e: any) => offsetX = e.detail.value"
                  @change="(e: any) => offsetX = e.detail.value"
                />
              </view>
              <view class="selector selector--slider">
                <text class="selector-label">纵移</text>
                <text class="selector-name">{{ offsetY }}</text>
                <slider
                  class="font-scale-slider"
                  :value="offsetY"
                  :min="-200"
                  :max="200"
                  :step="5"
                  activeColor="#5b7f95"
                  backgroundColor="rgba(26, 26, 46, 0.1)"
                  block-size="14"
                  @changing="(e: any) => offsetY = e.detail.value"
                  @change="(e: any) => offsetY = e.detail.value"
                />
              </view>
            </view>

            <!-- 落款面板 -->
            <view
              class="stamp-panel"
              :class="{ 'stamp-panel--open': showColophonPanel }"
            >
              <view class="stamp-panel-header" @tap="showColophonPanel = !showColophonPanel">
                <text class="stamp-panel-label">落款</text>
                <text class="stamp-panel-chevron">{{ showColophonPanel ? '−' : '+' }}</text>
              </view>
              <view v-if="showColophonPanel" class="stamp-panel-body">
                <view class="stamp-input-row">
                  <text class="stamp-field-label">书者</text>
                  <input
                    class="stamp-input"
                    type="text"
                    :value="colophonCalligrapher"
                    maxlength="8"
                    placeholder="如「墨韵」"
                    @input="(e: any) => colophonCalligrapher = e.detail.value || ''"
                  />
                </view>
                <view class="stamp-input-row">
                  <text class="stamp-field-label">动词</text>
                  <view class="colophon-verb-row">
                    <view
                      v-for="v in colophonVerbOptions"
                      :key="v"
                      class="colophon-verb-chip"
                      :class="{ 'colophon-verb-chip--active': colophonVerb === v }"
                      @tap="colophonVerb = v"
                    >
                      <text>{{ v }}</text>
                    </view>
                  </view>
                </view>
                <view class="stamp-input-row">
                  <text class="stamp-field-label">日期</text>
                  <view class="colophon-toggle" @tap="colophonShowDate = !colophonShowDate">
                    <view class="colophon-toggle-track" :class="{ active: colophonShowDate }">
                      <view class="colophon-toggle-thumb" />
                    </view>
                    <text class="colophon-toggle-text">{{ colophonShowDate ? '显示' : '隐藏' }}</text>
                  </view>
                </view>
                <view class="stamp-input-row">
                  <text class="stamp-field-label">排列</text>
                  <view class="colophon-verb-row">
                    <view
                      v-for="opt in colophonLayoutOptions"
                      :key="opt.key"
                      class="colophon-verb-chip"
                      :class="{ 'colophon-verb-chip--active': colophonLayout === opt.key }"
                      @tap="colophonLayout = opt.key"
                    >
                      <text>{{ opt.label }}</text>
                    </view>
                  </view>
                </view>
                <view class="stamp-input-row">
                  <text class="stamp-field-label">横移</text>
                  <text class="stamp-size-value">{{ colophonOffsetX }}</text>
                  <slider
                    class="stamp-size-slider"
                    :value="colophonOffsetX"
                    :min="-200"
                    :max="200"
                    :step="2"
                    activeColor="#5b7f95"
                    backgroundColor="rgba(26, 26, 46, 0.1)"
                    block-size="14"
                    @changing="(e: any) => { colophonOffsetX = e.detail.value; renderCard() }"
                    @change="(e: any) => { colophonOffsetX = e.detail.value; renderCard() }"
                  />
                </view>
                <view class="stamp-input-row">
                  <text class="stamp-field-label">纵移</text>
                  <text class="stamp-size-value">{{ colophonOffsetY }}</text>
                  <slider
                    class="stamp-size-slider"
                    :value="colophonOffsetY"
                    :min="-200"
                    :max="200"
                    :step="2"
                    activeColor="#5b7f95"
                    backgroundColor="rgba(26, 26, 46, 0.1)"
                    block-size="14"
                    @changing="(e: any) => { colophonOffsetY = e.detail.value; renderCard() }"
                    @change="(e: any) => { colophonOffsetY = e.detail.value; renderCard() }"
                  />
                </view>
                <view class="colophon-preview">
                  <text class="colophon-preview-title">预览</text>
                  <view class="colophon-preview-text">
                    <text v-for="(line, i) in colophonPreviewLines" :key="i" class="colophon-preview-line">{{ line }}</text>
                  </view>
                </view>
              </view>
            </view>

            <view
              class="stamp-panel"
              :class="{ 'stamp-panel--open': showStampPanel }"
            >
              <view class="stamp-panel-header" @tap="showStampPanel = !showStampPanel">
                <text class="stamp-panel-label">印章区</text>
                <text class="stamp-panel-chevron">{{ showStampPanel ? '−' : '+' }}</text>
              </view>
              <view v-if="showStampPanel" class="stamp-panel-body">
                <view class="stamp-input-row">
                  <text class="stamp-field-label">印文</text>
                  <input
                    class="stamp-input"
                    type="text"
                    :value="stampText"
                    maxlength="4"
                    placeholder="1-4字"
                    @input="onStampTextInput"
                  />
                </view>
                <view class="stamp-input-row">
                  <text class="stamp-field-label">印字</text>
                  <view class="stamp-font-selector" @tap="onChangeStampFont">
                    <text class="stamp-font-preview" :style="{ fontFamily: STAMP_FONTS[stampFontKey].family }">{{ stampText }}</text>
                    <text class="stamp-font-name">{{ STAMP_FONTS[stampFontKey].label }}</text>
                    <text class="stamp-font-arrow">›</text>
                  </view>
                </view>
                <view class="stamp-input-row">
                  <text class="stamp-field-label">位置</text>
                  <view class="stamp-pos-actions">
                    <view class="stamp-position-grid">
                      <view
                        v-for="pos in stampPosGridOrder"
                        :key="pos"
                        class="stamp-pos-cell"
                        :class="{ 'stamp-pos-cell--active': !stampX && stampPosition === pos }"
                        @tap="onResetStampPos(); stampPosition = pos"
                      >
                        <view class="stamp-pos-dot" :class="`stamp-pos-dot--${pos}`" />
                      </view>
                    </view>
                    <view class="stamp-pos-free" :class="{ active: stampX !== undefined }">
                      <text class="stamp-pos-free-text">{{ stampX !== undefined ? '自由定位中' : '点击卡片定位' }}</text>
                    </view>
                  </view>
                </view>
                <view class="stamp-input-row stamp-size-row">
                  <text class="stamp-field-label">大小</text>
                  <text class="stamp-size-value">{{ stampSizeVal }}</text>
                  <slider
                    class="stamp-size-slider"
                    :value="stampSizeVal"
                    :min="30"
                    :max="120"
                    :step="2"
                    activeColor="#cc3333"
                    backgroundColor="rgba(26, 26, 46, 0.1)"
                    block-size="14"
                    @changing="(e: any) => stampSizeVal = e.detail.value"
                    @change="(e: any) => stampSizeVal = e.detail.value"
                  />
                </view>
              </view>
            </view>

            <!-- 字体选择列表面板 -->
            <view v-if="showFontPanel" class="font-list-panel">
              <view class="font-list-header">
                <text class="font-list-title">选择书体</text>
                <text class="font-list-close" @tap="showFontPanel = false">×</text>
              </view>
              <scroll-view scroll-y class="font-list-scroll">
                <view
                  v-for="group in fontGroups"
                  :key="group.scriptType"
                  class="font-group"
                >
                  <view class="font-group-header">
                    <text class="font-group-label">{{ group.label }}</text>
                    <text v-if="group.fonts.length === 0" class="font-group-empty">即将上线</text>
                  </view>
                  <view
                    v-for="f in group.fonts"
                    :key="f.key"
                    class="font-item"
                    :class="{ active: currentFont === f.key }"
                    @tap="selectFont(f.key)"
                  >
                    <text class="font-item-name" :style="{ fontFamily: f.cssFontFamily }">{{ f.label }}</text>
                    <text class="font-item-desc">{{ f.description }}</text>
                    <text v-if="currentFont === f.key" class="font-item-check">✓</text>
                  </view>
                </view>
              </scroll-view>
            </view>

            <!-- 纹理选择面板 -->
            <view v-if="showTexturePanel" class="font-list-panel">
              <view class="font-list-header">
                <text class="font-list-title">选择纹理</text>
                <text class="font-list-close" @tap="showTexturePanel = false">×</text>
              </view>

              <!-- 浓淡滑块置顶 -->
              <view v-if="currentTextureType !== 'su-mian'" class="texture-intensity-row">
                <text class="texture-intensity-label">浓淡</text>
                <text class="texture-intensity-value">{{ textureStrength }}%</text>
                <slider
                  class="texture-slider"
                  :value="textureStrength"
                  :min="10"
                  :max="500"
                  :step="10"
                  activeColor="#5b7f95"
                  backgroundColor="rgba(26, 26, 46, 0.1)"
                  block-size="14"
                  @changing="(e: any) => textureStrength = e.detail.value"
                  @change="(e: any) => textureStrength = e.detail.value"
                />
              </view>

              <scroll-view scroll-y class="font-list-scroll">
                <view
                  v-for="key in textureTypeKeys"
                  :key="key"
                  class="font-item texture-item"
                  :class="{ active: currentTextureType === key }"
                  @tap="selectTexture(key)"
                >
                  <view class="texture-icon" :class="`texture-icon--${key}`" />
                  <view class="paper-info">
                    <text class="font-item-name">{{ TEXTURE_TYPES[key].label }}</text>
                    <text class="font-item-desc">{{ TEXTURE_TYPES[key].description }}</text>
                    <text class="texture-origin">{{ TEXTURE_TYPES[key].origin }}</text>
                  </view>
                  <text v-if="currentTextureType === key" class="font-item-check">✓</text>
                </view>
              </scroll-view>
            </view>

            <!-- 装裱形制选择面板 -->
            <view v-if="showMountPanel" class="font-list-panel">
              <view class="font-list-header">
                <text class="font-list-title">选择装裱</text>
                <text class="font-list-close" @tap="showMountPanel = false">×</text>
              </view>
              <scroll-view scroll-y class="font-list-scroll">
                <view
                  v-for="(info, key) in MOUNT_STYLES"
                  :key="key"
                  class="font-item texture-item"
                  :class="{ active: currentMount === key }"
                  @tap="selectMount(key as MountStyle)"
                >
                  <view class="paper-info">
                    <text class="font-item-name">{{ info.label }}</text>
                    <text class="font-item-desc">{{ info.description }}</text>
                    <text class="texture-origin">{{ info.origin }}</text>
                  </view>
                  <text v-if="currentMount === key" class="font-item-check">✓</text>
                </view>
              </scroll-view>
            </view>

            <!-- 边框纹饰选择面板 -->
            <view v-if="showBorderPanel" class="font-list-panel">
              <view class="font-list-header">
                <text class="font-list-title">选择边框纹饰</text>
                <text class="font-list-close" @tap="showBorderPanel = false">×</text>
              </view>
              <scroll-view scroll-y class="font-list-scroll">
                <view
                  v-for="(info, key) in BORDER_STYLES"
                  :key="key"
                  class="font-item texture-item"
                  :class="{ active: currentBorder === key }"
                  @tap="selectBorder(key as BorderStyle)"
                >
                  <view class="paper-info">
                    <text class="font-item-name">{{ info.label }}</text>
                    <text class="font-item-desc">{{ info.description }}</text>
                    <text class="texture-origin">{{ info.origin }}</text>
                  </view>
                  <text v-if="currentBorder === key" class="font-item-check">✓</text>
                </view>
              </scroll-view>
            </view>

            <!-- 纸张选择列表面板 -->
            <view v-if="showPaperPanel" class="font-list-panel">
              <view class="font-list-header">
                <text class="font-list-title">选择纸张</text>
                <text class="font-list-close" @tap="showPaperPanel = false">×</text>
              </view>
              <scroll-view scroll-y class="font-list-scroll">
                <view
                  v-for="group in paperGroups"
                  :key="group.category"
                  class="font-group"
                >
                  <view class="font-group-header">
                    <text class="font-group-label">{{ group.label }}</text>
                    <text class="font-group-desc">{{ group.description }}</text>
                  </view>
                  <view
                    v-for="p in group.papers"
                    :key="p.key"
                    class="font-item paper-item"
                    :class="{ active: currentBg === p.key }"
                    @tap="selectPaper(p.key)"
                  >
                    <view
                      v-if="p.key === 'custom-photo' && bgImagePreview"
                      class="paper-swatch"
                      :style="{ backgroundImage: `url(${bgImagePreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
                    />
                    <view
                      v-else
                      class="paper-swatch"
                      :style="{ background: `linear-gradient(135deg, ${p.baseColors[0]}, ${p.baseColors[1]})` }"
                    />
                    <view class="paper-info">
                      <text class="font-item-name">{{ p.label }}</text>
                      <text class="font-item-desc">{{ p.key === 'custom-photo' ? (bgImagePreview ? '已选择 · 点击更换' : '点击上传照片') : p.description }}</text>
                    </view>
                    <text v-if="currentBg === p.key" class="font-item-check">✓</text>
                  </view>
                </view>
              </scroll-view>
            </view>

          </view>
      </view>

      <!-- 拖拽分割线 2 -->
      <div class="panel-divider" ref="divider1Ref"></div>

      <!-- 右栏：诗词文本 + 操作按钮 -->
      <view class="panel panel-right">
        <view class="poem-section">
          <!-- 用户原始输入 -->
          <view v-if="userInput.prompt || (userInput.images && userInput.images.length)" class="user-input-card">
            <view class="input-card-header">
              <text class="input-card-label">创作缘起</text>
            </view>
            <text v-if="userInput.prompt" class="input-card-prompt">「{{ userInput.prompt }}」</text>
            <view v-if="userInput.genre || userInput.style" class="input-card-tags">
              <text v-if="userInput.genre" class="input-card-tag">{{ userInput.genre }}</text>
              <text v-if="userInput.style" class="input-card-tag">{{ userInput.style }}</text>
            </view>
            <view v-if="userInput.images && userInput.images.length" class="input-card-images">
              <image
                v-for="(img, idx) in userInput.images"
                :key="idx"
                :src="img"
                mode="aspectFill"
                class="input-card-img"
                @tap="onPreviewInputImage(idx)"
              />
            </view>
          </view>

          <view class="poem-header">
            <view class="poem-title">《{{ poem.title }}》</view>
            <view class="poem-meta">
              <text class="poem-genre">{{ poem.genre }}</text>
              <text v-if="poem.rhyme" class="poem-rhyme">{{ poem.rhyme }}</text>
            </view>
          </view>

          <view
            class="poem-content"
            :class="{ 'poem-content--vertical': currentTmpl === 'vertical' }"
          >
            <template v-for="(line, idx) in poem.content" :key="idx">
              <text class="poem-line">{{ line }}</text>
              <view
                v-if="idx < poem.content.length - 1"
                class="poem-dot"
                aria-hidden="true"
              />
            </template>
          </view>

          <view
            class="ink-card"
            :class="{ 'ink-card--open': showTranslation }"
            @tap="showTranslation = !showTranslation"
          >
            <view class="ink-card-header">
              <text class="ink-card-label">白话译文</text>
              <text class="ink-card-chevron">{{ showTranslation ? '−' : '+' }}</text>
            </view>
            <view v-if="showTranslation" class="ink-card-body">
              <text class="ink-card-text">{{ poem.translation }}</text>
            </view>
          </view>

          <view
            class="ink-card"
            :class="{ 'ink-card--open': showAppreciation }"
            @tap="showAppreciation = !showAppreciation"
          >
            <view class="ink-card-header">
              <text class="ink-card-label">诗意赏析</text>
              <text class="ink-card-chevron">{{ showAppreciation ? '−' : '+' }}</text>
            </view>
            <view v-if="showAppreciation" class="ink-card-body">
              <text class="ink-card-text">{{ poem.appreciation }}</text>
            </view>
          </view>
        </view>

        <view class="actions-bar">
          <view class="action-btn action-btn--save" @tap="onSaveImage">
            <text class="action-btn-text">保存高清图</text>
          </view>
          <view class="action-btn action-btn--copy" @tap="onCopyPoem">
            <text class="action-btn-text">复制诗词</text>
          </view>
          <view class="action-btn action-btn--share" @tap="onShare">
            <text class="action-btn-text">分享</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import type { PoemResult, CalligraphyFont, CardBackground, CardTemplate, Calligrapher, CalligraphyScript } from '@moyun/core'
import {
  CALLIGRAPHY_FONTS,
  CARD_BACKGROUNDS,
  CARD_TEMPLATES,
  renderCalligraphyCard,
  BORDER_STYLES,
  TEXTURE_INTENSITIES,
  STAMP_POSITIONS,
  STAMP_FONTS,
  CALLIGRAPHERS,
  CALLIGRAPHY_SCRIPTS,
  getFontsByScript,
  PAPERS,
  getPapersByCategory,
  TEXTURE_TYPES,
} from '@moyun/core/calligraphy'
import type { BorderStyle, TextureIntensity, TextureType, StampPosition } from '@moyun/core/calligraphy'

// Google Fonts 系列（行/草/手写）
import '@fontsource/ma-shan-zheng'
import '@fontsource/liu-jian-mao-cao'
import '@fontsource/zhi-mang-xing'
import '@fontsource/long-cang'
// 楷书系列
import '@fontsource/lxgw-wenkai'
import 'cn-fontsource-slideyouran-regular/font.css'
import 'cn-fontsource-slideqiuhong-regular/font.css'
import 'cn-fontsource-alimama-dong-fang-da-kai-regular/font.css'
// 行书
import 'cn-fontsource-hongleixingshu-regular/font.css'
// 宋楷
import '@fontsource/zcool-xiaowei'

const poem = ref<PoemResult>({
  title: '秋思',
  genre: '七言绝句',
  rhyme: '先韵',
  content: ['枫林晚照映长天，', '雁字南归带暮烟。', '独倚西楼人不见，', '一江秋水月如弦。'],
  translation: '深秋枫林在夕阳映照下与长天相接，南归的雁阵带着暮色中的薄烟远去。',
  appreciation: '此诗以枫林、归雁、西楼、秋水构成完整秋景，末句「月如弦」喻相思不圆满。',
})

const fontKeys = Object.keys(CALLIGRAPHY_FONTS) as CalligraphyFont[]
const fontGroups = getFontsByScript()
const showFontPanel = ref(false)

function selectFont(key: CalligraphyFont) {
  currentFont.value = key
  showFontPanel.value = false
}

const paperGroups = getPapersByCategory()
const showPaperPanel = ref(false)
const bgImage = ref<HTMLImageElement | null>(null)
const bgImagePreview = ref('')

function selectPaper(key: CardBackground) {
  if (key === 'custom-photo') {
    pickBgPhoto()
    return
  }
  currentBg.value = key
  showPaperPanel.value = false
}

function pickBgPhoto() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      bgImagePreview.value = url
      const img = new Image()
      img.onload = () => {
        bgImage.value = img
        currentBg.value = 'custom-photo'
        showPaperPanel.value = false
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }
  input.click()
}
const tmplKeys = Object.keys(CARD_TEMPLATES) as CardTemplate[]
const borderKeys = Object.keys(BORDER_STYLES) as BorderStyle[]
const textureKeys = Object.keys(TEXTURE_INTENSITIES) as TextureIntensity[]
const stampPosKeys = Object.keys(STAMP_POSITIONS) as StampPosition[]
const stampPosGridOrder: StampPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

// 装裱形制
type MountStyle =
  | 'none'          // 无装裱
  | 'jing-pian'     // 镜片（素白卡纸托裱）
  | 'ling-biao'     // 绫裱（绫绢裱边，最经典）
  | 'xuan-he'       // 宣和装（宋徽宗御制格式）
  | 'hong-mu'       // 红木框（明式家具风格）
  | 'jin-qi'        // 金漆框（鎏金宫廷风）
  | 'zhu-kuang'     // 竹框（文人气质）
  | 'li-zhou'       // 立轴（天杆地杆卷轴）

interface MountInfo {
  label: string
  description: string
  origin: string
}

const MOUNT_STYLES: Record<MountStyle, MountInfo> = {
  'none': {
    label: '无装裱',
    description: '不加外框，直接展示',
    origin: '现代简约',
  },
  'jing-pian': {
    label: '镜片',
    description: '素白卡纸托裱，适合装框上墙',
    origin: '现代最常见的装裱方式',
  },
  'ling-biao': {
    label: '绫裱',
    description: '褐色绫绢裱边，天地头留白',
    origin: '传统装裱核心技艺',
  },
  'xuan-he': {
    label: '宣和装',
    description: '隔水、惊燕带齐全，天青地米',
    origin: '宋徽宗御制装裱规范',
  },
  'hong-mu': {
    label: '红木框',
    description: '花梨木纹画框，古朴庄重',
    origin: '明式家具审美',
  },
  'jin-qi': {
    label: '金漆框',
    description: '鎏金漆面画框，宫廷华贵',
    origin: '宫廷殿堂装饰',
  },
  'zhu-kuang': {
    label: '竹框',
    description: '竹制画框，清雅自然',
    origin: '文人书斋风格',
  },
  'li-zhou': {
    label: '立轴',
    description: '天杆地杆，悬挂展示',
    origin: '传统竖幅书法标配',
  },
}
const mountKeys = Object.keys(MOUNT_STYLES) as MountStyle[]
const showMountPanel = ref(false)

// 书法家 AI 模式
const masterList = CALLIGRAPHERS.filter(m => m.name !== null)
const selectedMaster = ref<Calligrapher>(null)
const selectedScript = ref<CalligraphyScript>('楷')
const availableScripts = computed(() => {
  if (!selectedMaster.value) return []
  const master = CALLIGRAPHERS.find(m => m.name === selectedMaster.value)
  return master?.styles || ['楷', '行', '草']
})
const scriptLabels: Record<CalligraphyScript, string> = {
  '楷': '楷书', '行': '行书', '草': '草书',
}

function selectMaster(name: Calligrapher) {
  selectedMaster.value = name
  if (name) {
    const master = CALLIGRAPHERS.find(m => m.name === name)
    if (master && !master.styles.includes(selectedScript.value)) {
      selectedScript.value = master.styles[0]
    }
    uni.showToast({ title: `${name} · ${scriptLabels[selectedScript.value]}（即将上线）`, icon: 'none', duration: 1500 })
  }
}

const currentFont = ref<CalligraphyFont>('MaShanZheng')
const currentBg = ref<CardBackground>('ban-sheng-shu')
const currentTmpl = ref<CardTemplate>('vertical')
const currentMount = ref<MountStyle>('none')
const currentBorder = ref<BorderStyle>('none')
const showBorderPanel = ref(false)
const currentTexture = ref<TextureIntensity>('medium')
const currentTextureType = ref<TextureType>('mian-xian-wei')
const textureStrength = ref(100)
const previewScale = ref(100)
const showTexturePanel = ref(false)
const textureTypeKeys = Object.keys(TEXTURE_TYPES) as TextureType[]
const fontScale = ref(100)
const offsetX = ref(0)
const offsetY = ref(0)

// ---- 拖拽分割线 ----
const layoutRef = ref<HTMLElement | null>(null)
const divider0Ref = ref<HTMLElement | null>(null)
const divider1Ref = ref<HTMLElement | null>(null)
const panelLeftW = ref(36)
const panelCenterW = ref(28)

const isDragging = ref(false)

const panelLeftStyle = computed(() => ({
  width: `${panelLeftW.value}%`,
  minWidth: '200px',
  maxWidth: 'none',
  flex: 'none',
  transition: isDragging.value ? 'none' : undefined,
}))
const panelCenterStyle = computed(() => ({
  width: `${panelCenterW.value}%`,
  minWidth: '180px',
  maxWidth: 'none',
  flex: 'none',
  transition: isDragging.value ? 'none' : undefined,
}))

let draggingIdx = -1
let dragStartX = 0
let dragStartLeftW = 0
let dragStartCenterW = 0

function getLayoutEl(): HTMLElement | null {
  const r = layoutRef.value
  if (!r) return null
  if (r instanceof HTMLElement) return r
  // uni-app ref 可能返回组件实例，取 $el
  const el = (r as any).$el
  return el instanceof HTMLElement ? el : null
}

function handleDividerDown(idx: number, e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
  draggingIdx = idx
  dragStartX = e.clientX
  dragStartLeftW = panelLeftW.value
  dragStartCenterW = panelCenterW.value
  document.addEventListener('mousemove', handleDividerMove, true)
  document.addEventListener('mouseup', handleDividerUp, true)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function handleDividerMove(e: MouseEvent) {
  const el = getLayoutEl()
  if (!el) return
  const totalW = el.offsetWidth
  if (!totalW) return
  const dx = ((e.clientX - dragStartX) / totalW) * 100

  if (draggingIdx === 0) {
    let newLeft = dragStartLeftW + dx
    let newCenter = dragStartCenterW - dx
    newLeft = Math.max(15, Math.min(60, newLeft))
    newCenter = Math.max(15, Math.min(60, newCenter))
    panelLeftW.value = newLeft
    panelCenterW.value = newCenter
  } else {
    let newCenter = dragStartCenterW + dx
    newCenter = Math.max(15, Math.min(60, newCenter))
    const rightW = 100 - panelLeftW.value - newCenter
    if (rightW >= 15) {
      panelCenterW.value = newCenter
    }
  }
}

function handleDividerUp() {
  isDragging.value = false
  draggingIdx = -1
  document.removeEventListener('mousemove', handleDividerMove, true)
  document.removeEventListener('mouseup', handleDividerUp, true)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 在 onMounted 中用原生 addEventListener 绑定，绕过 uni-app 事件系统
function getDividerEl(r: any): HTMLElement | null {
  if (!r) return null
  if (r instanceof HTMLElement) return r
  const el = r?.$el
  return el instanceof HTMLElement ? el : null
}

function setupDividerEvents() {
  const d0 = getDividerEl(divider0Ref.value)
  const d1 = getDividerEl(divider1Ref.value)
  if (d0) {
    d0.addEventListener('mousedown', (e) => handleDividerDown(0, e))
  }
  if (d1) {
    d1.addEventListener('mousedown', (e) => handleDividerDown(1, e))
  }
}
const stampText = ref('墨韵')
const stampSizeVal = ref(56)
const stampPosition = ref<StampPosition>('bottom-left')

// 落款
const showColophonPanel = ref(true)
const colophonCalligrapher = ref('墨韵')
const colophonVerb = ref('书')
const colophonShowDate = ref(true)
const colophonVerbOptions = ['书', '录', '谨录', '题', '敬书']
const colophonOffsetX = ref(0)
const colophonOffsetY = ref(0)
const colophonLayout = ref<'auto' | 'single' | 'multi'>('auto')
const colophonLayoutOptions = [
  { key: 'auto' as const, label: '自动' },
  { key: 'single' as const, label: '合一列' },
  { key: 'multi' as const, label: '分列' },
]
function toGanZhi(year: number): string {
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const idx = year - 4
  return `${gan[idx % 10]}${zhi[idx % 12]}`
}
function toSeasonMonth(month: number): string {
  const names: Record<number, string> = {
    0: '孟春', 1: '仲春', 2: '季春',
    3: '孟夏', 4: '仲夏', 5: '季夏',
    6: '孟秋', 7: '仲秋', 8: '季秋',
    9: '孟冬', 10: '仲冬', 11: '季冬',
  }
  return names[month] ?? '仲秋'
}
const colophonPreviewLines = computed(() => {
  const datePart = colophonShowDate.value
    ? `${toGanZhi(new Date().getFullYear())}年${toSeasonMonth(new Date().getMonth())}`
    : ''
  const namePart = `${colophonCalligrapher.value}${colophonVerb.value}`
  const mergedLen = datePart.length + namePart.length
  const useSingle = colophonLayout.value === 'single' || (colophonLayout.value === 'auto' && mergedLen <= 8)

  const lines: string[] = []
  lines.push(poem.value.title)
  if (useSingle) {
    lines.push(`${datePart}${namePart}`)
  } else {
    if (datePart) lines.push(datePart)
    lines.push(namePart)
  }
  return lines
})
const stampFontKey = ref('simsun')
const stampFontKeys = Object.keys(STAMP_FONTS)
const stampX = ref<number | undefined>(undefined)
const stampY = ref<number | undefined>(undefined)
const stampDragging = ref(false)
const showStampPanel = ref(false)
const showTranslation = ref(false)
const showAppreciation = ref(false)

const currentFontLabel = computed(() => CALLIGRAPHY_FONTS[currentFont.value].label)
const currentBgLabel = computed(() => PAPERS[currentBg.value]?.label ?? CARD_BACKGROUNDS[currentBg.value]?.label ?? '默认')
const currentTmplLabel = computed(() => CARD_TEMPLATES[currentTmpl.value].label)
const currentMountLabel = computed(() => MOUNT_STYLES[currentMount.value].label)
const currentBorderLabel = computed(() => BORDER_STYLES[currentBorder.value].label)
const currentTextureLabel = computed(() => TEXTURE_TYPES[currentTextureType.value]?.label ?? '棉纤维')

function selectTexture(type: TextureType) {
  if (type === 'su-mian') {
    currentTexture.value = 'none'
  } else if (currentTexture.value === 'none') {
    currentTexture.value = 'medium'
  }
  currentTextureType.value = type
  showTexturePanel.value = false
}

async function ensureFontReady(font: CalligraphyFont): Promise<void> {
  const family = CALLIGRAPHY_FONTS[font].cssFontFamily
  if (document.fonts) {
    try {
      await document.fonts.load(`48px "${family}"`)
      await document.fonts.ready
    } catch (_) {
      await new Promise(r => setTimeout(r, 300))
    }
  }
}

const cardContainer = ref<any>(null)
let canvasEl: HTMLCanvasElement | null = null

function buildRenderOptions() {
  return {
    poem: poem.value,
    font: currentFont.value,
    template: currentTmpl.value,
    background: currentBg.value,
    stampText: stampText.value,
    showWatermark: true,
    colophon: {
      calligrapher: colophonCalligrapher.value || '墨韵',
      verb: colophonVerb.value,
      showDate: colophonShowDate.value,
      layout: colophonLayout.value,
      offsetX: colophonOffsetX.value,
      offsetY: colophonOffsetY.value,
    },
    fontScale: fontScale.value / 100,
    borderStyle: currentBorder.value,
    textureIntensity: currentTexture.value,
    textureType: currentTextureType.value,
    textureStrength: currentTextureType.value === 'su-mian' ? 0 : textureStrength.value,
    stampPosition: stampPosition.value,
    stampFont: stampFontKey.value,
    stampX: stampX.value,
    stampY: stampY.value,
    offsetX: offsetX.value,
    offsetY: offsetY.value,
    stampSize: stampSizeVal.value,
    backgroundImage: bgImage.value,
  }
}

async function renderCard() {
  await ensureFontReady(currentFont.value)
  const container = document.querySelector('.card-container') as HTMLElement
  if (!container) return

  const tmpl = CARD_TEMPLATES[currentTmpl.value]
  const baseW = Math.min(343, window.innerWidth - 64)
  const displayW = Math.round(baseW * previewScale.value / 100)
  const scale = displayW / tmpl.width
  const displayH = tmpl.height * scale

  if (!canvasEl) {
    canvasEl = document.createElement('canvas')
    canvasEl.id = 'calligraphyCanvas'
    canvasEl.style.borderRadius = '4px'
    canvasEl.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
    container.appendChild(canvasEl)
  }

  canvasEl.width = tmpl.width
  canvasEl.height = tmpl.height
  canvasEl.style.width = `${displayW}px`
  canvasEl.style.height = `${displayH}px`

  const ctx = canvasEl.getContext('2d')
  if (!ctx) return

  renderCalligraphyCard(ctx, buildRenderOptions())
}

/** 用户原始输入信息 */
const userInput = ref<{ prompt?: string; genre?: string; style?: string; images?: string[] }>({})

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const query = currentPage?.$page?.options || currentPage?.options || {}
  if (query?.from === 'storage') {
    // 从 localStorage 读取（推荐方式，避免超长 URL）
    try {
      const poemRaw = localStorage.getItem('moyun_nav_poem')
      if (poemRaw) poem.value = JSON.parse(poemRaw)
      const inputRaw = localStorage.getItem('moyun_nav_input')
      if (inputRaw) userInput.value = JSON.parse(inputRaw)
    } catch (e) {
      console.error('解析诗词数据失败', e)
    }
    localStorage.removeItem('moyun_nav_poem')
    localStorage.removeItem('moyun_nav_input')
  } else if (query?.poem) {
    // 兼容旧的 URL 参数方式
    try {
      poem.value = JSON.parse(decodeURIComponent(query.poem))
    } catch (e) {
      console.error('解析诗词数据失败', e)
    }
    if (query?.input) {
      try {
        userInput.value = JSON.parse(decodeURIComponent(query.input))
      } catch (_) {}
    }
  }

  await nextTick()
  setupDividerEvents()
  setTimeout(async () => {
    await renderCard()
  }, 100)
})

watch(
  [currentFont, currentBg, currentTmpl, currentBorder, currentTexture, currentTextureType, textureStrength, fontScale, stampText, stampSizeVal, stampPosition, stampFontKey, stampX, stampY, offsetX, offsetY, previewScale, colophonCalligrapher, colophonVerb, colophonShowDate, colophonOffsetX, colophonOffsetY, colophonLayout],
  async () => {
    await renderCard()
  },
)

function goBack() {
  uni.navigateBack()
}

function onChangeFont() {
  const idx = fontKeys.indexOf(currentFont.value)
  currentFont.value = fontKeys[(idx + 1) % fontKeys.length]
}

function onChangeBackground() {
  showPaperPanel.value = !showPaperPanel.value
}

function onChangeTemplate() {
  const idx = tmplKeys.indexOf(currentTmpl.value)
  currentTmpl.value = tmplKeys[(idx + 1) % tmplKeys.length]
}

function selectMount(style: MountStyle) {
  currentMount.value = style
  showMountPanel.value = false
}

function onChangeMount() {
  showMountPanel.value = !showMountPanel.value
}

function selectBorder(style: BorderStyle) {
  currentBorder.value = style
  showBorderPanel.value = false
}

function onChangeBorder() {
  showBorderPanel.value = !showBorderPanel.value
}

function onChangeTexture() {
  showTexturePanel.value = !showTexturePanel.value
}

function onChangeStampFont() {
  const idx = stampFontKeys.indexOf(stampFontKey.value)
  stampFontKey.value = stampFontKeys[(idx + 1) % stampFontKeys.length]
}

function onCardClick(e: MouseEvent | TouchEvent) {
  if (!canvasEl) return
  const rect = canvasEl.getBoundingClientRect()
  let clientX: number, clientY: number
  if ('touches' in e) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }
  const px = (clientX - rect.left) / rect.width
  const py = (clientY - rect.top) / rect.height
  stampX.value = Math.max(0.05, Math.min(0.95, px))
  stampY.value = Math.max(0.05, Math.min(0.95, py))
}

function onResetStampPos() {
  stampX.value = undefined
  stampY.value = undefined
}

function onFontScaleChanging(e: { detail: { value: number } }) {
  fontScale.value = e.detail.value
}

function onFontScaleChange(e: { detail: { value: number } }) {
  fontScale.value = e.detail.value
}

function onStampTextInput(e: { detail: { value: string } }) {
  const raw = e.detail.value || ''
  stampText.value = raw.slice(0, 4)
}

function onRegenerate() {
  uni.navigateBack()
}

function onPreviewInputImage(idx: number) {
  if (userInput.value.images?.length) {
    uni.previewImage({ current: userInput.value.images[idx], urls: userInput.value.images })
  }
}

async function onSaveImage() {
  const tmpl = CARD_TEMPLATES[currentTmpl.value]
  const scale = 2
  const hdCanvas = document.createElement('canvas')
  hdCanvas.width = tmpl.width * scale
  hdCanvas.height = tmpl.height * scale
  const hdCtx = hdCanvas.getContext('2d')
  if (!hdCtx) return

  hdCtx.scale(scale, scale)
  await ensureFontReady(currentFont.value)
  renderCalligraphyCard(hdCtx, buildRenderOptions())

  hdCanvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `墨韵_${poem.value.title}_${tmpl.width * scale}x${tmpl.height * scale}.png`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
    uni.showToast({ title: '高清图已保存', icon: 'success' })
  }, 'image/png')
}

function onCopyPoem() {
  const lines = poem.value.content.join('\n')
  const text = `《${poem.value.title}》\n${lines}\n\n${poem.value.translation}\n\n—— 墨韵AI · moyun.art`

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
    })
  } else {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
  }
}

async function onShare() {
  // 生成高清卡片图
  const tmpl = CARD_TEMPLATES[currentTmpl.value]
  const scale = 2
  const shareCanvas = document.createElement('canvas')
  shareCanvas.width = tmpl.width * scale
  shareCanvas.height = tmpl.height * scale
  const ctx = shareCanvas.getContext('2d')
  if (!ctx) return

  ctx.scale(scale, scale)
  await ensureFontReady(currentFont.value)
  renderCalligraphyCard(ctx, buildRenderOptions())

  // 尝试用 Web Share API 分享图片文件（支持的浏览器可直接分享到微信等）
  const blob: Blob | null = await new Promise((resolve) => shareCanvas.toBlob(resolve, 'image/png'))
  if (!blob) {
    uni.showToast({ title: '图片生成失败', icon: 'none' })
    return
  }

  const fileName = `墨韵_${poem.value.title}.png`
  const file = new File([blob], fileName, { type: 'image/png' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: `《${poem.value.title}》— 墨韵AI`,
        text: `${poem.value.content.join('')}\n\n来自墨韵AI · moyun.art`,
        files: [file],
      })
      return
    } catch (e: any) {
      if (e?.name === 'AbortError') return
    }
  }

  // Fallback：下载图片 + 提示用户手动分享
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = fileName
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
  uni.showToast({ title: '图片已保存，可发送给好友', icon: 'none', duration: 2500 })
}
</script>

<style lang="scss">
/* 阿里妈妈刀隶体 @font-face（fontpkg 原始文件） */
@font-face {
  font-family: 'Alimama DaoLiTi';
  src: url('@fontpkg/alimama-dao-li-ti/AlimamaDaoLiTi.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

$color-paper: var(--c-paper);
$color-ink: var(--c-ink);
$color-vermilion: var(--c-vermilion);
$color-mountain: var(--c-mountain);
$font-calligraphy: 'Ma Shan Zheng', serif;
$nav-height: 48px;
$breakpoint: 768px;

.page {
  min-height: 100vh;
  background-color: $color-paper;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.page-texture {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.45;
  background-image:
    radial-gradient(ellipse at 20% 50%, color-mix(in srgb, var(--c-mountain) 4%, transparent) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--c-vermilion) 3%, transparent) 0%, transparent 40%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      var(--c-ink-06) 3px,
      var(--c-ink-06) 4px
    );
}

// ── 顶部导航 ──
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $nav-height;
  padding: 0 16px;
  background: color-mix(in srgb, var(--c-paper) 88%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--c-ink-06);
  flex-shrink: 0;
}

.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;

  @media (hover: hover) {
    &:hover {
      background: color-mix(in srgb, var(--c-paper) 95%, transparent);
      transform: translateX(-2px);
    }
  }

  &:active {
    background: color-mix(in srgb, var(--c-paper) 85%, transparent);
  }
}

.nav-arrow {
  font-size: 20px;
  color: $color-ink;
  line-height: 1;
  font-weight: 300;
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-logo {
  font-family: $font-calligraphy;
  font-size: 16px;
  color: $color-vermilion;
  letter-spacing: 2px;
}

.nav-action {
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;

  @media (hover: hover) {
    &:hover {
      background: color-mix(in srgb, var(--c-mountain) 10%, transparent);
    }
  }

  &:active {
    opacity: 0.65;
  }
}

.nav-action-text {
  font-family: $font-calligraphy;
  font-size: 15px;
  color: $color-mountain;
  letter-spacing: 2px;
}

// ── 主布局 ──
.main-layout {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));

  @media (min-width: $breakpoint) {
    flex-direction: row;
    align-items: stretch;
    gap: 0;
    padding: 16px 20px 20px;
    min-height: calc(100vh - #{$nav-height});
  }
}

.panel {
  display: flex;
  flex-direction: column;
}

.panel-left {
  animation: slideInLeft 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  overflow-x: hidden;

  @media (min-width: $breakpoint) {
    padding-right: 12px;
    justify-content: flex-start;
    overflow-y: auto;
    max-height: calc(100vh - #{$nav-height} - 40px);
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
}

.panel-center {
  animation: slideInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
  overflow-x: hidden;

  @media (min-width: $breakpoint) {
    padding: 0 12px;
    overflow-y: auto;
    max-height: calc(100vh - #{$nav-height} - 40px);
  }
}

.panel-divider {
  display: none;

  @media (min-width: $breakpoint) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    flex-shrink: 0;
    cursor: col-resize;
    position: relative;
    z-index: 5;

    &::before {
      content: '';
      display: block;
      width: 3px;
      height: 40px;
      border-radius: 2px;
      background: var(--c-ink-15);
      transition: background 0.2s, height 0.2s;
    }

    &:hover::before {
      background: var(--c-ink-45);
      height: 60px;
    }

    &:active::before {
      background: var(--c-vermilion, #c75c2e);
      height: 80px;
    }
  }
}

.panel-right {
  animation: slideInRight 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (min-width: $breakpoint) {
    min-width: 200px;
    padding-left: 12px;
    overflow-y: auto;
    max-height: calc(100vh - #{$nav-height} - 40px);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-32px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(32px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// ── 左栏：书法卡片 ──
.card-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.preview-zoom-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 4px 0;
  flex-shrink: 0;
}

.preview-zoom-label {
  font-size: 11px;
  color: var(--c-ink-45);
  flex-shrink: 0;
}

.preview-zoom-value {
  font-size: 11px;
  color: var(--c-ink-65);
  flex-shrink: 0;
  min-width: 32px;
  text-align: right;
}

.preview-zoom-slider {
  flex: 1;
  margin: 0;
}

// ── 装裱画框系统 ──
.mount-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  .mount-mat {
    overflow: hidden;
  }

  // 画心与装裱之间的回边间距
  .card-container {
    margin: 4px;
  }
}

// 无装裱
.mount-none {
  .mount-mat {
    padding: 0;
    background: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  .card-container { margin: 0; }
}

// 镜片：素白卡纸托裱
.mount-jing-pian {
  .card-container { margin: 6px; }
  .mount-mat {
    padding: 24px;
    background: #fff;
    border-radius: 2px;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.06),
      0 8px 32px rgba(0, 0, 0, 0.08),
      inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  }
}

// 绫裱：褐色绫绢裱边，最经典的装裱方式
.mount-ling-biao {
  .card-container { margin: 6px; }
  .mount-mat {
    padding: 32px 22px;
    background: linear-gradient(180deg,
      #8b7355 0%, #9b8365 2%, #8b7355 4%,
      #7a6548 50%,
      #8b7355 96%, #9b8365 98%, #8b7355 100%
    );
    background-size: 100% 100%, 4px 4px;
    border-radius: 1px;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.15),
      inset 0 0 0 1px rgba(255, 255, 255, 0.06);
    position: relative;

    // 绫绢织物纹理
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: repeating-linear-gradient(
        0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px
      ), repeating-linear-gradient(
        90deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px
      );
      pointer-events: none;
    }
  }
}

// 宣和装：宋徽宗御制，隔水+惊燕带
.mount-xuan-he {
  .card-container { margin: 8px; }
  .mount-mat {
    // 天头（上）比地脚（下）高，符合传统比例约 3:2
    padding: 56px 28px 42px;
    overflow: hidden;
    position: relative;
    background: #f0e8d5;
    border-radius: 1px;
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.15),
      inset 0 0 0 1px rgba(0, 0, 0, 0.08);

    // 天头（天青色）
    &::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 56px;
      background: linear-gradient(180deg,
        #6b8e9b 0%, #6b8e9b 70%,
        #c8bfa0 72%, #c8bfa0 82%,
        #a09070 84%, #a09070 90%,
        #d4c5a0 92%, #d4c5a0 100%
      );
      pointer-events: none;
    }

    // 地脚（绫绢褐色）
    &::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 42px;
      background: linear-gradient(180deg,
        #d4c5a0 0%, #d4c5a0 8%,
        #a09070 10%, #a09070 18%,
        #c8bfa0 20%, #c8bfa0 28%,
        #8b7355 30%, #8b7355 100%
      );
      pointer-events: none;
    }
  }
}

// 红木框：花梨木纹
.mount-hong-mu {
  .card-container { margin: 4px; }
  .mount-mat {
    padding: 16px;
    background: linear-gradient(135deg,
      #5c2e0e 0%, #7a3d1a 12%, #6b3015 25%,
      #8b4c28 40%, #5c2e0e 55%, #7a3d1a 70%,
      #6b3015 85%, #5c2e0e 100%
    );
    border-radius: 2px;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3),
      inset 1px 0 0 rgba(255, 255, 255, 0.04),
      inset -1px 0 0 rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(60, 25, 8, 0.9);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 3px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      pointer-events: none;
    }
  }
}

// 金漆框：鎏金宫廷风
.mount-jin-qi {
  .card-container { margin: 4px; }
  .mount-mat {
    padding: 16px;
    background: linear-gradient(135deg,
      #b8860b 0%, #daa520 15%, #ffd700 30%,
      #daa520 50%, #b8860b 65%, #cd950c 80%,
      #b8860b 100%
    );
    border-radius: 2px;
    box-shadow:
      0 4px 24px rgba(184, 134, 11, 0.3),
      0 8px 40px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(184, 134, 11, 0.7);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 4px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      pointer-events: none;
    }
  }
}

// 竹框：文人气质
.mount-zhu-kuang {
  .card-container { margin: 4px; }
  .mount-mat {
    padding: 14px;
    background: linear-gradient(180deg,
      #c8b87a 0%, #b5a568 15%, #a89555 40%,
      #b5a568 60%, #c8b87a 85%, #b5a568 100%
    );
    border-radius: 3px;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(160, 140, 80, 0.7);
    position: relative;

    &::before, &::after {
      content: '';
      position: absolute;
      left: 3px;
      right: 3px;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.15), transparent);
    }
    &::before { top: 30%; }
    &::after { top: 70%; }
  }
}

// 立轴：天杆地杆
.mount-li-zhou {
  .card-container { margin: 6px; }
  .mount-mat {
    padding: 32px 20px;
    background: linear-gradient(180deg,
      #8b7355 0%, #8b7355 6%,
      #d4c5a0 6.5%, #d4c5a0 8%,
      #f5efe0 8.5%, #ede5d2 50%, #f5efe0 91.5%,
      #d4c5a0 92%, #d4c5a0 93.5%,
      #8b7355 94%, #8b7355 100%
    );
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08), -2px 0 8px rgba(0, 0, 0, 0.08);
    border-left: 1px solid rgba(0, 0, 0, 0.1);
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }
}

.scroll-rod {
  width: calc(100% + 24px);
  height: 18px;
  border-radius: 9px;
  background: linear-gradient(180deg, #8b5e3c 0%, #5c3a1e 40%, #8b5e3c 100%);
  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  position: relative;
  z-index: 2;

  &--top {
    margin-bottom: -4px;
  }

  &--bottom {
    margin-top: -4px;
  }
}

.mount-mat {
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-container {
  display: flex;
  justify-content: center;
  line-height: 0;
}

// ── 控制面板 ──
// ── 书法家选择 ──
.master-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--c-ink-06);
}

.master-chip {
  padding: 3px 8px;
  border: 1px solid var(--c-ink-12);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;

  &:hover {
    border-color: var(--c-ink-25);
    background: var(--c-ink-06);
  }

  &.active {
    border-color: var(--c-vermilion);
    background: rgba(199, 62, 29, 0.08);
    .master-chip-text { color: var(--c-vermilion); }
  }
}

.master-chip-text {
  font-family: $font-calligraphy;
  font-size: 12px;
  color: var(--c-ink-65);
  letter-spacing: 1px;
}

.script-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--c-ink-06);
}

.script-chip {
  padding: 4px 14px;
  border: 1px solid var(--c-ink-12);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    border-color: var(--c-mountain);
    background: rgba(91, 127, 149, 0.1);
    .script-chip-text { color: var(--c-mountain); }
  }
}

.script-chip-text {
  font-family: $font-calligraphy;
  font-size: 12px;
  color: var(--c-ink-45);
  letter-spacing: 1px;
}

.master-hint {
  font-size: 10px;
  color: var(--c-ink-25);
  margin-left: auto;
}

// ── 字体选择列表面板 ──
.font-list-panel {
  margin-top: 8px;
  border: 1px solid var(--c-ink-12);
  border-radius: 4px;
  background: var(--c-paper-card);
  overflow: hidden;
}

.font-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--c-ink-06);
}

.font-list-title {
  font-family: $font-calligraphy;
  font-size: 14px;
  color: var(--c-ink);
  letter-spacing: 2px;
}

.font-list-close {
  font-size: 18px;
  color: var(--c-ink-45);
  cursor: pointer;
  padding: 0 4px;
  &:hover { color: var(--c-vermilion); }
}

.font-list-scroll {
  max-height: 320px;
}

.font-group {
  &:not(:last-child) {
    border-bottom: 1px solid var(--c-ink-06);
  }
}

.font-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--c-ink-06);
}

.font-group-label {
  font-family: $font-calligraphy;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-mountain);
  letter-spacing: 2px;
}

.font-group-empty {
  font-size: 10px;
  color: var(--c-ink-25);
  font-style: italic;
}

.font-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;

  &:hover {
    background: var(--c-ink-06);
  }

  &.active {
    background: rgba(199, 62, 29, 0.06);
    .font-item-name { color: var(--c-vermilion); }
  }
}

.font-item-name {
  font-size: 15px;
  color: var(--c-ink);
  min-width: 80px;
  flex-shrink: 0;
}

.font-item-desc {
  font-size: 11px;
  color: var(--c-ink-45);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-item-check {
  font-size: 14px;
  color: var(--c-vermilion);
  flex-shrink: 0;
}

.paper-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.paper-swatch {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--c-ink-12);
  flex-shrink: 0;
}

.paper-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.font-group-desc {
  font-size: 11px;
  color: var(--c-ink-45);
  margin-left: 6px;
}

// ── 纹理选择 ──
.texture-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.texture-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--c-ink-12);
  flex-shrink: 0;
  background: var(--c-paper-base, #f5f0e8);
  position: relative;
  overflow: hidden;

  &--su-mian { /* 纯净 */ }
  &--lian-wen {
    background-image: repeating-linear-gradient(
      0deg, transparent, transparent 2px, var(--c-ink-08) 2px, var(--c-ink-08) 3px
    );
  }
  &--luo-wen {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M0 8 Q8 4 16 8 T32 8' fill='none' stroke='%238b7355' stroke-width='0.5' opacity='0.15'/%3E%3Cpath d='M0 16 Q8 12 16 16 T32 16' fill='none' stroke='%238b7355' stroke-width='0.5' opacity='0.15'/%3E%3Cpath d='M0 24 Q8 20 16 24 T32 24' fill='none' stroke='%238b7355' stroke-width='0.5' opacity='0.15'/%3E%3C/svg%3E");
  }
  &--mian-xian-wei {
    background-image: radial-gradient(circle, var(--c-ink-08) 1px, transparent 1px);
    background-size: 5px 5px;
  }
  &--ma-xian-wei {
    background-image: repeating-linear-gradient(
      35deg, transparent, transparent 2px, var(--c-ink-12) 2px, var(--c-ink-12) 3px
    );
  }
  &--yun-mu-jian {
    background-image: radial-gradient(circle, rgba(200, 180, 120, 0.4) 1px, transparent 1px);
    background-size: 6px 6px;
  }
  &--bing-lie-wen {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M8 0 L12 10 L6 20 L16 32' fill='none' stroke='%238b7355' stroke-width='0.5' opacity='0.2'/%3E%3Cpath d='M20 0 L24 8 L18 18 L28 32' fill='none' stroke='%238b7355' stroke-width='0.5' opacity='0.2'/%3E%3Cpath d='M12 10 L24 8' fill='none' stroke='%238b7355' stroke-width='0.4' opacity='0.15'/%3E%3C/svg%3E");
  }
  &--shui-bo-wen {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M0 10 Q8 6 16 10 T32 10' fill='none' stroke='%238b7355' stroke-width='0.5' opacity='0.15'/%3E%3Cpath d='M0 20 Q8 16 16 20 T32 20' fill='none' stroke='%238b7355' stroke-width='0.5' opacity='0.15'/%3E%3C/svg%3E");
  }
}

.texture-origin {
  font-size: 10px;
  color: var(--c-ink-25);
  font-style: italic;
}

.texture-intensity-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px 6px;
  border-top: 1px solid var(--c-ink-06);
  margin-top: 6px;
}

.texture-intensity-label {
  font-size: 12px;
  color: var(--c-ink-45);
  flex-shrink: 0;
}

.texture-intensity-value {
  font-size: 12px;
  color: var(--c-ink-65);
  flex-shrink: 0;
  min-width: 36px;
  text-align: right;
}

.texture-slider {
  flex: 1;
  margin: 0;
}

.control-panel {
  width: 100%;
  padding: 12px;
  background-color: $color-paper;
  background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, var(--c-ink-06) 3px, var(--c-ink-06) 4px);
  border: 1px solid var(--c-border);
  border-top: 3px solid color-mix(in srgb, var(--c-vermilion) 30%, transparent);
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.selector {
  flex: 1;
  min-width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  background: linear-gradient(180deg, var(--c-paper-card) 0%, $color-paper 100%);
  border: 1px solid var(--c-ink-12);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;

  @media (hover: hover) {
    &:hover {
      border-color: var(--c-ink-25);
      background: radial-gradient(ellipse at center, var(--c-ink-06) 0%, transparent 70%), linear-gradient(180deg, var(--c-paper-card) 0%, $color-paper 100%);
      box-shadow: inset 0 0 12px var(--c-ink-06);
    }
  }

  &:active {
    opacity: 0.88;
  }

  &--slider {
    cursor: default;

    @media (hover: hover) {
      &:hover {
        border-color: var(--c-ink-12);
        background: linear-gradient(180deg, var(--c-paper-card) 0%, $color-paper 100%);
        box-shadow: none;
      }
    }

    &:active {
      opacity: 1;
    }
  }
}

.selector-label {
  font-family: $font-calligraphy;
  font-size: 18px;
  color: $color-vermilion;
  line-height: 1;
}

.selector-name {
  font-size: 10px;
  color: var(--c-ink-45);
  letter-spacing: 0.5px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.control-row--offset {
  display: flex;
  gap: 8px;
  .selector--slider {
    flex: 1;
    min-width: 0;
  }
}

.font-scale-slider {
  width: 100%;
  margin: 4px 0 0;
  padding: 0 4px;

  :deep(.uni-slider-handle-wrapper),
  :deep(.wx-slider-handle-wrapper) {
    height: 2px !important;
  }

  :deep(.uni-slider-track),
  :deep(.wx-slider-track) {
    height: 2px !important;
    background-color: var(--c-ink-08) !important;
    border-radius: 0 !important;
  }

  :deep(.uni-slider-thumb),
  :deep(.wx-slider-thumb),
  :deep(.uni-slider-handle),
  :deep(.wx-slider-handle) {
    width: 10px !important;
    height: 10px !important;
    margin-top: -4px !important;
    border-radius: 0 !important;
    background-color: $color-vermilion !important;
    border: 1px solid color-mix(in srgb, var(--c-vermilion) 60%, transparent) !important;
    box-shadow: 0 1px 3px color-mix(in srgb, var(--c-vermilion) 25%, transparent) !important;
  }
}

// ── 印章区折叠面板 ──
.stamp-panel {
  background: linear-gradient(180deg, var(--c-paper-card) 0%, $color-paper 100%);
  border: 1px solid var(--c-ink-12);
  border-radius: 4px;
  overflow: hidden;
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;

  &--open {
    background-color: $color-paper;
    background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, var(--c-ink-06) 3px, var(--c-ink-06) 4px);
    border-color: var(--c-ink-12);
    box-shadow: var(--shadow-sm);
  }
}

.stamp-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px 12px 18px;
  border-left: 4px solid $color-vermilion;
  cursor: pointer;
  transition: background 0.2s;

  @media (hover: hover) {
    &:hover {
      background: var(--c-ink-06);
    }
  }

  &:active {
    opacity: 0.85;
  }
}

.stamp-panel-label {
  font-family: $font-calligraphy;
  font-size: 18px;
  color: $color-ink;
  letter-spacing: 2px;
  opacity: 0.85;
}

.stamp-panel-chevron {
  font-size: 18px;
  color: $color-mountain;
  line-height: 1;
  width: 24px;
  text-align: center;
}

.stamp-panel-body {
  padding: 0 14px 14px;
  animation: inkExpand 0.35s ease both;
}

.stamp-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;

  &:first-child {
    margin-top: 0;
  }
}

.stamp-field-label {
  flex-shrink: 0;
  font-size: 12px;
  color: $color-mountain;
  letter-spacing: 1px;
  width: 56px;
}

.stamp-input {
  flex: 1;
  height: 36px;
  padding: 0 4px 4px;
  font-family: $font-calligraphy;
  font-size: 18px;
  color: $color-ink;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--c-ink-25);
  border-radius: 0;
  letter-spacing: 4px;
  text-align: center;
  transition: border-color 0.2s;

  &:focus {
    border-bottom-color: color-mix(in srgb, var(--c-vermilion) 45%, transparent);
    outline: none;
  }
}

.stamp-position-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-width: 120px;
}

.stamp-pos-cell {
  aspect-ratio: 1;
  min-height: 32px;
  background: transparent;
  border: 1px solid var(--c-ink-25);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s, background 0.2s;

  @media (hover: hover) {
    &:hover {
      border-color: var(--c-ink-45);
      background: var(--c-ink-06);
    }
  }

  &--active {
    border-color: $color-vermilion;
    background: color-mix(in srgb, var(--c-vermilion) 8%, transparent);
    box-shadow: none;
  }
}

.stamp-pos-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $color-vermilion;
  opacity: 0.75;

  &--top-left {
    top: 6px;
    left: 6px;
  }

  &--top-right {
    top: 6px;
    right: 6px;
  }

  &--bottom-left {
    bottom: 6px;
    left: 6px;
  }

  &--bottom-right {
    bottom: 6px;
    right: 6px;
  }
}

// 印章字体选择
.stamp-font-selector {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: color-mix(in srgb, var(--c-paper) 80%, transparent);
  border: 1px solid var(--c-ink-08);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: color-mix(in srgb, var(--c-vermilion) 30%, transparent);
    background: var(--c-paper-card);
  }
}

.stamp-font-preview {
  font-size: 16px;
  color: $color-vermilion;
  line-height: 1;
}

.stamp-font-name {
  flex: 1;
  font-size: 11px;
  color: $color-mountain;
}

.stamp-font-arrow {
  font-size: 14px;
  color: var(--c-ink-25);
}

// 印章位置
.stamp-pos-actions {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stamp-pos-free {
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--c-ink-06);
  border: 1px solid var(--c-divider);
  transition: all 0.2s ease;

  &.active {
    background: color-mix(in srgb, var(--c-vermilion) 6%, transparent);
    border-color: color-mix(in srgb, var(--c-vermilion) 20%, transparent);
  }
}

.stamp-pos-free-text {
  font-size: 10px;
  color: $color-mountain;
  white-space: nowrap;
}

.stamp-size-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stamp-size-value {
  font-size: 12px;
  color: var(--c-ink-65);
  min-width: 24px;
  text-align: right;
  flex-shrink: 0;
}

.stamp-size-slider {
  flex: 1;
  margin: 0;
}

// 卡片印章点击模式
.card-container.stamp-mode {
  cursor: crosshair !important;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px dashed color-mix(in srgb, var(--c-vermilion) 30%, transparent);
    border-radius: 4px;
    pointer-events: none;
    animation: stampBorder 1.5s ease-in-out infinite;
  }
}

@keyframes stampBorder {
  0%, 100% { border-color: color-mix(in srgb, var(--c-vermilion) 15%, transparent); }
  50% { border-color: color-mix(in srgb, var(--c-vermilion) 40%, transparent); }
}

.card-hint {
  display: block;
  text-align: center;
  font-size: 11px;
  color: $color-vermilion;
  opacity: 0.7;
  margin-top: 8px;
  letter-spacing: 1px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 0.7; }
}

// ── 右栏：诗词区 ──
.poem-section {
  flex: 1;
  padding: 8px 4px;
}

// ── 用户输入卡片 ──
.user-input-card {
  margin-bottom: 24px;
  padding: 16px 20px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--c-mountain) 4%, transparent) 0%, transparent 100%);
  border: 1px solid color-mix(in srgb, var(--c-mountain) 12%, transparent);
  border-left: 3px solid color-mix(in srgb, var(--c-mountain) 40%, transparent);
  border-radius: 4px;
}

.input-card-header {
  margin-bottom: 10px;
}

.input-card-label {
  font-family: $font-calligraphy;
  font-size: 14px;
  color: $color-mountain;
  letter-spacing: 2px;
}

.input-card-prompt {
  display: block;
  font-size: 15px;
  color: $color-ink;
  line-height: 1.8;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.input-card-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.input-card-tag {
  font-family: $font-calligraphy;
  font-size: 12px;
  color: $color-mountain;
  padding: 2px 10px;
  border: 1px solid color-mix(in srgb, var(--c-mountain) 20%, transparent);
  border-radius: 2px;
  letter-spacing: 1px;
}

.input-card-images {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.input-card-img {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  border: 1px solid var(--c-ink-08);
  object-fit: cover;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: color-mix(in srgb, var(--c-mountain) 30%, transparent);
  }
}

.poem-header {
  text-align: center;
  margin-bottom: 24px;
}

.poem-title {
  font-family: $font-calligraphy;
  font-size: 36px;
  color: $color-ink;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  letter-spacing: 4px;
  line-height: 1.4;

  &::before,
  &::after {
    content: '';
    flex: 1;
    max-width: 72px;
    height: 1px;
  }
  &::before { background: linear-gradient(90deg, transparent, var(--c-ink-25)); }
  &::after { background: linear-gradient(90deg, var(--c-ink-25), transparent); }

  @media (min-width: $breakpoint) {
    font-size: 42px;
    &::before, &::after { max-width: 96px; }
  }
}

.poem-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.poem-genre,
.poem-rhyme {
  font-size: 13px;
  color: $color-mountain;
  letter-spacing: 2px;
}

.poem-rhyme::before {
  content: '·';
  margin-right: 12px;
  color: color-mix(in srgb, var(--c-mountain) 40%, transparent);
}

.poem-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 0;

  &--vertical {
    flex-direction: row-reverse;
    justify-content: center;
    align-items: flex-start;
    gap: 16px;
    min-height: 200px;

    .poem-line {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      letter-spacing: 6px;
      line-height: 1.8;
      font-size: 20px;
    }

    .poem-dot {
      width: 4px;
      height: 4px;
      margin: 0;
      align-self: center;
    }
  }
}

.poem-line {
  font-family: $font-calligraphy;
  font-size: 22px;
  color: $color-ink;
  line-height: 2;
  letter-spacing: 1px;
  text-align: center;
}

.poem-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: $color-ink;
  opacity: 0.18;
  margin: 4px 0;
  flex-shrink: 0;
}

// 译文 / 赏析折叠卡片
.ink-card {
  background: linear-gradient(180deg, var(--c-paper-card) 0%, color-mix(in srgb, var(--c-paper) 60%, transparent) 100%);
  border: 1px solid var(--c-border);
  border-radius: 4px;
  padding: 14px 16px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;

  &--open {
    background-color: $color-paper;
    border-color: var(--c-ink-12);
    border-top: 2px solid color-mix(in srgb, var(--c-vermilion) 35%, transparent);
    box-shadow: var(--shadow-sm);
  }

  @media (hover: hover) {
    &:hover {
      border-color: var(--c-ink-15);
      background: $color-paper;
    }
  }

  &:active {
    opacity: 0.85;
  }
}

.ink-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ink-card-label {
  font-size: 14px;
  color: $color-ink;
  letter-spacing: 2px;
  font-weight: 500;
}

.ink-card-chevron {
  font-size: 18px;
  color: $color-mountain;
  line-height: 1;
  width: 24px;
  text-align: center;
}

.ink-card-body {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--c-ink-08);
  animation: inkExpand 0.35s ease both;
}

@keyframes inkExpand {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ink-card-text {
  font-size: 14px;
  color: var(--c-ink-75);
  line-height: 1.9;
  letter-spacing: 0.5px;
  display: block;
}

// ── 操作按钮 ──
.actions-bar {
  display: flex;
  gap: 0;
  padding-top: 16px;
  margin-top: auto;
  flex-shrink: 0;
  border: 1px solid var(--c-ink-12);
  border-radius: 4px;
  overflow: hidden;
  background: $color-paper;

  @media (max-width: #{$breakpoint - 1px}) {
    position: sticky;
    bottom: 0;
    background: color-mix(in srgb, var(--c-paper) 92%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 12px 0;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--c-divider);
  }
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  border-radius: 0;
  border-right: 1px solid var(--c-ink-12);
  background: $color-paper;
  cursor: pointer;
  transition: background 0.3s, opacity 0.15s;

  &:last-child { border-right: none; }

  @media (hover: hover) {
    &:hover {
      background: linear-gradient(180deg, var(--c-ink-06) 0%, var(--c-ink-08) 100%);
      .action-btn-text { color: $color-ink; }
    }
  }

  &:active {
    opacity: 0.85;
    background: var(--c-ink-06);
  }

  &--save .action-btn-text::before { color: $color-vermilion; }
  &--copy .action-btn-text::before { color: $color-mountain; }
  &--share .action-btn-text::before { color: var(--c-gold); }
}

.action-btn-text {
  font-family: $font-calligraphy;
  font-size: 14px;
  letter-spacing: 2px;
  font-weight: 400;
  color: var(--c-ink-75);
  transition: color 0.3s;

  &::before {
    content: '·';
    margin-right: 4px;
    font-size: 16px;
    font-weight: 700;
  }
}

/* ══ 深色模式覆盖 ══ */
:root[data-theme="dark"] {
  .page { background-color: var(--c-paper); }

  .nav-bar {
    background: rgba(26, 26, 34, 0.9);
    border-bottom-color: rgba(232, 228, 223, 0.06);
  }
  .nav-logo { color: var(--c-vermilion); }
  .nav-back { color: var(--c-ink); }

  .panel { background: var(--c-paper); }

  /* 控制面板 */
  .control-panel {
    background-color: var(--c-paper-card) !important;
    background-image: none !important;
    border-color: rgba(232, 228, 223, 0.06);
    border-top-color: rgba(224, 96, 64, 0.3);
  }
  .selector {
    background: var(--c-paper-card) !important;
    border-color: rgba(232, 228, 223, 0.08);
  }
  .selector-label { color: var(--c-vermilion); }
  .selector-name { color: rgba(232, 228, 223, 0.4); }

  /* 落款面板 */
  .colophon-verb-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .colophon-verb-chip {
    padding: 3px 10px;
    border-radius: 4px;
    background: rgba(232, 228, 223, 0.06);
    color: var(--c-ink-60, rgba(232, 228, 223, 0.6));
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid transparent;
  }
  .colophon-verb-chip--active {
    background: rgba(204, 51, 51, 0.12);
    color: var(--c-vermilion);
    border-color: rgba(204, 51, 51, 0.3);
  }
  .colophon-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .colophon-toggle-track {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: rgba(232, 228, 223, 0.1);
    position: relative;
    transition: background 0.2s;
  }
  .colophon-toggle-track.active {
    background: rgba(204, 51, 51, 0.3);
  }
  .colophon-toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(232, 228, 223, 0.6);
    transition: transform 0.2s;
  }
  .colophon-toggle-track.active .colophon-toggle-thumb {
    transform: translateX(16px);
    background: var(--c-vermilion);
  }
  .colophon-toggle-text {
    font-size: 12px;
    color: var(--c-ink-60, rgba(232, 228, 223, 0.6));
  }
  .colophon-preview {
    margin-top: 8px;
    padding: 8px 12px;
    background: rgba(232, 228, 223, 0.04);
    border-radius: 6px;
    border: 1px solid rgba(232, 228, 223, 0.06);
  }
  .colophon-preview-title {
    font-size: 11px;
    color: var(--c-ink-45, rgba(232, 228, 223, 0.45));
    margin-bottom: 6px;
    display: block;
  }
  .colophon-preview-text {
    display: flex;
    gap: 12px;
  }
  .colophon-preview-line {
    writing-mode: vertical-rl;
    font-size: 13px;
    color: var(--c-ink-80, rgba(232, 228, 223, 0.8));
    font-family: 'STKaiti', 'KaiTi', serif;
    letter-spacing: 2px;
  }

  /* 印章面板 */
  .stamp-panel {
    background: var(--c-paper-card) !important;
    border-color: rgba(232, 228, 223, 0.08);
  }
  .stamp-panel-header { border-left-color: var(--c-vermilion); }
  .stamp-input {
    color: var(--c-ink);
    border-bottom-color: rgba(232, 228, 223, 0.15);
  }
  .stamp-pos-cell { border-color: rgba(232, 228, 223, 0.15); }

  /* 操作按钮 */
  .actions-bar {
    background: var(--c-paper-card);
    border-color: rgba(232, 228, 223, 0.08);
  }
  .action-btn {
    background: var(--c-paper-card);
    border-right-color: rgba(232, 228, 223, 0.06);
  }

  /* 折叠卡片 */
  .ink-card {
    background: var(--c-paper-card) !important;
    border-color: rgba(232, 228, 223, 0.06);
  }

  /* 诗词区 */
  .poem-title { color: var(--c-ink); }
  .poem-line { color: rgba(232, 228, 223, 0.75); }
  .poem-genre { color: var(--c-mountain); border-color: rgba(122, 168, 194, 0.2); }

  /* 用户输入卡 */
  .user-input-card {
    background: rgba(122, 168, 194, 0.06);
    border-color: rgba(122, 168, 194, 0.12);
  }
  .input-card-prompt { color: var(--c-ink); }

  /* 装裱 */
  .mount-white-mat .mount-mat { background: #2a2a3a; }
  .mount-wood .mount-mat,
  .mount-gold .mount-mat { border-color: rgba(232, 228, 223, 0.15); }
}
</style>
