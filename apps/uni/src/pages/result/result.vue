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
        <!-- 预览控制栏（顶部） -->
        <view class="preview-toolbar">
          <view class="preview-3d-bar">
            <view
              class="preview-3d-chip"
              :class="{ active: preview3DMode === 'flat' }"
              @tap="switchToFlat()"
            ><text>平面</text></view>
            <view
              class="preview-3d-chip"
              :class="{ active: preview3DMode === 'tilt' }"
              @tap="switchToTilt()"
            ><text>微倾</text></view>
            <view
              class="preview-3d-chip"
              :class="{ active: preview3DMode === '3d' }"
              @tap="switchTo3DFrame()"
            ><text>3D</text></view>
            <view
              class="preview-3d-chip"
              :class="{ active: preview3DMode === 'scene' }"
              @tap="switchTo3DScene()"
            ><text>场景</text></view>
          </view>
          <view class="preview-zoom-bar">
            <text class="preview-zoom-label">大小</text>
            <text class="preview-zoom-value">{{ previewScale }}%</text>
            <slider
              class="ink-slider"
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
        <view class="card-section">
          <template v-if="preview3DMode === 'flat' || preview3DMode === 'tilt'">
            <!-- 2D 预览（平面 / 微倾） -->
            <div
              class="tilt-wrapper"
              :class="{ 'tilt-active': enable3DTilt }"
              ref="tiltWrapperRef"
            >
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
                  <view v-if="fontLoading" class="font-loading-hint">字体加载中…</view>
                </view>
                <view v-if="currentMount === 'li-zhou'" class="scroll-rod scroll-rod--bottom" />
              </view>
              <div v-if="enable3DTilt" class="tilt-glare" :style="tiltGlareStyle" />
            </div>
          </template>

          <!-- 3D 画框预览（聚焦画框立体效果） -->
          <div v-if="preview3DMode === '3d'" class="frame3d-wrap" @wheel.stop>
            <div class="scene3d-container" ref="frame3dRef" />
            <div class="frame3d-toolbar">
              <div class="grid-toggle" :class="{ active: show3DGrid }" @click.stop="toggle3DGrid()">
                {{ show3DGrid ? '隐藏网格' : '显示网格' }}
              </div>
              <div
                class="grid-toggle"
                :class="{ recording: isRecording3D }"
                @click.stop="toggle3DRecord()"
              >
                {{ isRecording3D ? '⏹ 停止' : '⏺ 录制' }}
              </div>
              <div class="grid-toggle" @click.stop="showRecordSettings = !showRecordSettings">
                ⚙
              </div>
              <div class="grid-toggle" @click.stop="toggle3DFullscreen()">
                {{ is3DFullscreen ? '✕ 退出' : '⛶ 全屏' }}
              </div>
            </div>
            <div v-if="isRecording3D" class="recording-indicator">
              <text class="rec-dot">●</text>
              <text class="rec-text">REC {{ recordSeconds }}s</text>
            </div>
            <!-- 录制设置面板 -->
            <div v-if="showRecordSettings && !isRecording3D" class="record-settings" @click.stop>
              <div class="rec-row">
                <text class="rec-label">格式</text>
                <div class="rec-options">
                  <div v-for="f in availableFormats" :key="f.key"
                    class="rec-option" :class="{ active: recordFormat === f.key }"
                    @click="recordFormat = f.key">{{ f.label }}</div>
                </div>
              </div>
              <div class="rec-row">
                <text class="rec-label">帧率</text>
                <div class="rec-options">
                  <div v-for="fps in [24, 30, 60]" :key="fps"
                    class="rec-option" :class="{ active: recordFPS === fps }"
                    @click="recordFPS = fps">{{ fps }}</div>
                </div>
              </div>
              <div class="rec-row">
                <text class="rec-label">清晰度</text>
                <div class="rec-options">
                  <div v-for="r in resolutionOptions" :key="r.key"
                    class="rec-option" :class="{ active: recordResolution === r.key }"
                    @click="recordResolution = r.key">{{ r.label }}</div>
                </div>
              </div>
              <div class="rec-row">
                <text class="rec-label">码率</text>
                <div class="rec-options">
                  <div v-for="q in qualityOptions" :key="q.key"
                    class="rec-option" :class="{ active: recordQuality === q.key }"
                    @click="recordQuality = q.key">{{ q.label }}</div>
                </div>
              </div>
              <div class="rec-row">
                <text class="rec-label">旋转</text>
                <div class="rec-options">
                  <div class="rec-option" :class="{ active: recordAutoRotate }" @click="recordAutoRotate = true">自动环绕</div>
                  <div class="rec-option" :class="{ active: !recordAutoRotate }" @click="recordAutoRotate = false">手动控制</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 场景模拟 -->
          <div v-if="preview3DMode === 'scene'" class="frame3d-wrap" @wheel.stop>
            <div class="scene3d-container" ref="scene3dRef" />
            <div class="scene-selector">
              <div v-for="s in SCENE_LIST" :key="s.key"
                class="scene-chip" :class="{ active: currentSceneKey === s.key }"
                @click.stop="switchScene(s.key)">
                <text class="scene-chip-icon">{{ s.icon }}</text>
                <text class="scene-chip-label">{{ s.label }}</text>
              </div>
            </div>
          </div>
        </view>
      </view>

      <!-- 拖拽分割线 1 -->
      <div class="panel-divider" ref="divider0Ref"></div>

      <!-- 中栏：控制面板 -->
      <view class="panel panel-center" :style="panelCenterStyle">
        <view class="control-panel">
            <!-- 标题区 -->
            <view class="panel-title-bar">
              <text class="panel-title-text">{{ poem.title }}</text>
              <text class="panel-title-sub">书法定制</text>
            </view>

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
              <view class="selector" @tap="togglePanel('font')">
                <text class="selector-label">字</text>
                <text class="selector-name">{{ currentFontLabel }}</text>
              </view>
              <view class="selector" @tap="togglePanel('paper')">
                <text class="selector-label">纸</text>
                <text class="selector-name">{{ currentBgLabel }}</text>
              </view>
              <view class="selector" @tap="togglePanel('format')">
                <text class="selector-label">式</text>
                <text class="selector-name">{{ currentTmplLabel }}</text>
              </view>
            </view>
            <!-- 式面板：模板选择 + 自定义尺寸 + 间距 -->
            <view v-if="showFormatPanel" class="font-list-panel">
              <view class="font-list-header">
                <text class="font-list-title">版式设定</text>
                <text class="font-list-close" @tap="showFormatPanel = false">×</text>
              </view>
              <scroll-view scroll-y class="font-list-scroll">
                <!-- 预设模板 -->
                <view class="font-group">
                  <view class="font-group-header"><text class="font-group-label">预设版式</text></view>
                  <view v-for="(info, key) in CARD_TEMPLATES" :key="key" class="font-item texture-item" :class="{ active: currentTmpl === key }" @tap="selectTemplate(key as CardTemplate)">
                    <view class="paper-info">
                      <text class="font-item-name">{{ info.label }}</text>
                      <text class="font-item-desc">{{ info.width }}×{{ info.height }} · {{ info.description }}</text>
                    </view>
                    <text v-if="currentTmpl === key" class="font-item-check">✓</text>
                  </view>
                </view>
                <!-- 自定义尺寸 -->
                <view class="font-group">
                  <view class="font-group-header"><text class="font-group-label">自定义尺寸</text><text class="font-group-desc">拖动调节，0 为使用预设</text></view>
                  <view class="format-slider-row">
                    <text class="format-slider-label">宽</text>
                    <input class="format-slider-input" type="number" :value="String(customWidth || currentTmplW)" @blur="(e: any) => { const n = parseInt(e.detail.value, 10); customWidth = (n >= 200 && n <= 4000) ? n : 0; renderCard() }" />
                    <slider class="ink-slider" :value="customWidth || currentTmplW" :min="300" :max="3000" :step="10" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="(e: any) => { customWidth = e.detail.value; renderCard() }" @change="(e: any) => { customWidth = e.detail.value; renderCard() }" />
                  </view>
                  <view class="format-slider-row">
                    <text class="format-slider-label">高</text>
                    <input class="format-slider-input" type="number" :value="String(customHeight || currentTmplH)" @blur="(e: any) => { const n = parseInt(e.detail.value, 10); customHeight = (n >= 200 && n <= 4000) ? n : 0; renderCard() }" />
                    <slider class="ink-slider" :value="customHeight || currentTmplH" :min="300" :max="3000" :step="10" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="(e: any) => { customHeight = e.detail.value; renderCard() }" @change="(e: any) => { customHeight = e.detail.value; renderCard() }" />
                  </view>
                  <view class="format-reset-row">
                    <text class="format-reset-btn" @tap="customWidth = 0; customHeight = 0; renderCard()">重置为预设尺寸</text>
                  </view>
                </view>
                <!-- 间距调节 -->
                <view class="font-group">
                  <view class="font-group-header"><text class="font-group-label">间距调节</text></view>
                  <view class="format-slider-row">
                    <text class="format-slider-label">列距</text>
                    <text class="format-slider-value">{{ Math.round(colSpacingScale * 100) }}%</text>
                    <slider class="ink-slider" :value="colSpacingScale * 100" :min="50" :max="200" :step="5" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="(e: any) => { colSpacingScale = e.detail.value / 100; renderCard() }" @change="(e: any) => { colSpacingScale = e.detail.value / 100; renderCard() }" />
                  </view>
                  <view class="format-slider-row">
                    <text class="format-slider-label">字距</text>
                    <text class="format-slider-value">{{ Math.round(charSpacingScale * 100) }}%</text>
                    <slider class="ink-slider" :value="charSpacingScale * 100" :min="50" :max="200" :step="5" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="(e: any) => { charSpacingScale = e.detail.value / 100; renderCard() }" @change="(e: any) => { charSpacingScale = e.detail.value / 100; renderCard() }" />
                  </view>
                </view>
              </scroll-view>
            </view>
            <!-- 字体面板紧跟字/纸/式行 -->
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
            <!-- 纸张面板 -->
            <view v-if="showPaperPanel" class="font-list-panel">
              <view class="font-list-header"><text class="font-list-title">选择纸张</text><text class="font-list-close" @tap="showPaperPanel = false">×</text></view>
              <scroll-view scroll-y class="font-list-scroll">
                <view v-for="group in paperGroups" :key="group.category" class="font-group">
                  <view class="font-group-header"><text class="font-group-label">{{ group.label }}</text><text class="font-group-desc">{{ group.description }}</text></view>
                  <view v-for="p in group.papers" :key="p.key" class="font-item paper-item" :class="{ active: currentBg === p.key }" @tap="selectPaper(p.key)">
                    <view v-if="p.key === 'custom-photo' && bgImagePreview" class="paper-swatch" :style="{ backgroundImage: `url(${bgImagePreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }" />
                    <view v-else class="paper-swatch" :style="{ background: `linear-gradient(135deg, ${p.baseColors[0]}, ${p.baseColors[1]})` }" />
                    <view class="paper-info"><text class="font-item-name">{{ p.label }}</text><text class="font-item-desc">{{ p.key === 'custom-photo' ? (bgImagePreview ? '已选择 · 点击更换' : '点击上传照片') : p.description }}</text></view>
                    <text v-if="currentBg === p.key" class="font-item-check">✓</text>
                  </view>
                </view>
              </scroll-view>
            </view>

            <view class="control-row">
              <view class="selector" @tap="togglePanel('mount')">
                <text class="selector-label">裱</text>
                <text class="selector-name">{{ currentMountLabel }}</text>
              </view>
              <view class="selector" @tap="togglePanel('border')">
                <text class="selector-label">线</text>
                <text class="selector-name">{{ currentBorderLabel }}</text>
              </view>
              <view class="selector" @tap="togglePanel('texture')">
                <text class="selector-label">纹</text>
                <text class="selector-name">{{ currentTextureLabel }}</text>
              </view>
            </view>
            <!-- 装裱面板 -->
            <view v-if="showMountPanel" class="font-list-panel">
              <view class="font-list-header"><text class="font-list-title">选择装裱</text><text class="font-list-close" @tap="showMountPanel = false">×</text></view>
              <scroll-view scroll-y class="font-list-scroll">
                <view v-for="(info, key) in MOUNT_STYLES" :key="key" class="font-item texture-item" :class="{ active: currentMount === key }" @tap="selectMount(key as MountStyle)">
                  <view class="paper-info"><text class="font-item-name">{{ info.label }}</text><text class="font-item-desc">{{ info.description }}</text><text class="texture-origin">{{ info.origin }}</text></view>
                  <text v-if="currentMount === key" class="font-item-check">✓</text>
                </view>
              </scroll-view>
            </view>
            <!-- 边框面板 -->
            <view v-if="showBorderPanel" class="font-list-panel">
              <view class="font-list-header"><text class="font-list-title">选择边框纹饰</text><text class="font-list-close" @tap="showBorderPanel = false">×</text></view>
              <scroll-view scroll-y class="font-list-scroll">
                <view v-for="(info, key) in BORDER_STYLES" :key="key" class="font-item texture-item" :class="{ active: currentBorder === key }" @tap="selectBorder(key as BorderStyle)">
                  <view class="paper-info"><text class="font-item-name">{{ info.label }}</text><text class="font-item-desc">{{ info.description }}</text><text class="texture-origin">{{ info.origin }}</text></view>
                  <text v-if="currentBorder === key" class="font-item-check">✓</text>
                </view>
              </scroll-view>
            </view>
            <!-- 纹理面板 -->
            <view v-if="showTexturePanel" class="font-list-panel">
              <view class="font-list-header"><text class="font-list-title">选择纹理</text><text class="font-list-close" @tap="showTexturePanel = false">×</text></view>
              <view v-if="currentTextureType !== 'su-mian'" class="texture-intensity-row">
                <text class="texture-intensity-label">浓淡</text><text class="texture-intensity-value">{{ textureStrength }}%</text>
                <slider class="ink-slider" :value="textureStrength" :min="10" :max="500" :step="10" activeColor="#5b7f95" backgroundColor="rgba(26, 26, 46, 0.1)" block-size="14" @changing="(e: any) => textureStrength = e.detail.value" @change="(e: any) => textureStrength = e.detail.value" />
              </view>
              <scroll-view scroll-y class="font-list-scroll">
                <view v-for="key in textureTypeKeys" :key="key" class="font-item texture-item" :class="{ active: currentTextureType === key }" @tap="selectTexture(key)">
                  <view class="texture-icon" :class="`texture-icon--${key}`" />
                  <view class="paper-info"><text class="font-item-name">{{ TEXTURE_TYPES[key].label }}</text><text class="font-item-desc">{{ TEXTURE_TYPES[key].description }}</text><text class="texture-origin">{{ TEXTURE_TYPES[key].origin }}</text></view>
                  <text v-if="currentTextureType === key" class="font-item-check">✓</text>
                </view>
              </scroll-view>
            </view>

            <view class="ink-field ink-field--slider">
              <text class="ink-field-label">字号</text>
              <text class="ink-field-value">{{ fontScale }}%</text>
              <slider class="ink-slider" :value="fontScale" :min="60" :max="160" :step="10" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="onFontScaleChanging" @change="onFontScaleChange" />
            </view>
            <view class="ink-field ink-field--slider">
              <text class="ink-field-label">横移</text>
              <text class="ink-field-value">{{ offsetX }}</text>
              <slider class="ink-slider" :value="offsetX" :min="-200" :max="200" :step="5" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="(e: any) => offsetX = e.detail.value" @change="(e: any) => offsetX = e.detail.value" />
            </view>
            <view class="ink-field ink-field--slider">
              <text class="ink-field-label">纵移</text>
              <text class="ink-field-value">{{ offsetY }}</text>
              <slider class="ink-slider" :value="offsetY" :min="-200" :max="200" :step="5" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="(e: any) => offsetY = e.detail.value" @change="(e: any) => offsetY = e.detail.value" />
            </view>

            <!-- 落款 · 印章 -->
            <view class="ink-section">
              <view class="ink-section-header" @tap="showColophonPanel = !showColophonPanel">
                <view class="ink-section-title-group">
                  <text class="ink-section-icon">款</text>
                  <text class="ink-section-title">落款</text>
                </view>
                <text class="ink-section-arrow" :class="{ open: showColophonPanel }">‹</text>
              </view>
              <view v-if="showColophonPanel" class="ink-section-body">
                <!-- 书者 -->
                <view class="ink-field">
                  <text class="ink-field-label">书者</text>
                  <input class="ink-field-input" type="text" :value="colophonCalligrapher" maxlength="8" placeholder="墨韵" @input="(e: any) => colophonCalligrapher = e.detail.value || ''" />
                </view>
                <!-- 敬辞 -->
                <view class="ink-field">
                  <text class="ink-field-label">敬辞</text>
                  <view class="ink-seal-row">
                    <text v-for="v in colophonVerbOptions" :key="v" class="ink-seal-chip" :class="{ active: colophonVerb === v }" @tap="colophonVerb = v">{{ v }}</text>
                  </view>
                </view>
                <!-- 干支纪年 -->
                <view class="ink-field">
                  <text class="ink-field-label">纪年</text>
                  <text class="ink-date-toggle" :class="{ active: colophonShowDate }" @tap="colophonShowDate = !colophonShowDate">{{ colophonShowDate ? '干支纪年 · 显' : '不署年月' }}</text>
                </view>
                <!-- 行列 -->
                <view class="ink-field">
                  <text class="ink-field-label">行列</text>
                  <view class="ink-seal-row">
                    <text v-for="opt in colophonLayoutOptions" :key="opt.key" class="ink-seal-chip" :class="{ active: colophonLayout === opt.key }" @tap="colophonLayout = opt.key">{{ opt.label }}</text>
                  </view>
                </view>
                <!-- 微调 -->
                <view class="ink-field ink-field--slider">
                  <text class="ink-field-label">横移</text>
                  <slider class="ink-slider" :value="colophonOffsetX" :min="-200" :max="200" :step="2" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="(e: any) => { colophonOffsetX = e.detail.value; renderCard() }" @change="(e: any) => { colophonOffsetX = e.detail.value; renderCard() }" />
                </view>
                <view class="ink-field ink-field--slider">
                  <text class="ink-field-label">纵移</text>
                  <slider class="ink-slider" :value="colophonOffsetY" :min="-200" :max="200" :step="2" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="(e: any) => { colophonOffsetY = e.detail.value; renderCard() }" @change="(e: any) => { colophonOffsetY = e.detail.value; renderCard() }" />
                </view>
                <!-- 竖排预览 -->
                <view class="ink-preview-card">
                  <view class="ink-preview-cols">
                    <text v-for="(line, i) in colophonPreviewLines" :key="i" class="ink-preview-col">{{ line }}</text>
                  </view>
                </view>
              </view>
            </view>

            <view class="ink-section">
              <view class="ink-section-header" @tap="showStampPanel = !showStampPanel">
                <view class="ink-section-title-group">
                  <text class="ink-section-icon ink-section-icon--seal">印</text>
                  <text class="ink-section-title">钤印</text>
                </view>
                <text class="ink-section-arrow" :class="{ open: showStampPanel }">‹</text>
              </view>
              <view v-if="showStampPanel" class="ink-section-body">
                <view class="ink-field">
                  <text class="ink-field-label">印文</text>
                  <input class="ink-field-input" type="text" :value="stampText" maxlength="4" placeholder="印" @input="onStampTextInput" />
                </view>
                <view class="ink-field">
                  <text class="ink-field-label">印体</text>
                  <view class="ink-stamp-font-sel" @tap="onChangeStampFont">
                    <text class="ink-stamp-font-preview" :style="{ fontFamily: STAMP_FONTS[stampFontKey].family }">{{ stampText }}</text>
                    <text class="ink-stamp-font-name">{{ STAMP_FONTS[stampFontKey].label }} ›</text>
                  </view>
                </view>
                <view class="ink-field">
                  <text class="ink-field-label">钤位</text>
                  <view class="ink-stamp-pos">
                    <view class="ink-pos-grid">
                      <view v-for="pos in stampPosGridOrder" :key="pos" class="ink-pos-cell" :class="{ active: !stampX && stampPosition === pos }" @tap="onResetStampPos(); stampPosition = pos">
                        <view class="ink-pos-mark" :class="`ink-pos-mark--${pos}`" />
                      </view>
                    </view>
                    <text class="ink-pos-hint">{{ stampX !== undefined ? '· 自由定位中' : '点击卡片可定位' }}</text>
                  </view>
                </view>
                <view class="ink-field ink-field--slider">
                  <text class="ink-field-label">印径</text>
                  <slider class="ink-slider" :value="stampSizeVal" :min="30" :max="120" :step="2" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="(e: any) => stampSizeVal = e.detail.value" @change="(e: any) => stampSizeVal = e.detail.value" />
                </view>
                <view class="ink-field">
                  <text class="ink-field-label">印形</text>
                  <view class="stamp-shape-row">
                    <view
                      v-for="(info, key) in STAMP_SHAPES"
                      :key="key"
                      class="stamp-shape-btn"
                      :class="{ active: stampShape === key }"
                      @tap="stampShape = key"
                    >
                      <text class="stamp-shape-label">{{ info.label }}</text>
                    </view>
                  </view>
                </view>
              </view>
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
            <view class="poem-title">{{ poem.title }}</view>
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
          <view class="action-btn action-btn--fav" :class="{ 'is-fav': isFavorited }" @tap="onToggleFavorite">
            <text class="action-btn-icon">{{ isFavorited ? '♥' : '♡' }}</text>
            <text class="action-btn-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
          </view>
          <view class="action-btn action-btn--save" @tap="onSaveImage">
            <text class="action-btn-text">保存高清图</text>
          </view>
          <view class="action-btn action-btn--copy" @tap="onCopyPoem">
            <text class="action-btn-text">复制诗词</text>
          </view>
          <view class="action-btn action-btn--share" @tap="showSharePanel = !showSharePanel">
            <text class="action-btn-text">分享</text>
          </view>
          <view class="action-btn action-btn--print" @tap="showPrintPanel = !showPrintPanel">
            <text class="action-btn-text">印刷导出</text>
          </view>
        </view>

        <!-- 印刷导出设置面板 -->
        <view v-if="showPrintPanel" class="print-panel">
          <view class="print-panel-header">
            <text class="print-panel-title">印刷级导出</text>
            <text class="print-panel-close" @tap="showPrintPanel = false">×</text>
          </view>

          <view class="print-row">
            <text class="print-label">纸张尺寸</text>
            <view class="print-chips">
              <text v-for="s in PRINT_SIZES" :key="s.key" class="print-chip" :class="{ active: printSize === s.key }" @tap="printSize = s.key">{{ s.label }}</text>
            </view>
          </view>

          <view class="print-row">
            <text class="print-label">分辨率</text>
            <view class="print-chips">
              <text v-for="d in PRINT_DPI_OPTIONS" :key="d.dpi" class="print-chip" :class="{ active: printDPI === d.dpi }" @tap="printDPI = d.dpi">{{ d.label }}</text>
            </view>
          </view>

          <view class="print-row">
            <text class="print-label">出血线 (3mm)</text>
            <view class="print-chips">
              <text class="print-chip" :class="{ active: printBleed }" @tap="printBleed = true">添加</text>
              <text class="print-chip" :class="{ active: !printBleed }" @tap="printBleed = false">不添加</text>
            </view>
          </view>

          <view class="print-row">
            <text class="print-label">裁切标记</text>
            <view class="print-chips">
              <text class="print-chip" :class="{ active: printCropMarks }" @tap="printCropMarks = true">显示</text>
              <text class="print-chip" :class="{ active: !printCropMarks }" @tap="printCropMarks = false">隐藏</text>
            </view>
          </view>

          <view class="print-row">
            <text class="print-label">色彩模式</text>
            <view class="print-chips">
              <text class="print-chip" :class="{ active: printColorHint === 'rgb' }" @tap="printColorHint = 'rgb'">RGB</text>
              <text class="print-chip" :class="{ active: printColorHint === 'cmyk-hint' }" @tap="printColorHint = 'cmyk-hint'">CMYK 模拟</text>
            </view>
          </view>

          <view class="print-info">
            <text class="print-info-text">输出尺寸：{{ printOutputInfo.widthPx }} × {{ printOutputInfo.heightPx }} px（{{ printOutputInfo.widthMm }} × {{ printOutputInfo.heightMm }} mm · {{ printDPI }} DPI）</text>
            <text v-if="printBleed" class="print-info-text print-info-bleed">含出血区域：四周各 3mm（{{ printOutputInfo.bleedPx }} px）</text>
          </view>

          <view class="print-actions">
            <view class="print-export-btn" @tap="exportForPrint">
              <text class="print-export-text">导出印刷级 PNG</text>
            </view>
            <view class="print-export-btn print-export-btn--tiff" @tap="exportForPrintTIFF">
              <text class="print-export-text">导出 TIFF（推荐印刷）</text>
            </view>
          </view>
        </view>

        <!-- 分享海报面板 -->
        <view v-if="showSharePanel" class="share-panel">
          <view class="share-panel-header">
            <text class="share-panel-title">分享海报</text>
            <text class="share-panel-close" @tap="showSharePanel = false">×</text>
          </view>

          <!-- 海报模板选择 -->
          <view class="share-row">
            <text class="share-label">海报样式</text>
            <view class="share-chips">
              <text v-for="t in POSTER_TEMPLATES" :key="t.key" class="share-chip" :class="{ active: posterTemplate === t.key }" @tap="posterTemplate = t.key">{{ t.label }}</text>
            </view>
          </view>

          <!-- 灵感图片 -->
          <view class="share-row">
            <text class="share-label">灵感图片</text>
            <view class="poster-images">
              <view v-if="posterImage" class="poster-img-item">
                <image :src="posterImage" class="poster-img-thumb" mode="aspectFill" @tap="previewPosterImage" />
                <text class="poster-img-remove" @tap.stop="removePosterImage">×</text>
              </view>
              <view class="poster-img-add" @tap="pickPosterImage">
                <text class="poster-img-add-icon">+</text>
                <text class="poster-img-add-text">{{ posterImage ? '更换' : '选择' }}</text>
              </view>
            </view>
          </view>

          <template v-if="posterImage">
            <view class="share-row">
              <text class="share-label">图片填充区域</text>
              <view class="share-chips">
                <text v-for="r in IMG_FILL_REGIONS" :key="r.key" class="share-chip" :class="{ active: posterImgRegion === r.key }" @tap="posterImgRegion = r.key; updatePosterPreview()">{{ r.label }}</text>
              </view>
            </view>
            <view class="share-row">
              <text class="share-label">图片不透明度 {{ Math.round(posterImgOpacity * 100) }}%</text>
              <slider class="ink-slider" :value="posterImgOpacity * 100" :min="5" :max="100" :step="5" activeColor="#5b7f95" backgroundColor="rgba(26,26,46,0.1)" block-size="14" @changing="(e: any) => { posterImgOpacity = e.detail.value / 100; updatePosterPreview() }" @change="(e: any) => { posterImgOpacity = e.detail.value / 100; updatePosterPreview() }" />
            </view>
          </template>

          <!-- 海报预览 -->
          <view class="poster-preview-wrap">
            <image v-if="posterPreviewUrl" :src="posterPreviewUrl" class="poster-preview-img" mode="widthFix" />
            <text v-else class="poster-preview-loading">{{ posterGenerating ? '生成中...' : '点击下方按钮生成预览' }}</text>
          </view>

          <!-- 操作按钮 -->
          <view class="share-actions">
            <view class="share-action-btn share-action-btn--poster" @tap="onSavePoster">
              <text class="share-action-text">保存海报</text>
            </view>
            <view class="share-action-btn share-action-btn--direct" @tap="onShare">
              <text class="share-action-text">直接分享</text>
            </view>
          </view>

          <!-- 分享文案 -->
          <view class="share-row">
            <text class="share-label">分享文案</text>
            <view class="share-chips">
              <text v-for="c in COPY_STYLES" :key="c.key" class="share-chip" :class="{ active: copyStyle === c.key }" @tap="copyStyle = c.key">{{ c.label }}</text>
            </view>
          </view>
          <view class="share-copy-box" @tap="onCopyShareText">
            <text class="share-copy-text">{{ shareText }}</text>
            <text class="share-copy-hint">点击复制</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import qrGenerator from 'qrcode-generator'
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
  STAMP_SHAPES,
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
// 宋体
import '@fontsource/noto-serif-sc'
// 趣味 + 手写（扩充）
import '@fontsource/zcool-qingke-huangyou'
import '@fontsource/zcool-kuaile'
import 'cn-fontsource-slidefu-regular/font.css'
import 'cn-fontsource-long-zhu-ti-regular/font.css'
import 'cn-fontsource-yozai-regular/font.css'
import 'cn-fontsource-975-maru-sc-regular/font.css'
import 'cn-fontsource-xiaolai-mono-sc-regular/font.css'

// 自托管字体 woff2（用 ?url 获取 Vite 解析后的 URL）
import ziXiaoHunLiShuUrl from '@/assets/fonts/ZiXiaoHunLiShu.woff2?url'
import shouJinTiUrl from '@/assets/fonts/ShouJinTi.woff2?url'
import xiaoZhuanUrl from '@/assets/fonts/XiaoZhuan.woff2?url'
import maoZeDongUrl from '@/assets/fonts/MaoZeDong.woff2?url'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

/** 自托管字体映射：cssFontFamily → URL */
const SELF_HOSTED_FONTS: Record<string, string> = {
  ZiXiaoHunLiShu: ziXiaoHunLiShuUrl,
  ShouJinTi: shouJinTiUrl,
  XiaoZhuan: xiaoZhuanUrl,
  MaoZeDong: maoZeDongUrl,
}

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
const showFormatPanel = ref(false)
const customWidth = ref(0)
const customHeight = ref(0)
const colSpacingScale = ref(1.0)
const charSpacingScale = ref(1.0)

type PanelName = 'font' | 'paper' | 'format' | 'mount' | 'border' | 'texture'
function togglePanel(name: PanelName) {
  const panels: Record<PanelName, typeof showFontPanel> = {
    font: showFontPanel,
    paper: showPaperPanel,
    format: showFormatPanel,
    mount: showMountPanel,
    border: showBorderPanel,
    texture: showTexturePanel,
  }
  const isOpen = panels[name].value
  // 关闭所有面板
  for (const p of Object.values(panels)) p.value = false
  // 切换目标面板
  if (!isOpen) panels[name].value = true
}

function selectTemplate(key: CardTemplate) {
  currentTmpl.value = key
  customWidth.value = 0
  customHeight.value = 0
  renderCard()
}


function selectFont(key: CalligraphyFont) {
  currentFont.value = key
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

/** 装裱 Canvas 导出配置：padding（CSS px）+ 绘制函数 */
interface MountCanvasCfg {
  padding: [number, number, number, number] // top, right, bottom, left
  margin: number
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  /** 额外装饰（画在装裱外层，如立轴天杆地杆） */
  extra?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  /** 天杆/地杆额外高度 [top, bottom] */
  rodHeight?: [number, number]
}

const MOUNT_CANVAS: Record<MountStyle, MountCanvasCfg> = {
  'none': {
    padding: [0, 0, 0, 0], margin: 0,
    draw() {},
  },
  'jing-pian': {
    padding: [24, 24, 24, 24], margin: 6,
    draw(ctx, w, h) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
    },
  },
  'ling-biao': {
    padding: [32, 22, 32, 22], margin: 6,
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#8b7355'); g.addColorStop(0.02, '#9b8365')
      g.addColorStop(0.04, '#8b7355'); g.addColorStop(0.5, '#7a6548')
      g.addColorStop(0.96, '#8b7355'); g.addColorStop(0.98, '#9b8365')
      g.addColorStop(1, '#8b7355')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      // 织物纹理
      ctx.globalAlpha = 0.03; ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.5
      for (let y = 0; y < h; y += 2) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
      for (let x = 0; x < w; x += 2) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
      ctx.globalAlpha = 1
    },
  },
  'xuan-he': {
    padding: [56, 28, 42, 28], margin: 8,
    draw(ctx, w, h) {
      // 主体淡黄
      ctx.fillStyle = '#f0e8d5'; ctx.fillRect(0, 0, w, h)
      // 天头（天青色 + 隔水）
      const tg = ctx.createLinearGradient(0, 0, 0, 56)
      tg.addColorStop(0, '#6b8e9b'); tg.addColorStop(0.7, '#6b8e9b')
      tg.addColorStop(0.72, '#c8bfa0'); tg.addColorStop(0.82, '#c8bfa0')
      tg.addColorStop(0.84, '#a09070'); tg.addColorStop(0.9, '#a09070')
      tg.addColorStop(0.92, '#d4c5a0'); tg.addColorStop(1, '#d4c5a0')
      ctx.fillStyle = tg; ctx.fillRect(0, 0, w, 56)
      // 地脚（绫绢褐色）
      const bg = ctx.createLinearGradient(0, h - 42, 0, h)
      bg.addColorStop(0, '#d4c5a0'); bg.addColorStop(0.08, '#d4c5a0')
      bg.addColorStop(0.1, '#a09070'); bg.addColorStop(0.18, '#a09070')
      bg.addColorStop(0.2, '#c8bfa0'); bg.addColorStop(0.28, '#c8bfa0')
      bg.addColorStop(0.3, '#8b7355'); bg.addColorStop(1, '#8b7355')
      ctx.fillStyle = bg; ctx.fillRect(0, h - 42, w, 42)
    },
  },
  'hong-mu': {
    padding: [20, 20, 20, 20], margin: 5,
    draw(ctx, w, h) {
      // 主体木纹
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#6b3418'); g.addColorStop(0.08, '#8b4c28')
      g.addColorStop(0.2, '#5c2e0e'); g.addColorStop(0.35, '#7a3d1a')
      g.addColorStop(0.5, '#6b3015'); g.addColorStop(0.65, '#8b4c28')
      g.addColorStop(0.8, '#5c2e0e'); g.addColorStop(0.92, '#7a3d1a')
      g.addColorStop(1, '#6b3418')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      // 上边高光
      ctx.fillStyle = 'rgba(255, 220, 180, 0.12)'
      ctx.fillRect(0, 0, w, 3)
      // 左边高光
      ctx.fillStyle = 'rgba(255, 220, 180, 0.06)'
      ctx.fillRect(0, 0, 3, h)
      // 下边阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
      ctx.fillRect(0, h - 3, w, 3)
      // 右边阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(w - 3, 0, 3, h)
      // 内倒角线
      ctx.strokeStyle = 'rgba(255, 220, 180, 0.08)'; ctx.lineWidth = 1
      ctx.strokeRect(5, 5, w - 10, h - 10)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'; ctx.lineWidth = 1
      ctx.strokeRect(10, 10, w - 20, h - 20)
    },
  },
  'jin-qi': {
    padding: [20, 20, 20, 20], margin: 5,
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#9a7209'); g.addColorStop(0.1, '#c49a1a')
      g.addColorStop(0.22, '#f0d060'); g.addColorStop(0.35, '#ffd700')
      g.addColorStop(0.5, '#e8b820'); g.addColorStop(0.62, '#c49a1a')
      g.addColorStop(0.75, '#daa520'); g.addColorStop(0.88, '#f0d060')
      g.addColorStop(1, '#b8860b')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      // 金属高光
      ctx.fillStyle = 'rgba(255, 245, 200, 0.3)'
      ctx.fillRect(0, 0, w, 3)
      ctx.fillStyle = 'rgba(255, 245, 200, 0.12)'
      ctx.fillRect(0, 0, 3, h)
      ctx.fillStyle = 'rgba(80, 50, 0, 0.25)'
      ctx.fillRect(0, h - 3, w, 3)
      ctx.fillStyle = 'rgba(80, 50, 0, 0.15)'
      ctx.fillRect(w - 3, 0, 3, h)
      // 内倒角
      ctx.strokeStyle = 'rgba(255, 245, 200, 0.2)'; ctx.lineWidth = 1
      ctx.strokeRect(6, 6, w - 12, h - 12)
      ctx.strokeStyle = 'rgba(80, 50, 0, 0.1)'; ctx.lineWidth = 1
      ctx.strokeRect(11, 11, w - 22, h - 22)
    },
  },
  'zhu-kuang': {
    padding: [16, 16, 16, 16], margin: 5,
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#d4c48a'); g.addColorStop(0.1, '#c8b87a')
      g.addColorStop(0.3, '#b5a568'); g.addColorStop(0.5, '#a89555')
      g.addColorStop(0.7, '#b5a568'); g.addColorStop(0.9, '#c8b87a')
      g.addColorStop(1, '#d4c48a')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      // 上高光
      ctx.fillStyle = 'rgba(255, 255, 230, 0.18)'
      ctx.fillRect(0, 0, w, 2)
      ctx.fillStyle = 'rgba(80, 60, 20, 0.15)'
      ctx.fillRect(0, h - 2, w, 2)
      // 竹节
      ctx.globalAlpha = 0.15
      const drawNode = (y: number) => {
        const lg = ctx.createLinearGradient(2, 0, w - 2, 0)
        lg.addColorStop(0, 'transparent'); lg.addColorStop(0.15, 'rgba(80, 60, 20, 0.5)')
        lg.addColorStop(0.5, 'rgba(80, 60, 20, 0.7)'); lg.addColorStop(0.85, 'rgba(80, 60, 20, 0.5)')
        lg.addColorStop(1, 'transparent')
        ctx.strokeStyle = lg; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(2, y); ctx.lineTo(w - 2, y); ctx.stroke()
      }
      drawNode(h * 0.35); drawNode(h * 0.68)
      ctx.globalAlpha = 1
    },
  },
  'li-zhou': {
    padding: [32, 20, 32, 20], margin: 6,
    rodHeight: [18, 18],
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#8b7355'); g.addColorStop(0.06, '#8b7355')
      g.addColorStop(0.065, '#d4c5a0'); g.addColorStop(0.08, '#d4c5a0')
      g.addColorStop(0.085, '#f5efe0'); g.addColorStop(0.5, '#ede5d2')
      g.addColorStop(0.915, '#f5efe0'); g.addColorStop(0.92, '#d4c5a0')
      g.addColorStop(0.935, '#d4c5a0'); g.addColorStop(0.94, '#8b7355')
      g.addColorStop(1, '#8b7355')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    },
    extra(ctx, w, _h) {
      // 天杆
      drawScrollRod(ctx, -12, -14, w + 24, 18)
      // 地杆
      drawScrollRod(ctx, -12, _h - 4, w + 24, 18)
    },
  },
}

/** 绘制天杆/地杆 */
function drawScrollRod(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save()
  const r = h / 2
  const g = ctx.createLinearGradient(0, y, 0, y + h)
  g.addColorStop(0, '#8b5e3c'); g.addColorStop(0.4, '#5c3a1e'); g.addColorStop(1, '#8b5e3c')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + r, r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
  ctx.fill()
  // 高光
  ctx.globalAlpha = 0.15
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(x + r, y + 1); ctx.lineTo(x + w - r, y + 1); ctx.stroke()
  ctx.globalAlpha = 1
  ctx.restore()
}

/** 生成含装裱的高清 Canvas Blob */
async function exportWithMount(scale: number = 2): Promise<{ blob: Blob; width: number; height: number } | null> {
  const tmpl = CARD_TEMPLATES[currentTmpl.value]
  const cardW = customWidth.value || tmpl.width
  const cardH = customHeight.value || tmpl.height
  const mount = currentMount.value
  const cfg = MOUNT_CANVAS[mount]

  const [pt, pr, pb, pl] = cfg.padding
  const m = cfg.margin
  const [rodTop, rodBot] = cfg.rodHeight ?? [0, 0]

  // 总画面尺寸（逻辑像素）
  const totalW = cardW + (pl + m + m + pr)
  const totalH = cardH + (pt + m + m + pb) + rodTop + rodBot

  const canvas = document.createElement('canvas')
  canvas.width = totalW * scale
  canvas.height = totalH * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.scale(scale, scale)
  await ensureFontReady(currentFont.value)

  // 1. 绘制装裱底色（偏移到天杆下方）
  if (mount !== 'none') {
    ctx.save()
    ctx.translate(0, rodTop)
    cfg.draw(ctx, totalW, totalH - rodTop - rodBot)
    ctx.restore()
  }

  // 2. 绘制额外装饰（天杆地杆等）
  if (cfg.extra) {
    ctx.save()
    ctx.translate(0, rodTop)
    cfg.extra(ctx, totalW, totalH - rodTop - rodBot)
    ctx.restore()
  }

  // 3. 在画心区域绘制书法卡片
  ctx.save()
  ctx.translate(pl + m, pt + m + rodTop)
  renderCalligraphyCard(ctx, buildRenderOptions())
  ctx.restore()

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob ? { blob, width: canvas.width, height: canvas.height } : null)
    }, 'image/png')
  })
}

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

const currentFont = ref<CalligraphyFont>((uni.getStorageSync('moyun_default_font') as CalligraphyFont) || 'MaShanZheng')
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

// 3D 预览
const enable3DTilt = ref(false)
const preview3DMode = ref<'flat' | 'tilt' | '3d' | 'scene'>('flat')
const tiltWrapperRef = ref<any>(null)
const scene3dRef = ref<any>(null)
const frame3dRef = ref<any>(null)
const show3DGrid = ref(true)
let threeGridHelper: any = null
const isRecording3D = ref(false)
const recordSeconds = ref(0)
const showRecordSettings = ref(false)
const recordFormat = ref('webm-vp9')
const recordFPS = ref(30)
const recordQuality = ref('high')
const recordAutoRotate = ref(true)
let mediaRecorder: MediaRecorder | null = null
let recordChunks: Blob[] = []
let recordTimer: ReturnType<typeof setInterval> | null = null
let autoRotateActive = false

interface FormatOption { key: string; mime: string; label: string; ext: string }
const FORMAT_MAP: FormatOption[] = [
  { key: 'webm-vp9', mime: 'video/webm;codecs=vp9', label: 'WebM (VP9)', ext: 'webm' },
  { key: 'webm-vp8', mime: 'video/webm;codecs=vp8', label: 'WebM (VP8)', ext: 'webm' },
  { key: 'webm', mime: 'video/webm', label: 'WebM', ext: 'webm' },
  { key: 'mp4', mime: 'video/mp4', label: 'MP4', ext: 'mp4' },
]
const availableFormats = computed(() =>
  FORMAT_MAP.filter(f => {
    try { return MediaRecorder.isTypeSupported(f.mime) } catch { return false }
  })
)
const qualityOptions = [
  { key: 'standard', label: '标准', bps: 2_500_000 },
  { key: 'high', label: '高清', bps: 5_000_000 },
  { key: 'ultra', label: '超清', bps: 10_000_000 },
]
const recordResolution = ref('2x')
const resolutionOptions = [
  { key: '1x', label: '1x 原始', scale: 1 },
  { key: '2x', label: '2x 高清', scale: 2 },
  { key: '3x', label: '3x 超清', scale: 3 },
  { key: '4x', label: '4x 2K+', scale: 4 },
]

const is3DFullscreen = ref(false)

// 印刷导出
const showPrintPanel = ref(false)
const printSize = ref('a4')
const printDPI = ref(300)
const printBleed = ref(true)
const printCropMarks = ref(true)
const printColorHint = ref<'rgb' | 'cmyk-hint'>('rgb')

interface PrintSizeOption { key: string; label: string; widthMm: number; heightMm: number }
const PRINT_SIZES: PrintSizeOption[] = [
  { key: 'a4', label: 'A4', widthMm: 210, heightMm: 297 },
  { key: 'a3', label: 'A3', widthMm: 297, heightMm: 420 },
  { key: '16k', label: '16开', widthMm: 195, heightMm: 270 },
  { key: '8k', label: '8开', widthMm: 270, heightMm: 390 },
  { key: 'custom', label: '原始比例', widthMm: 0, heightMm: 0 },
]
const PRINT_DPI_OPTIONS = [
  { dpi: 300, label: '300 DPI（标准印刷）' },
  { dpi: 350, label: '350 DPI（高端印刷）' },
  { dpi: 150, label: '150 DPI（喷绘写真）' },
]
const BLEED_MM = 3

const printOutputInfo = computed(() => {
  const ps = PRINT_SIZES.find(s => s.key === printSize.value) || PRINT_SIZES[0]
  const tmpl = CARD_TEMPLATES[currentTmpl.value]
  const cardW = customWidth.value || tmpl.width
  const cardH = customHeight.value || tmpl.height
  const cardRatio = cardW / cardH

  let widthMm: number, heightMm: number
  if (ps.key === 'custom') {
    widthMm = Math.round(cardW / printDPI.value * 25.4)
    heightMm = Math.round(cardH / printDPI.value * 25.4)
  } else {
    const paperRatio = ps.widthMm / ps.heightMm
    if (cardRatio > paperRatio) {
      widthMm = ps.widthMm; heightMm = Math.round(ps.widthMm / cardRatio)
    } else {
      heightMm = ps.heightMm; widthMm = Math.round(ps.heightMm * cardRatio)
    }
  }

  const bleedMm = printBleed.value ? BLEED_MM : 0
  const bleedPx = Math.round(bleedMm / 25.4 * printDPI.value)
  const widthPx = Math.round((widthMm + bleedMm * 2) / 25.4 * printDPI.value)
  const heightPx = Math.round((heightMm + bleedMm * 2) / 25.4 * printDPI.value)

  return { widthMm, heightMm, widthPx, heightPx, bleedPx, bleedMm }
})

// 分享海报
const showSharePanel = ref(false)
const posterTemplate = ref('elegant')
const copyStyle = ref('xiaohongshu')

interface PosterTemplate { key: string; label: string; desc: string }
const POSTER_TEMPLATES: PosterTemplate[] = [
  { key: 'elegant', label: '标准', desc: '诗词+译文+二维码' },
  { key: 'clean', label: '简约', desc: '仅品牌水印' },
]

const COPY_STYLES = [
  { key: 'xiaohongshu', label: '小红书风' },
  { key: 'wechat', label: '朋友圈风' },
  { key: 'weibo', label: '微博风' },
  { key: 'plain', label: '纯文字' },
]

const shareText = computed(() => {
  const p = poem.value
  const lines = p.content.join('，')
  const tags = '#AI作诗 #墨韵 #书法 #诗词'
  switch (copyStyle.value) {
    case 'xiaohongshu':
      return `🖌️ 墨韵AI · 一念成诗\n\n「${lines}」\n——《${p.title}》\n\n${p.translation}\n\n✨ 每个人心中都有一首诗\n用AI把你的故事写成诗篇\n\n${tags} #中国风 #传统文化`
    case 'wechat':
      return `「${lines}」——《${p.title}》\n\n${p.translation}\n\n—— 墨韵AI · moyun.art`
    case 'weibo':
      return `【墨韵AI·一念成诗】「${lines}」——《${p.title}》 ${p.translation} ${tags}`
    case 'plain':
      return `《${p.title}》\n${p.content.join('\n')}\n\n${p.translation}\n\n—— 墨韵AI · moyun.art`
    default:
      return ''
  }
})

const posterPreviewUrl = ref('')
const posterGenerating = ref(false)
const posterImage = ref('')
const posterImgRegion = ref<'bottom' | 'top' | 'full'>('bottom')
const posterImgOpacity = ref(0.22)
const IMG_FILL_REGIONS = [
  { key: 'bottom', label: '信息区' },
  { key: 'top', label: '卡片区' },
  { key: 'full', label: '整张海报' },
]
let posterQrDataUrl: string | null = null

function pickPosterImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      posterImage.value = reader.result as string
      updatePosterPreview()
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function removePosterImage() {
  posterImage.value = ''
  updatePosterPreview()
}

function previewPosterImage() {
  if (posterImage.value) {
    uni.previewImage({ current: posterImage.value, urls: [posterImage.value] })
  }
}

async function ensureQRCode(): Promise<string> {
  if (posterQrDataUrl) return posterQrDataUrl
  const qr = qrGenerator(0, 'M')
  qr.addData('https://moyun.art')
  qr.make()

  const moduleCount = qr.getModuleCount()
  const cellSize = Math.ceil(200 / moduleCount)
  const size = cellSize * moduleCount
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')!
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      ctx.fillStyle = qr.isDark(row, col) ? '#2c2c2e' : 'rgba(255,255,255,0)'
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
    }
  }
  posterQrDataUrl = c.toDataURL('image/png')
  return posterQrDataUrl
}

async function renderPoster(): Promise<HTMLCanvasElement | null> {
  const tmplKey = posterTemplate.value
  const p = poem.value
  await ensureFontReady(currentFont.value)

  // ── 1. 生成卡片图 ──
  const cardResult = await exportWithMount(2)
  if (!cardResult) return null
  const img = await loadImage(URL.createObjectURL(cardResult.blob))
  const cardW = img.width, cardH = img.height
  const W = cardW
  const pad = Math.round(W * 0.045)
  const unit = W / 1080 // 基准缩放因子

  // ── 2. 预排底部信息区内容，计算所需高度 ──
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = W; tmpCanvas.height = 1
  const tmpCtx = tmpCanvas.getContext('2d')!

  const titleSize = Math.round(28 * unit)
  const poemSize = Math.round(22 * unit)
  const transSize = Math.round(18 * unit)
  const apprecSize = Math.round(16 * unit)
  const brandSize = Math.round(14 * unit)
  const lineH = 1.7
  const textAreaW = W - pad * 2 - Math.round(110 * unit) // 留出二维码区域

  function wrapText(text: string, fontSize: number, maxW: number): string[] {
    tmpCtx.font = `${fontSize}px "LXGW WenKai", serif`
    const lines: string[] = []
    let cur = ''
    for (const ch of text) {
      if (tmpCtx.measureText(cur + ch).width > maxW) {
        lines.push(cur); cur = ch
      } else { cur += ch }
    }
    if (cur) lines.push(cur)
    return lines
  }

  // 预计算各区域行数（两句合一行，逗号分隔）
  const rawLines = p.content.map(l => l.trim()).filter(Boolean)
  const poemLines: string[] = []
  for (let i = 0; i < rawLines.length; i += 2) {
    poemLines.push(i + 1 < rawLines.length ? `${rawLines[i]}，${rawLines[i + 1]}` : rawLines[i])
  }
  const transLines = wrapText(p.translation || '', transSize, textAreaW)

  // 优先用海报面板选择的图片，其次用用户上传的图片
  const posterBgImage = posterImage.value || (userInput.value.images?.length ? userInput.value.images[0] : '')
  const hasUserImages = !!posterBgImage

  // 计算信息区总高度（宽松布局）
  const topPad = Math.round(40 * unit)
  const botPad = Math.round(48 * unit)
  const secGap = Math.round(24 * unit)

  let infoH = topPad + botPad
  if (tmplKey === 'clean') {
    infoH = Math.round(70 * unit)
  } else {
    infoH += Math.round(titleSize * 1.5)
    infoH += secGap
    infoH += Math.round(poemLines.length * poemSize * lineH)
    infoH += secGap
    infoH += Math.round(transLines.length * transSize * lineH)
  }

  // ── 3. 创建画布 ──
  const H = cardH + infoH
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) { URL.revokeObjectURL(img.src); return null }

  // ── 4. 底色 + 卡片 ──
  const imgUrl = img.src
  ctx.fillStyle = '#f4f0ea'
  ctx.fillRect(0, 0, W, H)
  ctx.drawImage(img, 0, 0, cardW, cardH)

  // ── 5. 信息区 ──
  const infoTop = cardH

  if (tmplKey === 'clean') {
    ctx.save()
    ctx.font = `${brandSize}px "LXGW WenKai", sans-serif`
    ctx.fillStyle = 'rgba(139, 115, 85, 0.4)'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('墨韵AI · moyun.art · 一念成诗', W / 2, infoTop + infoH / 2)
    ctx.restore()
    URL.revokeObjectURL(imgUrl)
    return canvas
  }

  // ── 用户图片背景（支持区域 + 不透明度） ──
  if (hasUserImages) {
    try {
      const bgImg = await loadImage(posterBgImage)
      const region = posterImgRegion.value
      const opacity = posterImgOpacity.value

      // 确定绘制区域
      let ry: number, rh: number
      if (region === 'bottom') { ry = infoTop; rh = infoH }
      else if (region === 'top') { ry = 0; rh = cardH }
      else { ry = 0; rh = H }

      ctx.save()
      ctx.beginPath(); ctx.rect(0, ry, W, rh); ctx.clip()

      // cover 填充清晰图片
      const imgR = bgImg.width / bgImg.height
      const areaR = W / rh
      let dw: number, dh: number, dx: number, dy: number
      if (imgR > areaR) { dh = rh; dw = rh * imgR; dx = (W - dw) / 2; dy = ry }
      else { dw = W; dh = W / imgR; dx = 0; dy = ry + (rh - dh) / 2 }

      ctx.globalAlpha = opacity
      ctx.drawImage(bgImg, dx, dy, dw, dh)
      ctx.globalAlpha = 1
      ctx.restore()

      // 如果图片在卡片区或全部，重绘卡片（透明度随图片反向）
      if (region !== 'bottom') {
        ctx.save()
        ctx.globalAlpha = Math.max(0, 1 - opacity)
        ctx.drawImage(img, 0, 0, cardW, cardH)
        ctx.restore()
      }
    } catch (_) {}
  }

  URL.revokeObjectURL(imgUrl)

  // 分隔线
  ctx.strokeStyle = 'rgba(139, 115, 85, 0.1)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(pad, infoTop + Math.round(10 * unit))
  ctx.lineTo(W - pad, infoTop + Math.round(10 * unit))
  ctx.stroke()

  let curY = infoTop + topPad

  // 标题
  ctx.save()
  ctx.font = `600 ${titleSize}px "LXGW WenKai", "Ma Shan Zheng", serif`
  ctx.fillStyle = '#3c3428'
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  ctx.fillText(`《${p.title}》`, pad, curY)
  ctx.restore()
  curY += Math.round(titleSize * 1.5) + secGap

  // 诗句逐行
  ctx.save()
  ctx.font = `${poemSize}px "LXGW WenKai", serif`
  ctx.fillStyle = 'rgba(60, 52, 40, 0.7)'
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  for (const line of poemLines) {
    ctx.fillText(line, pad, curY)
    curY += Math.round(poemSize * lineH)
  }
  ctx.restore()
  curY += secGap

  // 译文自动换行
  ctx.save()
  ctx.font = `${transSize}px "LXGW WenKai", sans-serif`
  ctx.fillStyle = 'rgba(60, 52, 40, 0.4)'
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  for (const line of transLines) {
    ctx.fillText(line, pad, curY)
    curY += Math.round(transSize * lineH)
  }
  ctx.restore()

  // 二维码（右下角，与标题对齐）
  const qrUrl = await ensureQRCode()
  const qrImg = await loadImage(qrUrl)
  const qrSize = Math.round(80 * unit)
  const qrX = W - pad - qrSize
  const qrY = infoTop + pad
  ctx.save(); ctx.globalAlpha = 0.55
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
  ctx.restore()
  ctx.save()
  ctx.font = `${Math.round(11 * unit)}px sans-serif`
  ctx.fillStyle = 'rgba(60, 52, 40, 0.25)'
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText('扫码体验', qrX + qrSize / 2, qrY + qrSize + Math.round(4 * unit))
  ctx.restore()

  // 品牌
  ctx.save()
  ctx.font = `${brandSize}px "LXGW WenKai", sans-serif`
  ctx.fillStyle = 'rgba(139, 115, 85, 0.3)'
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
  ctx.fillText('墨韵AI · moyun.art', W / 2, H - Math.round(12 * unit))
  ctx.restore()

  return canvas
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function onSavePoster() {
  uni.showLoading({ title: '生成海报中...' })
  const canvas = await renderPoster()
  uni.hideLoading()
  if (!canvas) { uni.showToast({ title: '海报生成失败', icon: 'none' }); return }

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const style = POSTER_TEMPLATES.find(t => t.key === posterTemplate.value)
    link.download = `墨韵_${poem.value.title}_${style?.label || '海报'}.png`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
    incrementShareCount()
    uni.showToast({ title: '海报已保存', icon: 'success' })
  }, 'image/png')
}

async function updatePosterPreview() {
  posterGenerating.value = true
  posterPreviewUrl.value = ''
  try {
    const canvas = await renderPoster()
    if (!canvas) return
    posterPreviewUrl.value = canvas.toDataURL('image/jpeg', 0.9)
  } finally {
    posterGenerating.value = false
  }
}

function onCopyShareText() {
  const text = shareText.value
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      uni.showToast({ title: '文案已复制', icon: 'success' })
    })
  } else {
    const ta = document.createElement('textarea')
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    document.execCommand('copy'); document.body.removeChild(ta)
    uni.showToast({ title: '文案已复制', icon: 'success' })
  }
}

function toggle3DGrid() {
  show3DGrid.value = !show3DGrid.value
  if (threeGridHelper) {
    threeGridHelper.visible = show3DGrid.value
  }
}

function toggle3DFullscreen() {
  const wrap = document.querySelector('.frame3d-wrap') as HTMLElement
  if (!wrap) return

  if (!document.fullscreenElement) {
    wrap.requestFullscreen().then(() => {
      is3DFullscreen.value = true
      // 全屏后等 DOM 更新，通知 renderer 调整尺寸
      setTimeout(() => {
        if (threeRenderer && threeCamera) {
          const nw = wrap.clientWidth
          const nh = wrap.clientHeight
          threeRenderer.setSize(nw, nh)
          threeCamera.aspect = nw / nh
          threeCamera.updateProjectionMatrix()
        }
      }, 100)
    }).catch(() => {})
  } else {
    document.exitFullscreen().then(() => {
      is3DFullscreen.value = false
    }).catch(() => {})
  }
}

// 监听全屏变化（用户按 Esc 退出）
if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && is3DFullscreen.value) {
      is3DFullscreen.value = false
    }
  })
}

function toggle3DRecord() {
  if (isRecording3D.value) {
    stopRecording3D()
  } else {
    startRecording3D()
  }
}

let preRecordSize: { w: number; h: number } | null = null

function startRecording3D() {
  const container = frame3dRef.value
  if (!container) return
  const el = container instanceof HTMLElement ? container : container?.$el
  const canvas = el?.querySelector('canvas') as HTMLCanvasElement
  if (!canvas) return

  // 按比例放大分辨率（保持宽高比不变，通过 renderer 设置）
  const res = resolutionOptions.find(r => r.key === recordResolution.value)
  const scale = res?.scale || 1
  const baseW = el.clientWidth
  const baseH = el.clientHeight
  if (scale > 1 && threeRenderer) {
    preRecordSize = { w: baseW, h: baseH }
    threeRenderer.setPixelRatio(scale)
    threeRenderer.setSize(baseW, baseH)
  }

  // 查找选中的格式
  const fmt = FORMAT_MAP.find(f => f.key === recordFormat.value)
  const mimeType = fmt?.mime || 'video/webm'
  const ext = fmt?.ext || 'webm'
  const bps = qualityOptions.find(q => q.key === recordQuality.value)?.bps || 5_000_000

  // 开始录制
  const stream = canvas.captureStream(recordFPS.value)
  mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bps })
  recordChunks = []

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordChunks.push(e.data)
  }
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordChunks, { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `墨韵_3D展示_${Date.now()}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    recordChunks = []
  }

  mediaRecorder.start(1000)
  isRecording3D.value = true
  showRecordSettings.value = false
  recordSeconds.value = 0
  autoRotateActive = recordAutoRotate.value

  // 计时
  recordTimer = setInterval(() => {
    recordSeconds.value++
  }, 1000)
}

function stopRecording3D() {
  autoRotateActive = false
  isRecording3D.value = false
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  mediaRecorder = null
  if (recordTimer) {
    clearInterval(recordTimer)
    recordTimer = null
  }
  // 恢复原始分辨率
  if (preRecordSize && threeRenderer) {
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    threeRenderer.setSize(preRecordSize.w, preRecordSize.h)
    preRecordSize = null
  }
}
const tiltX = ref(0)
const tiltY = ref(0)
const tiltGlareStyle = computed(() => {
  const gx = 50 + tiltX.value * 30
  const gy = 50 + tiltY.value * 30
  return {
    background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
  }
})
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

const isMobileResult = ref(false)

const panelLeftStyle = computed(() => {
  if (isMobileResult.value) return {} // 手机端由 CSS 控制
  return {
    width: `${panelLeftW.value}%`,
    minWidth: '200px',
    maxWidth: 'none',
    flex: 'none',
    transition: isDragging.value ? 'none' : undefined,
  }
})
const panelCenterStyle = computed(() => {
  if (isMobileResult.value) return {}
  return {
    width: `${panelCenterW.value}%`,
    minWidth: '180px',
    maxWidth: 'none',
    flex: 'none',
    transition: isDragging.value ? 'none' : undefined,
  }
})

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

// ── 3D 微倾事件 ──
function setupTiltEvents() {
  const wrapper = tiltWrapperRef.value
  const el = wrapper instanceof HTMLElement ? wrapper : wrapper?.$el
  if (!el) return

  el.addEventListener('mousemove', (e: MouseEvent) => {
    if (!enable3DTilt.value) return
    const rect = el.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width - 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5
    tiltX.value = cx
    tiltY.value = cy
    el.style.transform = `perspective(800px) rotateY(${cx * 12}deg) rotateX(${-cy * 12}deg)`
  })

  el.addEventListener('mouseleave', () => {
    if (!enable3DTilt.value) return
    tiltX.value = 0
    tiltY.value = 0
    el.style.transition = 'transform 0.4s ease-out'
    el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)'
    setTimeout(() => { el.style.transition = '' }, 400)
  })
}

// ── 3D 书房场景 ──
let threeCleanup: (() => void) | null = null
let threeCamera: any = null
let threeRenderer: any = null
let threeFrameGroup: any = null
let threeScene: any = null
let threeModule: any = null

// ── 多场景系统 ──
const SCENE_LIST = [
  { key: 'study', label: '书房', icon: '📚' },
  { key: 'gallery', label: '展厅', icon: '🏛' },
  { key: 'living', label: '客厅', icon: '🛋' },
  { key: 'tea', label: '茶室', icon: '🍵' },
]
const currentSceneKey = ref('study')

async function switchScene(key: string) {
  if (currentSceneKey.value === key) return
  currentSceneKey.value = key
  if (threeCleanup) { threeCleanup(); threeCleanup = null }
  await nextTick()
  await init3DScene()
}

async function switchToFlat() {
  if (threeCleanup) { threeCleanup(); threeCleanup = null }
  preview3DMode.value = 'flat'
  enable3DTilt.value = false
  await nextTick()
  await renderCard()
  setupTiltEvents()
}

async function switchToTilt() {
  if (threeCleanup) { threeCleanup(); threeCleanup = null }
  preview3DMode.value = 'tilt'
  enable3DTilt.value = true
  await nextTick()
  await renderCard()
  setupTiltEvents()
}

async function switchTo3DFrame() {
  if (preview3DMode.value === '3d') {
    preview3DMode.value = 'flat'
    enable3DTilt.value = false
    if (threeCleanup) { threeCleanup(); threeCleanup = null }
    return
  }
  if (threeCleanup) { threeCleanup(); threeCleanup = null }
  preview3DMode.value = '3d'
  enable3DTilt.value = false
  await nextTick()
  await init3DFrame()
}

async function switchTo3DScene() {
  if (preview3DMode.value === 'scene') {
    preview3DMode.value = 'flat'
    enable3DTilt.value = false
    if (threeCleanup) { threeCleanup(); threeCleanup = null }
    return
  }
  if (threeCleanup) { threeCleanup(); threeCleanup = null }
  preview3DMode.value = 'scene'
  enable3DTilt.value = false
  await nextTick()
  await init3DScene()
}

/** 重建 3D 贴图和画框几何体（canvas 尺寸/内容变化时调用） */
function rebuild3DTexture() {
  if (!threeModule || !threeFrameGroup || !threeScene || !canvasEl) return
  const THREE = threeModule

  // 创建新贴图（高清设置）
  const newTexture = new THREE.CanvasTexture(canvasEl)
  newTexture.colorSpace = THREE.SRGBColorSpace
  newTexture.minFilter = THREE.LinearFilter
  newTexture.magFilter = THREE.LinearFilter
  newTexture.generateMipmaps = false
  if (threeRenderer) {
    newTexture.anisotropy = threeRenderer.capabilities.getMaxAnisotropy()
  }
  newTexture.needsUpdate = true

  // 计算新比例
  const newAspect = canvasEl.height / canvasEl.width
  const artW = 2.0, artH = artW * newAspect

  // 更新 frameGroup 中所有子对象的引用 artW/artH
  // 最简单的办法是重建整个画框
  // 先把旧的 cardTexture 引用存一下，在 buildFrame 里会用到
  threeScene.__artW = artW
  threeScene.__artH = artH
  threeScene.__cardTexture = newTexture

  // 更新网格位置
  if (threeGridHelper) {
    threeGridHelper.position.y = -artH / 2 - 0.3
  }

  if (threeBuildFrame) {
    threeBuildFrame(currentMount.value)
  }
}

/** 3D 画框聚焦预览 —— 近距离展示画框立体效果 */
async function init3DFrame() {
  const container = frame3dRef.value
  if (!container) return
  const el = container instanceof HTMLElement ? container : container?.$el
  if (!el) return

  const THREE = await import('three')
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

  await new Promise(r => requestAnimationFrame(r))
  const w = el.clientWidth || 600
  const h = el.clientHeight || 500

  // 画作 canvas
  const cardCanvas = canvasEl
  let cardTexture: InstanceType<typeof THREE.CanvasTexture> | null = null
  if (cardCanvas) {
    cardTexture = new THREE.CanvasTexture(cardCanvas)
    cardTexture.colorSpace = THREE.SRGBColorSpace
    cardTexture.minFilter = THREE.LinearFilter
    cardTexture.magFilter = THREE.LinearFilter
    cardTexture.generateMipmaps = false
    cardTexture.needsUpdate = true
  }
  const artAspect = cardCanvas ? cardCanvas.height / cardCanvas.width : 1.4
  const artW = 2.0, artH = artW * artAspect

  // 程序化纹理工具
  function mkTex3D(sz: number, draw: (cx: CanvasRenderingContext2D, s: number) => void) {
    const c = document.createElement('canvas')
    c.width = c.height = sz
    draw(c.getContext('2d')!, sz)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  }

  const woodTex = mkTex3D(512, (cx, s) => {
    // 底色：深红木
    const bg = cx.createLinearGradient(0, 0, s, s * 0.3)
    bg.addColorStop(0, '#3a1808'); bg.addColorStop(0.5, '#4a2010'); bg.addColorStop(1, '#3a1808')
    cx.fillStyle = bg; cx.fillRect(0, 0, s, s)
    // 年轮纹：多层弯曲线条
    for (let i = 0; i < 200; i++) {
      const y = Math.random() * s
      const amp = 1.5 + Math.random() * 5
      const freq = 0.008 + Math.random() * 0.015
      const phase = Math.random() * Math.PI * 2
      cx.strokeStyle = `rgba(${25 + Math.random() * 35},${10 + Math.random() * 20},${3 + Math.random() * 12},${0.08 + Math.random() * 0.18})`
      cx.lineWidth = 0.3 + Math.random() * 2.5
      cx.beginPath(); cx.moveTo(0, y)
      for (let x = 0; x < s; x += 8) cx.lineTo(x, y + Math.sin(x * freq + phase) * amp + Math.sin(x * 0.003) * 8)
      cx.stroke()
    }
    // 木节（偶尔出现的深色圆斑）
    for (let i = 0; i < 3; i++) {
      const kx = 80 + Math.random() * (s - 160)
      const ky = 80 + Math.random() * (s - 160)
      const kr = 8 + Math.random() * 15
      const kg = cx.createRadialGradient(kx, ky, 0, kx, ky, kr)
      kg.addColorStop(0, 'rgba(20,8,2,0.4)'); kg.addColorStop(1, 'rgba(20,8,2,0)')
      cx.fillStyle = kg; cx.fillRect(kx - kr, ky - kr, kr * 2, kr * 2)
    }
    // 高光丝纹
    cx.globalAlpha = 0.04
    for (let i = 0; i < 50; i++) {
      const y = Math.random() * s
      cx.strokeStyle = '#ffd8a0'; cx.lineWidth = 0.5
      cx.beginPath(); cx.moveTo(0, y); cx.lineTo(s, y + (Math.random() - 0.5) * 10); cx.stroke()
    }
    cx.globalAlpha = 1
  })

  const goldTex = mkTex3D(512, (cx, s) => {
    // 多方向金属渐变
    const g = cx.createLinearGradient(0, 0, s, s)
    g.addColorStop(0, '#8a6508'); g.addColorStop(0.12, '#c49a1a')
    g.addColorStop(0.28, '#ffd700'); g.addColorStop(0.42, '#e8b820')
    g.addColorStop(0.55, '#b8960b'); g.addColorStop(0.68, '#daa520')
    g.addColorStop(0.82, '#ffd700'); g.addColorStop(1, '#9a7209')
    cx.fillStyle = g; cx.fillRect(0, 0, s, s)
    // 拉丝纹（水平）
    for (let i = 0; i < 300; i++) {
      const y = Math.random() * s
      cx.strokeStyle = `rgba(255,245,200,${0.02 + Math.random() * 0.05})`
      cx.lineWidth = 0.3 + Math.random()
      cx.beginPath(); cx.moveTo(0, y); cx.lineTo(s, y + (Math.random() - 0.5) * 3); cx.stroke()
    }
    // 微斑点（锤纹质感）
    for (let i = 0; i < 100; i++) {
      const px = Math.random() * s, py = Math.random() * s
      cx.fillStyle = `rgba(${180 + Math.random() * 75},${140 + Math.random() * 60},${Math.random() * 30},${0.03 + Math.random() * 0.06})`
      cx.beginPath(); cx.arc(px, py, 1 + Math.random() * 4, 0, Math.PI * 2); cx.fill()
    }
  })

  const bambooTex = mkTex3D(512, (cx, s) => {
    // 竹面底色
    const g = cx.createLinearGradient(0, 0, 0, s)
    g.addColorStop(0, '#d4c48a'); g.addColorStop(0.15, '#c8b87a')
    g.addColorStop(0.3, '#b5a568'); g.addColorStop(0.5, '#a89555')
    g.addColorStop(0.7, '#b5a568'); g.addColorStop(0.85, '#c8b87a'); g.addColorStop(1, '#d4c48a')
    cx.fillStyle = g; cx.fillRect(0, 0, s, s)
    // 纵向纤维纹
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * s
      cx.strokeStyle = `rgba(${100 + Math.random() * 40},${80 + Math.random() * 30},${30 + Math.random() * 20},${0.03 + Math.random() * 0.06})`
      cx.lineWidth = 0.3 + Math.random()
      cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x + (Math.random() - 0.5) * 5, s); cx.stroke()
    }
    // 竹节（两道深色环带）
    for (const ny of [0.33, 0.66]) {
      const ny0 = s * ny
      const ng = cx.createLinearGradient(0, ny0 - 6, 0, ny0 + 6)
      ng.addColorStop(0, 'rgba(80,60,20,0)'); ng.addColorStop(0.3, 'rgba(80,60,20,0.15)')
      ng.addColorStop(0.5, 'rgba(80,60,20,0.22)'); ng.addColorStop(0.7, 'rgba(80,60,20,0.15)')
      ng.addColorStop(1, 'rgba(80,60,20,0)')
      cx.fillStyle = ng; cx.fillRect(0, ny0 - 6, s, 12)
      // 节上高光
      cx.strokeStyle = 'rgba(255,255,230,0.08)'; cx.lineWidth = 1
      cx.beginPath(); cx.moveTo(0, ny0 - 2); cx.lineTo(s, ny0 - 2); cx.stroke()
    }
  })

  // ── 场景（纯净背景 + 可选网格，适配深色模式） ──
  const dark = isDark.value
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(dark ? 0x1e1e22 : 0xf5f2ed)

  // 参考网格
  const gridHelper = new THREE.GridHelper(10, 20,
    dark ? 0x3a3a40 : 0xd0ccc4,
    dark ? 0x2a2a30 : 0xe0dcd6
  )
  gridHelper.position.y = -artH / 2 - 0.3
  gridHelper.visible = show3DGrid.value
  scene.add(gridHelper)
  threeGridHelper = gridHelper

  // 灯光（只影响画框材质，画心用 BasicMaterial 不受影响）
  scene.add(new THREE.AmbientLight(0xffffff, dark ? 0.4 : 0.5))
  const keyLight = new THREE.DirectionalLight(0xffffff, dark ? 0.5 : 0.4)
  keyLight.position.set(3, 4, 5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  scene.add(keyLight)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.15)
  fillLight.position.set(-3, 2, 3)
  scene.add(fillLight)

  // 相机（默认拉远，看到完整画框）
  const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 50)
  camera.position.set(0.2, 0.15, 6.5)
  camera.lookAt(0, 0, 0)
  threeCamera = camera

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputColorSpace = THREE.SRGBColorSpace
  el.innerHTML = ''
  el.appendChild(renderer.domElement)
  threeRenderer = renderer

  // 画作贴图启用各向异性过滤（斜角观看更清晰）
  if (cardTexture) {
    const maxAniso = renderer.capabilities.getMaxAnisotropy()
    cardTexture.anisotropy = maxAniso
    cardTexture.needsUpdate = true
  }

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 2
  controls.maxDistance = 10
  controls.target.set(0, 0, 0)

  // ── 画框组 ──
  const frameGroup = new THREE.Group()
  scene.add(frameGroup)
  threeFrameGroup = frameGroup
  threeScene = scene
  threeModule = THREE

  function buildFrame3D(mount: string) {
    while (frameGroup.children.length) {
      const c = frameGroup.children[0]
      frameGroup.remove(c)
      if ((c as any).geometry) (c as any).geometry.dispose()
      if ((c as any).material?.dispose) (c as any).material.dispose()
    }

    // 动态读取最新尺寸和贴图（renderCard 后会更新）
    const tex = scene.__cardTexture || cardTexture
    // 用局部变量覆盖外层 artW/artH，后续代码全部自动适配
    const artW: number = scene.__artW || 2.0
    const artH: number = scene.__artH || (2.0 * artAspect)

    // 画心贴图（MeshBasicMaterial 不受光照影响，1:1 还原颜色）
    const cardMat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -1
    })
    const cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(artW, artH), cardMat)
    cardMesh.position.z = 0.002
    frameGroup.add(cardMesh)

    // 获取装裱配置
    const fPad = 0.08  // 框宽度
    const fDepth = 0.06 // 框厚度
    const matPad = 0.03 // 卡纸宽度
    const matDepth = 0.01

    if (mount === 'none') {
      // 无框 —— 加背板
      const back = new THREE.Mesh(
        new THREE.PlaneGeometry(artW + 0.02, artH + 0.02),
        new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.9, side: THREE.DoubleSide })
      )
      back.position.z = -0.005
      frameGroup.add(back)
      return
    }

    if (mount === 'hong-mu' || mount === 'jin-qi' || mount === 'zhu-kuang') {
      // === 真实立体画框 ===
      const tex = mount === 'hong-mu' ? woodTex : mount === 'jin-qi' ? goldTex : bambooTex
      const frameMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: mount === 'jin-qi' ? 0.25 : mount === 'zhu-kuang' ? 0.55 : 0.45,
        metalness: mount === 'jin-qi' ? 0.5 : mount === 'zhu-kuang' ? 0.02 : 0.08,
      })

      // 卡纸（白色斜切 mat board）
      const matBoard = new THREE.Mesh(
        new THREE.PlaneGeometry(artW + matPad * 2, artH + matPad * 2),
        new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.9, side: THREE.DoubleSide })
      )
      matBoard.position.z = -0.001
      frameGroup.add(matBoard)

      // 四条框边（角落不重叠：上下全宽，左右缩短）
      const outerW = artW + matPad * 2 + fPad * 2
      const innerH = artH + matPad * 2  // 左右框条只覆盖内侧高度
      // 上框（全宽）
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(outerW, fPad, fDepth), frameMat)
      topBar.position.set(0, (artH + matPad * 2 + fPad) / 2, fDepth / 2 - 0.01)
      topBar.castShadow = true; frameGroup.add(topBar)
      // 下框（全宽）
      const botBar = new THREE.Mesh(new THREE.BoxGeometry(outerW, fPad, fDepth), frameMat)
      botBar.position.set(0, -(artH + matPad * 2 + fPad) / 2, fDepth / 2 - 0.01)
      botBar.castShadow = true; frameGroup.add(botBar)
      // 左框（高度缩短，不与上下重叠）
      const leftBar = new THREE.Mesh(new THREE.BoxGeometry(fPad, innerH, fDepth), frameMat)
      leftBar.position.set(-(artW + matPad * 2 + fPad) / 2, 0, fDepth / 2 - 0.01)
      leftBar.castShadow = true; frameGroup.add(leftBar)
      // 右框（同上）
      const rightBar = new THREE.Mesh(new THREE.BoxGeometry(fPad, innerH, fDepth), frameMat)
      rightBar.position.set((artW + matPad * 2 + fPad) / 2, 0, fDepth / 2 - 0.01)
      rightBar.castShadow = true; frameGroup.add(rightBar)

      // 内倒角（深色阴影面，模拟框内斜面）
      const innerShadowMat = new THREE.MeshStandardMaterial({
        color: 0x1a1008, roughness: 0.8, metalness: 0,
        polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
      })
      const isDepth = 0.015
      // 上内倒角
      const tiBar = new THREE.Mesh(new THREE.BoxGeometry(artW + matPad * 2, isDepth, matDepth + 0.005), innerShadowMat)
      tiBar.position.set(0, (artH + matPad * 2) / 2 - isDepth / 2, -0.003)
      frameGroup.add(tiBar)
      // 下内倒角
      const biBar = tiBar.clone()
      biBar.position.set(0, -(artH + matPad * 2) / 2 + isDepth / 2, -0.003)
      frameGroup.add(biBar)
      // 左内倒角
      const liBar = new THREE.Mesh(new THREE.BoxGeometry(isDepth, artH + matPad * 2, matDepth + 0.005), innerShadowMat)
      liBar.position.set(-(artW + matPad * 2) / 2 + isDepth / 2, 0, -0.003)
      frameGroup.add(liBar)
      // 右内倒角
      const riBar = liBar.clone()
      riBar.position.set((artW + matPad * 2) / 2 - isDepth / 2, 0, -0.003)
      frameGroup.add(riBar)

      // 背板（双面可见）
      const backBoard = new THREE.Mesh(
        new THREE.PlaneGeometry(outerW, outerH),
        new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.9, side: THREE.DoubleSide })
      )
      backBoard.position.z = -0.015
      frameGroup.add(backBoard)

      // 玻璃面（半透明反光）
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(artW + matPad * 2 - 0.005, artH + matPad * 2 - 0.005),
        new THREE.MeshStandardMaterial({
          color: 0xffffff, transparent: true, opacity: 0.06,
          roughness: 0.05, metalness: 0.1,
          side: THREE.FrontSide,
        })
      )
      glass.position.z = 0.004
      frameGroup.add(glass)

    } else if (mount === 'jing-pian') {
      // 镜片 —— 白卡纸 + 细黑框
      const matBoard = new THREE.Mesh(
        new THREE.PlaneGeometry(artW + 0.06, artH + 0.06),
        new THREE.MeshStandardMaterial({ color: 0xf8f4e8, roughness: 0.92, side: THREE.DoubleSide })
      )
      matBoard.position.z = -0.001; frameGroup.add(matBoard)
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 })
      const ow = artW + 0.1, oh = artH + 0.1, fd = 0.03
      const t = new THREE.Mesh(new THREE.BoxGeometry(ow, 0.025, fd), frameMat)
      t.position.set(0, oh / 2, fd / 2 - 0.005); t.castShadow = true; frameGroup.add(t)
      const b = t.clone(); b.position.y = -oh / 2; frameGroup.add(b)
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.025, oh, fd), frameMat)
      l.position.set(-ow / 2, 0, fd / 2 - 0.005); l.castShadow = true; frameGroup.add(l)
      const r = l.clone(); r.position.x = ow / 2; frameGroup.add(r)
      const back = new THREE.Mesh(new THREE.PlaneGeometry(ow, oh), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9, side: THREE.DoubleSide }))
      back.position.z = -0.01; frameGroup.add(back)

    } else if (mount === 'ling-biao') {
      // 绫裱 —— 绢面 + 薄木框
      const silkMat = new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.82, side: THREE.DoubleSide })
      const pad = 0.12
      const silk = new THREE.Mesh(new THREE.PlaneGeometry(artW + pad * 2, artH + pad * 2), silkMat)
      silk.position.z = -0.002; frameGroup.add(silk)
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a1808, roughness: 0.5, metalness: 0.05 })
      const ow = artW + pad * 2 + 0.05, oh = artH + pad * 2 + 0.05, fd = 0.035
      const t = new THREE.Mesh(new THREE.BoxGeometry(ow, 0.028, fd), frameMat)
      t.position.set(0, oh / 2, fd / 2 - 0.005); t.castShadow = true; frameGroup.add(t)
      const b = t.clone(); b.position.y = -oh / 2; frameGroup.add(b)
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.028, oh, fd), frameMat)
      l.position.set(-ow / 2, 0, fd / 2 - 0.005); l.castShadow = true; frameGroup.add(l)
      const r = l.clone(); r.position.x = ow / 2; frameGroup.add(r)

    } else if (mount === 'xuan-he') {
      // 宣和装 —— 天头地脚 + 隔水
      const topH = 0.25, botH = 0.18, sideW = 0.1
      const bgW = artW + sideW * 2, bgH = artH + topH + botH
      const bg = new THREE.Mesh(new THREE.PlaneGeometry(bgW, bgH), new THREE.MeshStandardMaterial({ color: 0xf0e8d5, roughness: 0.85, side: THREE.DoubleSide }))
      bg.position.set(0, (topH - botH) / 2, -0.002); frameGroup.add(bg)
      const topMat = new THREE.MeshStandardMaterial({ color: 0x6b8e9b, roughness: 0.78, side: THREE.DoubleSide })
      const top = new THREE.Mesh(new THREE.PlaneGeometry(bgW, topH), topMat)
      top.position.set(0, artH / 2 + topH / 2, -0.001); frameGroup.add(top)
      const bot = new THREE.Mesh(new THREE.PlaneGeometry(bgW, botH), new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8, side: THREE.DoubleSide }))
      bot.position.set(0, -artH / 2 - botH / 2, -0.001); frameGroup.add(bot)

    } else if (mount === 'li-zhou') {
      // 立轴 —— 卷轴+天杆地杆
      const scrollPad = 0.08
      const bgW = artW + scrollPad * 2, bgH = artH + scrollPad * 2 + 0.35
      const bg = new THREE.Mesh(new THREE.PlaneGeometry(bgW, bgH), new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.85, side: THREE.DoubleSide }))
      bg.position.z = -0.003; frameGroup.add(bg)
      const rodR = 0.025, rodLen = bgW + 0.18
      const rodMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.45, metalness: 0.1 })
      const topRod = new THREE.Mesh(new THREE.CylinderGeometry(rodR, rodR, rodLen, 16), rodMat)
      topRod.rotation.z = Math.PI / 2
      topRod.position.set(0, bgH / 2 + 0.02, 0.015)
      topRod.castShadow = true; frameGroup.add(topRod)
      const botRod = new THREE.Mesh(new THREE.CylinderGeometry(rodR * 1.3, rodR * 1.3, rodLen, 16), rodMat)
      botRod.rotation.z = Math.PI / 2
      botRod.position.set(0, -bgH / 2 - 0.02, 0.015)
      botRod.castShadow = true; frameGroup.add(botRod)
      // 轴头
      const knobMat = new THREE.MeshStandardMaterial({ color: 0x2a1808, roughness: 0.35, metalness: 0.2 })
      for (const [kx, ky, kr] of [
        [rodLen / 2, bgH / 2 + 0.02, rodR * 1.5],
        [-rodLen / 2, bgH / 2 + 0.02, rodR * 1.5],
        [rodLen / 2, -bgH / 2 - 0.02, rodR * 2],
        [-rodLen / 2, -bgH / 2 - 0.02, rodR * 2],
      ] as [number, number, number][]) {
        const knob = new THREE.Mesh(new THREE.SphereGeometry(kr, 12, 10), knobMat)
        knob.position.set(kx, ky, 0.015); frameGroup.add(knob)
      }
    }
  }

  buildFrame3D(currentMount.value)
  threeBuildFrame = buildFrame3D

  // 动画
  let running = true
  let rotAngle = 0
  function animate() {
    if (!running) return
    requestAnimationFrame(animate)
    // 录制时自动环绕旋转
    if (autoRotateActive) {
      rotAngle += 0.008
      const radius = 6.5
      camera.position.x = Math.sin(rotAngle) * radius
      camera.position.z = Math.cos(rotAngle) * radius
      camera.position.y = 0.3 + Math.sin(rotAngle * 0.5) * 0.5
      camera.lookAt(0, 0, 0)
    }
    controls.update()
    if (cardTexture && cardCanvas) cardTexture.needsUpdate = true
    renderer.render(scene, camera)
  }
  animate()

  const onResize = () => {
    const nw = el.clientWidth || 600
    const nh = el.clientHeight || 500
    camera.aspect = nw / nh; camera.updateProjectionMatrix()
    renderer.setSize(nw, nh)
  }
  window.addEventListener('resize', onResize)
  const ro = new ResizeObserver(onResize)
  ro.observe(el)
  setTimeout(onResize, 50)

  threeCleanup = () => {
    running = false; threeCamera = null; threeRenderer = null
    threeFrameGroup = null; threeScene = null; threeModule = null; threeBuildFrame = null
    threeGridHelper = null
    if (isRecording3D.value) stopRecording3D()
    ro.disconnect()
    window.removeEventListener('resize', onResize)
    renderer.dispose(); controls.dispose()
    el.innerHTML = ''
  }
}

async function init3DScene() {
  const container = scene3dRef.value
  if (!container) return
  const el = container instanceof HTMLElement ? container : container?.$el
  if (!el) return

  const THREE = await import('three')
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

  // 等一帧确保容器尺寸已稳定
  await new Promise(r => requestAnimationFrame(r))
  const w = el.clientWidth || 600
  const h = el.clientHeight || 500

  // ── 程序化纹理工具 ──
  function mkTex(sz: number, draw: (cx: CanvasRenderingContext2D, s: number) => void, repeat?: [number, number]) {
    const c = document.createElement('canvas')
    c.width = c.height = sz
    draw(c.getContext('2d')!, sz)
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    if (repeat) t.repeat.set(repeat[0], repeat[1])
    return t
  }

  // 红木纹理（明式家具）
  const hongmuTex = mkTex(512, (cx, s) => {
    cx.fillStyle = '#4a2010'
    cx.fillRect(0, 0, s, s)
    for (let i = 0; i < 120; i++) {
      const y = Math.random() * s
      cx.strokeStyle = `rgba(${30 + Math.random() * 25},${12 + Math.random() * 15},${5 + Math.random() * 8},${0.12 + Math.random() * 0.18})`
      cx.lineWidth = 0.5 + Math.random() * 2.5
      cx.beginPath()
      cx.moveTo(0, y)
      for (let x = 0; x < s; x += 15) cx.lineTo(x, y + Math.sin(x * 0.015 + i * 0.7) * (1.5 + Math.random() * 3))
      cx.stroke()
    }
  })

  // 白墙纹理（宣白灰泥）
  const wallTex = mkTex(512, (cx, s) => {
    cx.fillStyle = '#e8e0d4'
    cx.fillRect(0, 0, s, s)
    for (let i = 0; i < 4000; i++) {
      cx.fillStyle = `rgba(${180 + Math.random() * 40},${170 + Math.random() * 35},${155 + Math.random() * 35},${0.08 + Math.random() * 0.1})`
      cx.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
  })

  // 青砖地面
  const floorTex = mkTex(512, (cx, s) => {
    cx.fillStyle = '#4a4a42'
    cx.fillRect(0, 0, s, s)
    const bs = s / 4
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const bx = c * bs + (r % 2) * (bs / 2), by = r * bs
        const v = 60 + Math.random() * 20
        cx.fillStyle = `rgb(${v},${v - 2},${v - 8})`
        cx.fillRect(bx + 1, by + 1, bs - 2, bs - 2)
        cx.strokeStyle = 'rgba(0,0,0,0.25)'
        cx.lineWidth = 1.5
        cx.strokeRect(bx, by, bs, bs)
      }
    }
    for (let i = 0; i < 2000; i++) {
      cx.fillStyle = `rgba(${50 + Math.random() * 30},${48 + Math.random() * 25},${40 + Math.random() * 20},${0.05 + Math.random() * 0.08})`
      cx.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 2, 1)
    }
  }, [6, 6])

  // 窗棂纹理（冰裂纹透光）
  const windowTex = mkTex(256, (cx, s) => {
    cx.fillStyle = 'rgba(200,220,240,0.25)'
    cx.fillRect(0, 0, s, s)
    cx.strokeStyle = '#3a2a18'
    cx.lineWidth = 3
    // 冰裂纹
    const pts: [number, number][] = []
    for (let i = 0; i < 12; i++) pts.push([40 + Math.random() * (s - 80), 40 + Math.random() * (s - 80)])
    for (const [px, py] of pts) {
      for (let j = 0; j < 3; j++) {
        const ex = px + (Math.random() - 0.5) * 120
        const ey = py + (Math.random() - 0.5) * 120
        cx.beginPath(); cx.moveTo(px, py); cx.lineTo(ex, ey); cx.stroke()
      }
    }
    cx.strokeStyle = '#3a2a18'
    cx.lineWidth = 5
    cx.strokeRect(5, 5, s - 10, s - 10)
    cx.strokeRect(s / 2 - 2, 5, 4, s - 10)
    cx.strokeRect(5, s / 2 - 2, s - 10, 4)
  })

  // ── 场景与雾 ──
  const scene = new THREE.Scene()
  const bgColor = new THREE.Color(0xe0d8cc)
  scene.background = bgColor
  scene.fog = new THREE.Fog(bgColor, 8, 18)

  // ── 灯光体系：模拟窗光为主，灯火为辅 ──
  scene.add(new THREE.AmbientLight(0xfff5e8, 0.35))

  // 窗光（右侧偏暖白光）
  const windowLight = new THREE.DirectionalLight(0xfff8ee, 0.6)
  windowLight.position.set(5, 4, 2)
  windowLight.castShadow = true
  windowLight.shadow.mapSize.set(1024, 1024)
  windowLight.shadow.bias = -0.002
  scene.add(windowLight)

  // 画作聚光灯
  const spotLight = new THREE.SpotLight(0xffeedd, 0.9, 6, Math.PI / 8, 0.4, 1)
  spotLight.position.set(0, 2.5, 0)
  spotLight.target.position.set(0, 0.3, -1.8)
  spotLight.castShadow = true
  scene.add(spotLight)
  scene.add(spotLight.target)

  // 香炉微光
  const incenseLight = new THREE.PointLight(0xffaa44, 0.15, 3)
  incenseLight.position.set(-1.8, -0.2, 0.5)
  scene.add(incenseLight)

  // ── 相机 ──
  const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 50)
  const baseDist = 3.0
  camera.position.set(0.3, 0.5, baseDist / (previewScale.value / 100))
  camera.lookAt(0, 0.2, -1.5)
  threeCamera = camera

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  el.innerHTML = ''
  el.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.target.set(0, 0.2, -1.2)
  controls.maxPolarAngle = Math.PI * 0.75
  controls.minDistance = 0.3
  controls.maxDistance = 12

  // ── 房间结构（封闭空间） ──
  const RW = 8, RH = 4.5, RD = 8
  const floorY = -1.5
  const mWall = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.92, metalness: 0, side: THREE.FrontSide })
  const mFloor = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85 })

  // 地面
  const gFloor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mFloor)
  gFloor.rotation.x = -Math.PI / 2; gFloor.position.set(0, floorY, 0)
  gFloor.receiveShadow = true; scene.add(gFloor)

  // 后墙
  const gBack = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), mWall)
  gBack.position.set(0, floorY + RH / 2, -RD / 2); gBack.receiveShadow = true; scene.add(gBack)

  // 左墙
  const gLeft = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), mWall)
  gLeft.rotation.y = Math.PI / 2; gLeft.position.set(-RW / 2, floorY + RH / 2, 0)
  gLeft.receiveShadow = true; scene.add(gLeft)

  // 右墙
  const gRight = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), mWall)
  gRight.rotation.y = -Math.PI / 2; gRight.position.set(RW / 2, floorY + RH / 2, 0)
  gRight.receiveShadow = true; scene.add(gRight)

  // 天花板
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0xf5efe6, roughness: 0.95 })
  const gCeil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), ceilMat)
  gCeil.rotation.x = Math.PI / 2; gCeil.position.set(0, floorY + RH, 0)
  scene.add(gCeil)

  // ── 墙裙（下半墙深色木板） ──
  const wainscotH = 1.0
  const wainscotMat = new THREE.MeshStandardMaterial({ map: hongmuTex, roughness: 0.7, metalness: 0.05 })
  const addWainscot = (width: number, pos: THREE.Vector3, rotY: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(width, wainscotH), wainscotMat)
    m.rotation.y = rotY; m.position.copy(pos); m.position.y = floorY + wainscotH / 2
    scene.add(m)
  }
  addWainscot(RW, new THREE.Vector3(0, 0, -RD / 2 + 0.01), 0)
  addWainscot(RD, new THREE.Vector3(-RW / 2 + 0.01, 0, 0), Math.PI / 2)
  addWainscot(RD, new THREE.Vector3(RW / 2 - 0.01, 0, 0), -Math.PI / 2)

  // ── 窗户（右墙） ──
  const winW = 1.2, winH = 1.6
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, winH + 0.12, winW + 0.12), new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.6 }))
  winFrame.rotation.y = -Math.PI / 2
  winFrame.position.set(RW / 2 - 0.03, floorY + 2.0, -0.5)
  scene.add(winFrame)

  const winPane = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshStandardMaterial({ map: windowTex, transparent: true, opacity: 0.85, side: THREE.DoubleSide }))
  winPane.rotation.y = -Math.PI / 2
  winPane.position.set(RW / 2 - 0.02, floorY + 2.0, -0.5)
  scene.add(winPane)

  // 窗外光晕
  const winGlow = new THREE.PointLight(0xfff8ee, 0.4, 5)
  winGlow.position.set(RW / 2 - 0.5, floorY + 2.0, -0.5)
  scene.add(winGlow)

  // ── 书法作品（挂后墙正中） ──
  const cardCanvas = canvasEl
  let cardTexture: InstanceType<typeof THREE.CanvasTexture> | null = null
  if (cardCanvas) {
    cardTexture = new THREE.CanvasTexture(cardCanvas)
    cardTexture.needsUpdate = true
  }

  const artAspect = cardCanvas ? cardCanvas.height / cardCanvas.width : 1.4
  const artW = 1.3, artH = artW * artAspect
  const artZ = -RD / 2 + 0.08
  const artCY = floorY + 2.2

  // 画框组（可动态更新）
  const frameGroup = new THREE.Group()
  scene.add(frameGroup)
  threeFrameGroup = frameGroup
  threeScene = scene
  threeModule = THREE

  function buildFrame(mount: string) {
    // 清空旧画框
    while (frameGroup.children.length) {
      const c = frameGroup.children[0]
      frameGroup.remove(c)
      if ((c as any).geometry) (c as any).geometry.dispose()
      if ((c as any).material) (c as any).material.dispose()
    }

    // 画作贴图（始终存在）
    const cardMat = new THREE.MeshStandardMaterial({ map: cardTexture, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -1 })
    const cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(artW, artH), cardMat)
    cardMesh.position.set(0, artCY, artZ + 0.002)
    frameGroup.add(cardMesh)

    const fDepth = 0.05

    if (mount === 'none') {
      // 无框
    } else if (mount === 'hong-mu') {
      // 红木框
      const fPad = 0.06
      const f = new THREE.Mesh(new THREE.BoxGeometry(artW + fPad * 2, artH + fPad * 2, fDepth), new THREE.MeshStandardMaterial({ color: 0x3a1808, roughness: 0.45, metalness: 0.1 }))
      f.position.set(0, artCY, artZ - fDepth / 2); f.castShadow = true; frameGroup.add(f)
    } else if (mount === 'jin-qi') {
      // 金漆框
      const fPad = 0.05
      const f = new THREE.Mesh(new THREE.BoxGeometry(artW + fPad * 2, artH + fPad * 2, fDepth), new THREE.MeshStandardMaterial({ color: 0xc8a84e, roughness: 0.3, metalness: 0.5 }))
      f.position.set(0, artCY, artZ - fDepth / 2); f.castShadow = true; frameGroup.add(f)
    } else if (mount === 'zhu-kuang') {
      // 竹框
      const fPad = 0.05
      const f = new THREE.Mesh(new THREE.BoxGeometry(artW + fPad * 2, artH + fPad * 2, fDepth), new THREE.MeshStandardMaterial({ color: 0xa0884a, roughness: 0.55, metalness: 0.05 }))
      f.position.set(0, artCY, artZ - fDepth / 2); f.castShadow = true; frameGroup.add(f)
    } else if (mount === 'ling-biao') {
      // 绫裱（宽绫边 + 细木框）
      const outerPad = 0.12
      const silk = new THREE.Mesh(new THREE.PlaneGeometry(artW + outerPad * 2, artH + outerPad * 2), new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.85 }))
      silk.position.set(0, artCY, artZ - 0.003); frameGroup.add(silk)
      const f = new THREE.Mesh(new THREE.BoxGeometry(artW + outerPad * 2 + 0.04, artH + outerPad * 2 + 0.04, 0.03), new THREE.MeshStandardMaterial({ color: 0x2a1808, roughness: 0.5 }))
      f.position.set(0, artCY, artZ - 0.02); f.castShadow = true; frameGroup.add(f)
    } else if (mount === 'xuan-he') {
      // 宣和装（天头地脚 + 隔水）
      const topH = 0.2, botH = 0.15, sideW = 0.08
      const bgW = artW + sideW * 2, bgH = artH + topH + botH
      const bg = new THREE.Mesh(new THREE.PlaneGeometry(bgW, bgH), new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.85 }))
      bg.position.set(0, artCY + (topH - botH) / 2, artZ - 0.003); frameGroup.add(bg)
      // 天头（深色绫）
      const top = new THREE.Mesh(new THREE.PlaneGeometry(bgW, topH), new THREE.MeshStandardMaterial({ color: 0x6b7b8a, roughness: 0.8 }))
      top.position.set(0, artCY + artH / 2 + topH / 2, artZ - 0.001); frameGroup.add(top)
      // 地脚
      const bot = new THREE.Mesh(new THREE.PlaneGeometry(bgW, botH), new THREE.MeshStandardMaterial({ color: 0x6b7b8a, roughness: 0.8 }))
      bot.position.set(0, artCY - artH / 2 - botH / 2, artZ - 0.001); frameGroup.add(bot)
    } else if (mount === 'jing-pian') {
      // 镜片（薄白边 + 细框）
      const pad = 0.04
      const mat2 = new THREE.Mesh(new THREE.PlaneGeometry(artW + pad * 2, artH + pad * 2), new THREE.MeshStandardMaterial({ color: 0xf0ead8, roughness: 0.9 }))
      mat2.position.set(0, artCY, artZ - 0.002); frameGroup.add(mat2)
      const f = new THREE.Mesh(new THREE.BoxGeometry(artW + pad * 2 + 0.03, artH + pad * 2 + 0.03, 0.025), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 }))
      f.position.set(0, artCY, artZ - 0.015); f.castShadow = true; frameGroup.add(f)
    } else if (mount === 'li-zhou') {
      // 立轴（卷轴 + 天地杆）
      const scrollPad = 0.06
      const bg = new THREE.Mesh(new THREE.PlaneGeometry(artW + scrollPad * 2, artH + scrollPad * 2 + 0.3), new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.85 }))
      bg.position.set(0, artCY, artZ - 0.003); frameGroup.add(bg)
      // 天杆
      const rodR = 0.02, rodLen = artW + scrollPad * 2 + 0.15
      const topRod = new THREE.Mesh(new THREE.CylinderGeometry(rodR, rodR, rodLen, 12), new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.5 }))
      topRod.rotation.z = Math.PI / 2; topRod.position.set(0, artCY + artH / 2 + scrollPad + 0.12, artZ + 0.01)
      topRod.castShadow = true; frameGroup.add(topRod)
      // 地杆（稍粗）
      const botRod = new THREE.Mesh(new THREE.CylinderGeometry(rodR * 1.3, rodR * 1.3, rodLen, 12), new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.5 }))
      botRod.rotation.z = Math.PI / 2; botRod.position.set(0, artCY - artH / 2 - scrollPad - 0.12, artZ + 0.01)
      botRod.castShadow = true; frameGroup.add(botRod)
      // 轴头
      for (const [sx, sy, r] of [[rodLen / 2, artCY + artH / 2 + scrollPad + 0.12, rodR * 1.5], [-rodLen / 2, artCY + artH / 2 + scrollPad + 0.12, rodR * 1.5], [rodLen / 2, artCY - artH / 2 - scrollPad - 0.12, rodR * 2], [-rodLen / 2, artCY - artH / 2 - scrollPad - 0.12, rodR * 2]] as [number, number, number][]) {
        const knob = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), new THREE.MeshStandardMaterial({ color: 0x2a1808, roughness: 0.4, metalness: 0.15 }))
        knob.position.set(sx, sy, artZ + 0.01); frameGroup.add(knob)
      }
    } else {
      // 默认暗色框
      const fPad = 0.05
      const f = new THREE.Mesh(new THREE.BoxGeometry(artW + fPad * 2, artH + fPad * 2, fDepth), new THREE.MeshStandardMaterial({ color: 0x2a1808, roughness: 0.5 }))
      f.position.set(0, artCY, artZ - fDepth / 2); f.castShadow = true; frameGroup.add(f)
    }
  }

  buildFrame(currentMount.value)
  threeBuildFrame = buildFrame

  // ══ 场景家具（根据 currentSceneKey 分流） ══
  const sceneKey = currentSceneKey.value

  if (sceneKey === 'gallery') {
    // ── 展厅：纯白空间 + 射灯聚焦 ──
    // 白色调墙面
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8f8f8, roughness: 0.95 })
    for (const child of [gBack, gLeft, gRight, gCeil]) {
      ;(child as any).material = whiteMat
    }
    gFloor.material = new THREE.MeshStandardMaterial({ color: 0xd0ccc4, roughness: 0.8 })

    // 画作射灯（从上方打下）
    const artSpot = new THREE.SpotLight(0xfff8ee, 1.2, 6, Math.PI / 10, 0.5, 1)
    artSpot.position.set(0, artCY + 2, artZ + 2)
    artSpot.target.position.set(0, artCY, artZ)
    artSpot.castShadow = true; scene.add(artSpot); scene.add(artSpot.target)

    // 导览台
    const pedMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.85 })
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.5), pedMat)
    pedestal.position.set(0, floorY + 0.5, 0.8); pedestal.castShadow = true; scene.add(pedestal)
    // 说明牌
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 }))
    label.position.set(0, floorY + 1.05, 0.8); label.rotation.x = -0.3; scene.add(label)

    // 旁边的雕塑底座
    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.9, 16), pedMat)
    base2.position.set(-2.5, floorY + 0.45, -1); base2.castShadow = true; scene.add(base2)
    // 抽象雕塑
    const sculpGeo = new THREE.TorusKnotGeometry(0.15, 0.05, 64, 12, 2, 3)
    const sculp = new THREE.Mesh(sculpGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.4 }))
    sculp.position.set(-2.5, floorY + 1.1, -1); sculp.castShadow = true; scene.add(sculp)

    // 对面墙挂另一幅作品（装饰用）
    const auxFrame2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 }))
    auxFrame2.rotation.y = Math.PI / 2
    auxFrame2.position.set(-RW / 2 + 0.05, floorY + 2.2, -1.5); scene.add(auxFrame2)
    const auxSpot = new THREE.SpotLight(0xfff8ee, 0.6, 5, Math.PI / 12, 0.4, 1)
    auxSpot.position.set(-RW / 2 + 0.5, floorY + 3.5, -1.5)
    auxSpot.target.position.copy(auxFrame2.position)
    scene.add(auxSpot); scene.add(auxSpot.target)

  } else if (sceneKey === 'living') {
    // ── 客厅：现代简约 ──
    // 浅灰木地板
    gFloor.material = new THREE.MeshStandardMaterial({ color: 0xc4b89a, roughness: 0.75 })

    // 沙发（简约造型）
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x6b7b8a, roughness: 0.85 })
    // 座垫
    const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.9), sofaMat)
    sofaSeat.position.set(0, floorY + 0.35, 1.8); sofaSeat.castShadow = true; scene.add(sofaSeat)
    // 靠背
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.15), sofaMat)
    sofaBack.position.set(0, floorY + 0.65, 2.2); scene.add(sofaBack)
    // 扶手
    for (const sx of [-1.2, 1.2]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.45, 0.9), sofaMat)
      arm.position.set(sx, floorY + 0.5, 1.8); scene.add(arm)
    }
    // 沙发腿
    for (const [lx, lz] of [[-1.1, 1.4], [1.1, 1.4], [-1.1, 2.2], [1.1, 2.2]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.3 }))
      leg.position.set(lx, floorY + 0.1, lz); scene.add(leg)
    }

    // 茶几
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xf0e8d5, roughness: 0.6, metalness: 0.05 })
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), tableMat)
    table.position.set(0, floorY + 0.4, 0.9); table.castShadow = true; scene.add(table)
    // 茶几腿（金属）
    const tLegMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.6 })
    for (const [lx, lz] of [[-0.5, 0.65], [0.5, 0.65], [-0.5, 1.15], [0.5, 1.15]]) {
      const tl = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), tLegMat)
      tl.position.set(lx, floorY + 0.2, lz); scene.add(tl)
    }

    // 落地灯
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.3 })
    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8), lampMat)
    lampPole.position.set(1.8, floorY + 0.9, 1.5); scene.add(lampPole)
    const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.3, 16),
      new THREE.MeshStandardMaterial({ color: 0xf5e8d0, roughness: 0.9 }))
    lampShade.position.set(1.8, floorY + 1.85, 1.5); scene.add(lampShade)
    const lampLight = new THREE.PointLight(0xfff0dd, 0.3, 4)
    lampLight.position.set(1.8, floorY + 1.7, 1.5); scene.add(lampLight)

    // 地毯
    const rugMat = new THREE.MeshStandardMaterial({ color: 0xb0a090, roughness: 0.95 })
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.0), rugMat)
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, floorY + 0.005, 1.2); scene.add(rug)

  } else if (sceneKey === 'tea') {
    // ── 茶室：日式/中式茶空间 ──
    // 榻榻米地面
    gFloor.material = new THREE.MeshStandardMaterial({ color: 0xc8b87a, roughness: 0.9 })
    // 墙面改为和纸色
    const wasiMat = new THREE.MeshStandardMaterial({ color: 0xf0e8d5, roughness: 0.92 })
    for (const child of [gBack, gLeft, gRight]) {
      ;(child as any).material = wasiMat
    }

    // 矮桌
    const tataMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.55 })
    const tataTable = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.6), tataMat)
    tataTable.position.set(0, floorY + 0.32, 0.5); tataTable.castShadow = true; scene.add(tataTable)
    for (const [lx, lz] of [[-0.4, 0.25], [0.4, 0.25], [-0.4, 0.75], [0.4, 0.75]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 0.03), tataMat)
      leg.position.set(lx, floorY + 0.16, lz); scene.add(leg)
    }

    // 茶具组（壶 + 杯）
    const tY = floorY + 0.34
    const teaMat2 = new THREE.MeshStandardMaterial({ color: 0x7a4428, roughness: 0.6 })
    const teaPot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), teaMat2)
    teaPot.scale.y = 0.7; teaPot.position.set(0, tY + 0.04, 0.5); scene.add(teaPot)
    const teaLid = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), teaMat2)
    teaLid.scale.y = 0.5; teaLid.position.set(0, tY + 0.08, 0.5); scene.add(teaLid)
    // 小杯子
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xd4c8a8, roughness: 0.4 })
    for (const cx of [-0.15, 0.15, -0.25, 0.25]) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.018, 0.035, 12), cupMat)
      cup.position.set(cx, tY + 0.02, 0.35 + (Math.abs(cx) > 0.2 ? 0.1 : 0)); scene.add(cup)
    }

    // 蒲团
    const putuanMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.85 })
    for (const pz of [-0.1, 1.1]) {
      const putuan = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16), putuanMat)
      putuan.position.set(0, floorY + 0.04, pz); scene.add(putuan)
    }

    // 花瓶（角落）
    const vaseGeo2 = new THREE.LatheGeometry([
      new THREE.Vector2(0, 0), new THREE.Vector2(0.05, 0.02),
      new THREE.Vector2(0.07, 0.1), new THREE.Vector2(0.04, 0.2),
      new THREE.Vector2(0.03, 0.25)
    ], 16)
    const vase2 = new THREE.Mesh(vaseGeo2, new THREE.MeshStandardMaterial({ color: 0x6b9e8a, roughness: 0.3, metalness: 0.15 }))
    vase2.position.set(2.5, floorY, -2.5); vase2.castShadow = true; scene.add(vase2)

    // 竹帘窗（用竹框代替原窗）
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xb5a568, roughness: 0.6 })
    const bambooFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 1.4), bambooMat)
    bambooFrame.rotation.y = -Math.PI / 2
    bambooFrame.position.set(RW / 2 - 0.03, floorY + 1.8, -0.5); scene.add(bambooFrame)

    // 挂画下方放一个小香炉
    const xiang = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.025, 12),
      new THREE.MeshStandardMaterial({ color: 0x6b6b5a, roughness: 0.4, metalness: 0.3 }))
    xiang.position.set(0, floorY + 0.01, -RD / 2 + 0.5); scene.add(xiang)
    const xiangLight = new THREE.PointLight(0xffaa44, 0.1, 2)
    xiangLight.position.set(0, floorY + 0.1, -RD / 2 + 0.5); scene.add(xiangLight)

  } else {
  // ── 书房（默认，原有家具） ──

  // ── 明式书桌 ──
  const deskY = floorY + 0.85
  const dW = 2.4, dD = 0.9, dTH = 0.05
  const dkMat = new THREE.MeshStandardMaterial({ map: hongmuTex, roughness: 0.6, metalness: 0.08 })

  // 桌面
  const dTop = new THREE.Mesh(new THREE.BoxGeometry(dW, dTH, dD), dkMat)
  dTop.position.set(0, deskY, 0.8)
  dTop.castShadow = true; dTop.receiveShadow = true; scene.add(dTop)

  // 桌腿（明式马蹄腿）
  const legH = deskY - floorY - dTH / 2
  const legGeo = new THREE.BoxGeometry(0.05, legH, 0.05)
  for (const [lx, lz] of [[-dW / 2 + 0.08, 0.8 - dD / 2 + 0.06], [dW / 2 - 0.08, 0.8 - dD / 2 + 0.06], [-dW / 2 + 0.08, 0.8 + dD / 2 - 0.06], [dW / 2 - 0.08, 0.8 + dD / 2 - 0.06]]) {
    const leg = new THREE.Mesh(legGeo, dkMat)
    leg.position.set(lx, floorY + legH / 2, lz)
    leg.castShadow = true; scene.add(leg)
  }
  // 桌撑（横枨）
  const stretchGeo = new THREE.BoxGeometry(dW - 0.3, 0.03, 0.03)
  const stretch = new THREE.Mesh(stretchGeo, dkMat)
  stretch.position.set(0, floorY + legH * 0.3, 0.8 - dD / 2 + 0.06)
  scene.add(stretch)
  const stretch2 = stretch.clone()
  stretch2.position.z = 0.8 + dD / 2 - 0.06
  scene.add(stretch2)

  // ── 太师椅（后墙前方） ──
  const chairMat = dkMat
  const chX = 0, chZ = 1.8
  // 椅座
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.5), chairMat)
  seat.position.set(chX, floorY + 0.5, chZ); seat.castShadow = true; scene.add(seat)
  // 椅腿
  for (const [cx2, cz] of [[-0.24, chZ - 0.22], [0.24, chZ - 0.22], [-0.24, chZ + 0.22], [0.24, chZ + 0.22]]) {
    const cl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.04), chairMat)
    cl.position.set(cx2, floorY + 0.25, cz); scene.add(cl)
  }
  // 椅背
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.03), chairMat)
  backPanel.position.set(chX, floorY + 0.85, chZ + 0.24); scene.add(backPanel)

  // ── 博古架（左墙） ──
  const shelfX = -RW / 2 + 0.35
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3a1a08, roughness: 0.55, metalness: 0.08 })
  // 框架
  const shW = 1.4, shH = 2.8, shD = 0.35
  // 两侧立柱
  for (const sx of [-shW / 2, shW / 2]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.04, shH, shD), shelfMat)
    pillar.position.set(shelfX, floorY + shH / 2, -1.5)
    pillar.position.x = shelfX + sx; scene.add(pillar)
  }
  // 层板
  for (let i = 0; i <= 4; i++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(shW, 0.025, shD), shelfMat)
    board.position.set(shelfX, floorY + i * (shH / 4), -1.5)
    board.castShadow = true; scene.add(board)
  }
  // 架上摆件
  const objY = (level: number) => floorY + level * (shH / 4) + 0.025
  // 青瓷花瓶（第三层）
  const vaseGeo = new THREE.LatheGeometry([
    new THREE.Vector2(0, 0), new THREE.Vector2(0.06, 0.02), new THREE.Vector2(0.08, 0.08),
    new THREE.Vector2(0.07, 0.18), new THREE.Vector2(0.04, 0.24), new THREE.Vector2(0.035, 0.28),
  ], 16)
  const vaseMat = new THREE.MeshStandardMaterial({ color: 0x6b9e8a, roughness: 0.3, metalness: 0.15 })
  const vase = new THREE.Mesh(vaseGeo, vaseMat)
  vase.position.set(shelfX - 0.2, objY(3), -1.5); vase.castShadow = true; scene.add(vase)

  // 紫砂壶（第二层）
  const potBody = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshStandardMaterial({ color: 0x7a4428, roughness: 0.65 }))
  potBody.scale.y = 0.7
  potBody.position.set(shelfX + 0.15, objY(2) + 0.04, -1.5)
  potBody.castShadow = true; scene.add(potBody)
  const potLid = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), new THREE.MeshStandardMaterial({ color: 0x7a4428, roughness: 0.65 }))
  potLid.scale.y = 0.5
  potLid.position.set(shelfX + 0.15, objY(2) + 0.08, -1.5); scene.add(potLid)

  // 线装书（第一层）
  for (let i = 0; i < 5; i++) {
    const bk = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.12), new THREE.MeshStandardMaterial({ color: [0xc8b896, 0xb8a886, 0xd4c8a8, 0xc0b090, 0xb4a478][i], roughness: 0.8 }))
    bk.position.set(shelfX - 0.35 + i * 0.025, objY(1) + 0.09, -1.5)
    scene.add(bk)
  }

  // ── 桌面文房 ──
  const tY = deskY + dTH / 2

  // 笔筒（竹节）
  const potGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.12, 12)
  const potMesh = new THREE.Mesh(potGeo, new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.5 }))
  potMesh.position.set(-0.75, tY + 0.06, 0.7); potMesh.castShadow = true; scene.add(potMesh)

  // 笔筒内毛笔
  for (let i = 0; i < 3; i++) {
    const bGeo = new THREE.CylinderGeometry(0.005, 0.008, 0.18, 6)
    const bMesh = new THREE.Mesh(bGeo, new THREE.MeshStandardMaterial({ color: 0x5a3a20 }))
    bMesh.position.set(-0.75 + (i - 1) * 0.015, tY + 0.17, 0.7 + (i - 1) * 0.01)
    bMesh.rotation.z = (i - 1) * 0.05; scene.add(bMesh)
  }

  // 砚台（端砚）
  const inkGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.035, 6)
  const inkMesh = new THREE.Mesh(inkGeo, new THREE.MeshStandardMaterial({ color: 0x1a1818, roughness: 0.25, metalness: 0.2 }))
  inkMesh.position.set(0.5, tY + 0.018, 0.65); inkMesh.castShadow = true; scene.add(inkMesh)

  // 墨条
  const inkStick = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.015, 0.12), new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.35 }))
  inkStick.position.set(0.65, tY + 0.008, 0.7); inkStick.rotation.y = 0.4; scene.add(inkStick)

  // 镇纸（铜质）
  const zhenGeo = new THREE.BoxGeometry(0.22, 0.02, 0.03)
  const zhenMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.6 })
  const zhen = new THREE.Mesh(zhenGeo, zhenMat)
  zhen.position.set(-0.1, tY + 0.01, 0.9); scene.add(zhen)

  // 宣纸（摊开在桌上）
  const paperGeo = new THREE.PlaneGeometry(0.8, 1.0)
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.9, side: THREE.DoubleSide })
  const paper = new THREE.Mesh(paperGeo, paperMat)
  paper.rotation.x = -Math.PI / 2; paper.position.set(0, tY + 0.002, 0.85)
  paper.receiveShadow = true; scene.add(paper)

  // 香炉（博山炉造型简化）
  const incenseBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.03, 12), new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.4, metalness: 0.3 }))
  incenseBase.position.set(-1.6, tY + 0.015, 0.6); scene.add(incenseBase)
  const incenseBody = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.4, metalness: 0.3 }))
  incenseBody.scale.y = 0.8; incenseBody.position.set(-1.6, tY + 0.065, 0.6); incenseBody.castShadow = true; scene.add(incenseBody)

  // 茶杯 + 茶托
  const saucerGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.008, 16)
  const teaMat = new THREE.MeshStandardMaterial({ color: 0xd4c8a8, roughness: 0.35, metalness: 0.05 })
  const saucer = new THREE.Mesh(saucerGeo, teaMat)
  saucer.position.set(0.85, tY + 0.004, 0.65); scene.add(saucer)
  const teaCup = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.05, 16), teaMat)
  teaCup.position.set(0.85, tY + 0.033, 0.65); teaCup.castShadow = true; scene.add(teaCup)

  // 线装古籍（桌面右侧叠放）
  for (let i = 0; i < 4; i++) {
    const bGeo = new THREE.BoxGeometry(0.18, 0.02, 0.12)
    const bMat = new THREE.MeshStandardMaterial({ color: [0xc8b896, 0x8b2500, 0x1a3a5c, 0xb4a478][i], roughness: 0.75 })
    const bk = new THREE.Mesh(bGeo, bMat)
    bk.position.set(1.0, tY + 0.01 + i * 0.021, 1.0)
    bk.rotation.y = 0.1 + i * 0.04; bk.castShadow = true; scene.add(bk)
  }

  // ── 右墙挂一幅山水小品（增加空间感） ──
  const auxFrameMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.5 })
  const auxFrame = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.5), auxFrameMat)
  auxFrame.position.set(RW / 2 - 0.06, floorY + 2.5, -2.0); scene.add(auxFrame)
  // 简笔山水（程序化）
  const auxTex = mkTex(128, (cx, s) => {
    cx.fillStyle = '#f0ead8'; cx.fillRect(0, 0, s, s)
    cx.strokeStyle = '#3a3a3a'; cx.lineWidth = 1.5
    cx.beginPath(); cx.moveTo(10, 90); cx.quadraticCurveTo(40, 30, 70, 60); cx.quadraticCurveTo(90, 35, 120, 70); cx.stroke()
    cx.beginPath(); cx.moveTo(20, 100); cx.quadraticCurveTo(60, 70, 110, 95); cx.stroke()
  })
  const auxArt = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.5), new THREE.MeshStandardMaterial({ map: auxTex, roughness: 0.7 }))
  auxArt.rotation.y = -Math.PI / 2; auxArt.position.set(RW / 2 - 0.04, floorY + 2.5, -2.0); scene.add(auxArt)

  } // end of scene branching (study/gallery/living/tea)

  // ── 动画 ──
  let running = true
  let time = 0
  function animate() {
    if (!running) return
    requestAnimationFrame(animate)
    time += 0.016
    controls.update()
    // 香炉微光闪烁
    incenseLight.intensity = 0.12 + Math.sin(time * 2) * 0.04
    if (cardTexture && cardCanvas) cardTexture.needsUpdate = true
    renderer.render(scene, camera)
  }
  animate()

  const onResize = () => {
    const nw = el.clientWidth || 600
    const nh = el.clientHeight || 500
    camera.aspect = nw / nh; camera.updateProjectionMatrix()
    renderer.setSize(nw, nh)
  }
  window.addEventListener('resize', onResize)

  const ro = new ResizeObserver(onResize)
  ro.observe(el)
  setTimeout(onResize, 50)

  threeCleanup = () => {
    running = false; threeCamera = null
    threeFrameGroup = null; threeScene = null; threeModule = null; threeBuildFrame = null
    ro.disconnect()
    window.removeEventListener('resize', onResize)
    renderer.dispose(); controls.dispose()
    el.innerHTML = ''
  }
}

const stampText = ref('墨韵')
const stampSizeVal = ref(56)
const stampShape = ref('square')
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
const stampFontKey = ref('xiaozhuan')
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
const currentTmplW = computed(() => CARD_TEMPLATES[currentTmpl.value].width)
const currentTmplH = computed(() => CARD_TEMPLATES[currentTmpl.value].height)
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
}

const fontLoading = ref(false)
const loadedFontFamilies = new Set<string>()

async function ensureFontReady(font: CalligraphyFont): Promise<void> {
  const info = CALLIGRAPHY_FONTS[font]
  const family = info.cssFontFamily
  if (!document.fonts) return

  // 已成功加载过的字体直接跳过
  if (loadedFontFamilies.has(family)) return

  const checkStr = poem.value.content[0]?.slice(0, 2) || '永'

  // 自托管字体：用 FontFace API 动态注册 + 加载
  const selfHostedUrl = SELF_HOSTED_FONTS[family]
  if (selfHostedUrl) {
    fontLoading.value = true
    try {
      const face = new FontFace(family, `url(${selfHostedUrl})`, {
        style: 'normal',
        weight: 'normal',
        display: 'swap',
      })
      const loaded = await face.load()
      document.fonts.add(loaded)
      loadedFontFamilies.add(family)
      console.log(`[Font] ✅ ${info.label} (${family}) loaded via FontFace API`)
    } catch (e) {
      console.warn(`[Font] ❌ ${info.label} FontFace load error:`, e)
    } finally {
      fontLoading.value = false
    }
    return
  }

  // CSS 加载的字体（Google Fonts / cn-fontsource 等）
  if (document.fonts.check(`48px "${family}"`, checkStr)) {
    loadedFontFamilies.add(family)
    return
  }

  fontLoading.value = true
  try {
    const allText = [
      ...poem.value.content,
      poem.value.title,
      stampText.value,
      colophonCalligrapher.value,
    ].join('')
    await Promise.race([
      document.fonts.load(`48px "${family}"`, allText),
      new Promise(r => setTimeout(r, 30000)),
    ])
    await document.fonts.ready
    if (document.fonts.check(`48px "${family}"`, checkStr)) {
      loadedFontFamilies.add(family)
      console.log(`[Font] ✅ ${info.label} (${family}) loaded`)
    }
  } catch (e) {
    console.warn(`[Font] ⚠️ ${info.label} CSS load error:`, e)
  } finally {
    fontLoading.value = false
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
    stampShape: stampShape.value,
    backgroundImage: bgImage.value,
    customWidth: customWidth.value || undefined,
    customHeight: customHeight.value || undefined,
    colSpacingScale: colSpacingScale.value,
    charSpacingScale: charSpacingScale.value,
  }
}

async function ensureStampFontReady(): Promise<void> {
  const fontKey = stampFontKey.value
  const fontInfo = STAMP_FONTS[fontKey]
  if (!fontInfo || !document.fonts) return

  // 从 font-family 字符串中提取第一个字体名
  const family = fontInfo.family.split(',')[0].replace(/['"]/g, '').trim()
  if (loadedFontFamilies.has('stamp_' + family)) return

  // 自托管字体 → FontFace API
  const url = SELF_HOSTED_FONTS[family]
  if (url) {
    try {
      const face = new FontFace(family, `url(${url})`, { style: 'normal', weight: 'normal', display: 'swap' })
      const loaded = await face.load()
      document.fonts.add(loaded)
      loadedFontFamilies.add('stamp_' + family)
      console.log(`[StampFont] ✅ ${fontInfo.label} (${family}) loaded via FontFace`)
    } catch (e) {
      console.warn(`[StampFont] ⚠️ ${fontInfo.label} FontFace failed:`, e)
    }
    return
  }

  // CSS @font-face 字体 → 触发加载并等待
  try {
    await document.fonts.load(`48px "${family}"`, stampText.value || '墨韵')
    await document.fonts.ready
    loadedFontFamilies.add('stamp_' + family)
    console.log(`[StampFont] ✅ ${fontInfo.label} (${family}) loaded via CSS`)
  } catch (e) {
    console.warn(`[StampFont] ⚠️ ${fontInfo.label} CSS load failed:`, e)
  }
}

async function renderCard() {
  await ensureFontReady(currentFont.value)
  await ensureStampFontReady()

  const tmpl = CARD_TEMPLATES[currentTmpl.value]
  const realW = customWidth.value || tmpl.width
  const realH = customHeight.value || tmpl.height

  // 手机端需要扣除装裱的额外宽度
  const mountExtra = (() => {
    const cfg = MOUNT_CANVAS[currentMount.value]
    if (!cfg) return 0
    return (cfg.padding[1] + cfg.padding[3] + cfg.margin * 2) * 2 // 装裱 padding + margin 两侧
  })()
  const availW = window.innerWidth - 32 - mountExtra // 32px = 两侧安全边距
  const baseW = Math.min(343, availW)
  const displayW = Math.round(baseW * previewScale.value / 100)
  const scale = displayW / realW
  const displayH = realH * scale

  if (!canvasEl) {
    canvasEl = document.createElement('canvas')
    canvasEl.id = 'calligraphyCanvas'
    canvasEl.style.borderRadius = '4px'
    canvasEl.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
  }

  // 挂载到 2D 容器（如果存在且尚未挂载）
  const container = document.querySelector('.card-container') as HTMLElement
  if (container && !container.contains(canvasEl)) {
    container.appendChild(canvasEl)
  }

  canvasEl.width = realW
  canvasEl.height = realH
  canvasEl.style.width = `${displayW}px`
  canvasEl.style.height = `${displayH}px`

  const ctx = canvasEl.getContext('2d')
  if (!ctx) return

  renderCalligraphyCard(ctx, buildRenderOptions())

  // 3D 模式下需要重建画框（canvas 尺寸/内容可能变化）
  if (preview3DMode.value === '3d' && threeBuildFrame) {
    rebuild3DTexture()
  }
}

/** 用户原始输入信息 */
const userInput = ref<{ prompt?: string; genre?: string; style?: string; images?: string[] }>({})

function checkMobileResult() {
  isMobileResult.value = window.innerWidth < 768
}

onMounted(async () => {
  checkMobileResult()
  window.addEventListener('resize', checkMobileResult)
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const query = currentPage?.$page?.options || currentPage?.options || {}
  if (query?.from === 'storage') {
    // 从 localStorage 读取（推荐方式，避免超长 URL）
    try {
      const poemRaw = uni.getStorageSync('moyun_nav_poem')
      if (poemRaw) poem.value = JSON.parse(poemRaw)
      const inputRaw = uni.getStorageSync('moyun_nav_input')
      if (inputRaw) userInput.value = JSON.parse(inputRaw)
    } catch (e) {
      console.error('解析诗词数据失败', e)
    }
    uni.removeStorageSync('moyun_nav_poem')
    uni.removeStorageSync('moyun_nav_input')
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
  checkFavorited()
  setupDividerEvents()
  setupTiltEvents()
  setTimeout(async () => {
    await renderCard()
  }, 100)
})

watch(
  [currentFont, currentBg, currentTmpl, currentBorder, currentTexture, currentTextureType, textureStrength, fontScale, stampText, stampSizeVal, stampShape, stampPosition, stampFontKey, stampX, stampY, offsetX, offsetY, previewScale, colophonCalligrapher, colophonVerb, colophonShowDate, colophonOffsetX, colophonOffsetY, colophonLayout, colSpacingScale, charSpacingScale, customWidth, customHeight, currentMount],
  async () => {
    await renderCard()
    if (showSharePanel.value) updatePosterPreview()
  },
)

watch(previewScale, (val) => {
  if (threeCamera && preview3DMode.value === 'scene') {
    threeCamera.position.z = 3.0 / (val / 100)
  }
  if (threeCamera && preview3DMode.value === '3d') {
    threeCamera.position.z = 6.5 / (val / 100)
  }
})

// 存储 buildFrame 引用
let threeBuildFrame: ((mount: string) => void) | null = null

watch(() => currentMount.value, (val) => {
  if (threeBuildFrame && (preview3DMode.value === 'scene' || preview3DMode.value === '3d')) {
    threeBuildFrame(val)
  }
})

watch([showSharePanel, posterTemplate], async () => {
  if (showSharePanel.value) {
    if (!posterImage.value && userInput.value.images?.length) {
      posterImage.value = userInput.value.images[0]
    }
    await nextTick()
    updatePosterPreview()
  }
})

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

function selectMount(style: MountStyle) {
  currentMount.value = style
}

function onChangeMount() {
  showMountPanel.value = !showMountPanel.value
}

function selectBorder(style: BorderStyle) {
  currentBorder.value = style
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

/* ── 收藏功能 ── */
const FAVORITES_KEY = 'moyun_favorites'
const isFavorited = ref(false)

function getFavorites(): any[] {
  try { return JSON.parse(uni.getStorageSync(FAVORITES_KEY) || '[]') } catch { return [] }
}

function checkFavorited() {
  const favs = getFavorites()
  isFavorited.value = favs.some((f: any) => f.poem.title === poem.value.title && f.poem.content?.join('') === poem.value.content?.join(''))
}

function onToggleFavorite() {
  const favs = getFavorites()
  const idx = favs.findIndex((f: any) => f.poem.title === poem.value.title && f.poem.content?.join('') === poem.value.content?.join(''))
  if (idx >= 0) {
    favs.splice(idx, 1)
    isFavorited.value = false
    uni.showToast({ title: '已取消收藏', icon: 'none' })
  } else {
    favs.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      poem: { ...poem.value },
      createdAt: new Date().toISOString(),
      font: currentFont.value,
      mount: currentMount.value,
    })
    if (favs.length > 200) favs.pop()
    isFavorited.value = true
    uni.showToast({ title: '已收藏', icon: 'success' })
  }
  uni.setStorageSync(FAVORITES_KEY, JSON.stringify(favs))
}

/* ── 分享计数 ── */
function incrementShareCount() {
  const count = Number(uni.getStorageSync('moyun_share_count') || '0')
  uni.setStorageSync('moyun_share_count', String(count + 1))
}

async function onSaveImage() {
  const result = await exportWithMount(2)
  if (!result) return

  const url = URL.createObjectURL(result.blob)
  const link = document.createElement('a')
  link.download = `墨韵_${poem.value.title}_${result.width}x${result.height}.png`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
  uni.showToast({ title: '高清图已保存', icon: 'success' })
}

/** 印刷级导出：高 DPI + 出血线 + 裁切标记 */
async function exportForPrint() {
  const info = printOutputInfo.value
  const canvas = await renderPrintCanvas(info)
  if (!canvas) return

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const sizeName = PRINT_SIZES.find(s => s.key === printSize.value)?.label || printSize.value
    link.download = `墨韵_${poem.value.title}_${sizeName}_${printDPI.value}DPI_${info.widthPx}x${info.heightPx}.png`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
    uni.showToast({ title: `印刷级 PNG 已导出（${info.widthPx}×${info.heightPx}）`, icon: 'none', duration: 2500 })
  }, 'image/png')
}

/** TIFF 导出（浏览器原生不支持 TIFF，用无压缩 PNG 代替并标注） */
async function exportForPrintTIFF() {
  const info = printOutputInfo.value
  const canvas = await renderPrintCanvas(info)
  if (!canvas) return

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const sizeName = PRINT_SIZES.find(s => s.key === printSize.value)?.label || printSize.value
    link.download = `墨韵_${poem.value.title}_${sizeName}_${printDPI.value}DPI_印刷级.png`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
    uni.showToast({ title: '高精度文件已导出（PNG 无损格式，印刷厂可直接使用）', icon: 'none', duration: 3000 })
  }, 'image/png')
}

/** 渲染印刷级 Canvas（含出血、裁切标记、CMYK 模拟） */
async function renderPrintCanvas(info: { widthPx: number; heightPx: number; bleedPx: number; widthMm: number; heightMm: number; bleedMm: number }) {
  const { widthPx, heightPx, bleedPx } = info

  const tmpl = CARD_TEMPLATES[currentTmpl.value]
  const cardW = customWidth.value || tmpl.width
  const cardH = customHeight.value || tmpl.height
  const mount = currentMount.value
  const cfg = MOUNT_CANVAS[mount]
  const [pt, pr, pb, pl] = cfg.padding
  const m = cfg.margin
  const [rodTop, rodBot] = cfg.rodHeight ?? [0, 0]
  const contentW = cardW + pl + m * 2 + pr
  const contentH = cardH + pt + m * 2 + pb + rodTop + rodBot

  const contentAreaW = widthPx - bleedPx * 2
  const contentAreaH = heightPx - bleedPx * 2

  const scaleX = contentAreaW / contentW
  const scaleY = contentAreaH / contentH
  const scale = Math.min(scaleX, scaleY)

  const canvas = document.createElement('canvas')
  canvas.width = widthPx
  canvas.height = heightPx
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // 白底
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, widthPx, heightPx)

  // 内容居中绘制
  const drawW = contentW * scale
  const drawH = contentH * scale
  const offsetX = bleedPx + (contentAreaW - drawW) / 2
  const offsetY = bleedPx + (contentAreaH - drawH) / 2

  ctx.save()
  ctx.translate(offsetX, offsetY)
  ctx.scale(scale, scale)

  await ensureFontReady(currentFont.value)

  // 装裱底色
  if (mount !== 'none') {
    ctx.save()
    ctx.translate(0, rodTop)
    cfg.draw(ctx, contentW, contentH - rodTop - rodBot)
    ctx.restore()
  }
  if (cfg.extra) {
    ctx.save()
    ctx.translate(0, rodTop)
    cfg.extra(ctx, contentW, contentH - rodTop - rodBot)
    ctx.restore()
  }

  // 画心
  ctx.save()
  ctx.translate(pl + m, pt + m + rodTop)
  renderCalligraphyCard(ctx, buildRenderOptions())
  ctx.restore()
  ctx.restore()

  // CMYK 模拟：轻微去饱和，模拟印刷色域损失
  if (printColorHint.value === 'cmyk-hint') {
    const imgData = ctx.getImageData(0, 0, widthPx, heightPx)
    const d = imgData.data
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2]
      d[i] = Math.round(r * 0.93 + g * 0.04 + b * 0.03)
      d[i + 1] = Math.round(r * 0.03 + g * 0.92 + b * 0.05)
      d[i + 2] = Math.round(r * 0.03 + g * 0.05 + b * 0.88)
    }
    ctx.putImageData(imgData, 0, 0)
  }

  // 裁切标记
  if (printCropMarks.value && bleedPx > 0) {
    const markLen = Math.min(bleedPx * 0.8, 20)
    const markOffset = 4
    ctx.save()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1

    const corners = [
      [bleedPx, bleedPx],
      [widthPx - bleedPx, bleedPx],
      [bleedPx, heightPx - bleedPx],
      [widthPx - bleedPx, heightPx - bleedPx],
    ]

    for (const [cx, cy] of corners) {
      const isLeft = cx <= widthPx / 2
      const isTop = cy <= heightPx / 2

      // 水平线
      ctx.beginPath()
      ctx.moveTo(isLeft ? cx - bleedPx + markOffset : cx + markOffset, cy)
      ctx.lineTo(isLeft ? cx - bleedPx + markOffset + markLen : cx + bleedPx - markOffset - markLen, cy)
      ctx.stroke()

      // 垂直线
      ctx.beginPath()
      ctx.moveTo(cx, isTop ? cy - bleedPx + markOffset : cy + markOffset)
      ctx.lineTo(cx, isTop ? cy - bleedPx + markOffset + markLen : cy + bleedPx - markOffset - markLen)
      ctx.stroke()
    }

    // 角标注出血区域（浅色虚线框）
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'
    ctx.strokeRect(bleedPx, bleedPx, widthPx - bleedPx * 2, heightPx - bleedPx * 2)
    ctx.setLineDash([])

    ctx.restore()
  }

  // 印刷信息标注（出血区内小字）
  if (printCropMarks.value && bleedPx > 8) {
    ctx.save()
    const fontSize = Math.max(8, Math.min(bleedPx * 0.4, 14))
    ctx.font = `${fontSize}px sans-serif`
    ctx.fillStyle = '#999999'
    ctx.textBaseline = 'top'
    const sizeName = PRINT_SIZES.find(s => s.key === printSize.value)?.label || ''
    const label = `墨韵AI · ${sizeName} · ${printDPI.value}DPI · ${info.widthMm}×${info.heightMm}mm`
    ctx.fillText(label, bleedPx, heightPx - bleedPx + 4)
    ctx.restore()
  }

  return canvas
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
  const result = await exportWithMount(2)
  const blob = result?.blob ?? null
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
      incrementShareCount()
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
  incrementShareCount()
  uni.showToast({ title: '图片已保存，可发送给好友', icon: 'none', duration: 2500 })
}
</script>

<style lang="scss">
/* 青柳隷书（ZeoSeven CDN，免费商用日本隶书） */
@import url("https://fontsapi.zeoseven.com/2204/main/result.css");

/* 阿里妈妈刀隶体 @font-face（fontpkg 原始文件） */
@font-face {
  font-family: 'Alimama DaoLiTi';
  src: url('@fontpkg/alimama-dao-li-ti/AlimamaDaoLiTi.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* 自托管字体通过 JS FontFace API 动态加载，见 ensureFontReady() */


$color-paper: var(--c-paper);
$color-ink: var(--c-ink);
$color-vermilion: var(--c-vermilion);
$color-mountain: var(--c-mountain);
$font-calligraphy: var(--ui-font);
$nav-height: 48px;
$breakpoint: 768px;

.page {
  min-height: 100vh;
  background-color: $color-paper;
  font-family: $font-calligraphy;
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
  box-sizing: border-box;

  @media (min-width: $breakpoint) {
    padding: 0 16px;
    overflow-y: auto;
    max-height: calc(100vh - #{$nav-height} - 40px);
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
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
    padding-right: 4px;
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
  position: relative;
  &::-webkit-scrollbar { display: none; }
}
.card-section .scene3d-container {
  align-self: stretch;
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


// ── 预览工具栏 ──
.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 6px 8px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(232,228,223,0.06);
}
.preview-toolbar .preview-zoom-bar {
  flex: 1;
  padding: 0;
}
.preview-toolbar .preview-3d-bar {
  padding: 0;
  flex-shrink: 0;
}
.preview-3d-bar {
  display: flex;
  gap: 4px;
}
.preview-3d-chip {
  padding: 3px 14px;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
  background: rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid rgba(0,0,0,0.08);
  &.active {
    color: var(--c-vermilion);
    background: rgba(204,51,51,0.1);
    border-color: rgba(204,51,51,0.3);
  }
}
.tilt-wrapper {
  position: relative;
  transition: transform 0.1s ease-out;
  transform-style: preserve-3d;
  max-width: 100%;
  overflow: visible;
  will-change: transform;
  &.tilt-active {
    cursor: grab;
  }
}
.tilt-glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  z-index: 10;
}
.scene3d-container {
  width: 100% !important;
  flex: 1;
  min-height: 300px;
  border-radius: 0;
  overflow: hidden;
  background: #e0d8cc;
  position: relative;
  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
}
.frame3d-wrap {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  background: #f5f2ed;

  &:fullscreen {
    background: #f5f2ed;
    .scene3d-container {
      width: 100% !important;
      height: 100% !important;
      flex: 1;
    }
    .frame3d-toolbar {
      bottom: 20px;
      right: 20px;
    }
    .recording-indicator {
      top: 20px;
      left: 20px;
    }
    .record-settings {
      bottom: 56px;
      right: 20px;
    }
  }
}
.frame3d-wrap .scene3d-container {
  flex: 1;
  min-height: 0;
}
.scene-selector {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(6px);
}
.scene-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  &:hover { background: rgba(0,0,0,0.06); }
  &.active {
    color: #fff;
    background: #5b7f95;
  }
}
.scene-chip-icon { font-size: 14px; }
.scene-chip-label { white-space: nowrap; }

.frame3d-toolbar {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 100;
  display: flex;
  gap: 8px;
  align-items: center;
}
.recording-indicator {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 4px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
}
.rec-dot {
  color: #ff3333;
  font-size: 14px;
  animation: recBlink 1s ease-in-out infinite;
}
.rec-text {
  color: #fff;
  font-size: 12px;
  font-family: monospace;
}
@keyframes recBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.record-settings {
  position: absolute;
  bottom: 44px;
  right: 12px;
  z-index: 101;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  min-width: 200px;
}
.rec-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  &:last-child { margin-bottom: 0; }
}
.rec-label {
  font-size: 12px;
  color: #888;
  width: 32px;
  flex-shrink: 0;
}
.rec-options {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.rec-option {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
  background: rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  &:hover { background: rgba(0,0,0,0.1); }
  &.active {
    color: #fff;
    background: #5b7f95;
  }
}
.grid-toggle {
  padding: 5px 14px;
  border-radius: 4px;
  font-size: 12px;
  color: #888;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  pointer-events: auto;
  white-space: nowrap;
  &:hover { background: rgba(255,255,255,0.92); color: #555; }
  &.active { color: #5b7f95; }
  &.recording { color: #ff3333; }
  &.recording:hover { background: rgba(255,220,220,0.92); }
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

// 红木框：花梨木纹 — 3D立体效果
.mount-hong-mu {
  .card-container { margin: 5px; }
  .mount-mat {
    padding: 20px;
    position: relative;
    border-radius: 1px;
    // 外框主体木纹
    background: linear-gradient(160deg,
      #6b3418 0%, #8b4c28 8%, #5c2e0e 20%,
      #7a3d1a 35%, #6b3015 50%, #8b4c28 65%,
      #5c2e0e 80%, #7a3d1a 92%, #6b3418 100%
    );
    // 3D光影：上/左高光，下/右阴影，投影
    box-shadow:
      // 墙面投影
      6px 8px 24px rgba(0, 0, 0, 0.35),
      2px 3px 8px rgba(0, 0, 0, 0.2),
      // 框外缘高光（上/左）
      inset 0 2px 0 rgba(255, 220, 180, 0.15),
      inset 2px 0 0 rgba(255, 220, 180, 0.08),
      // 框外缘阴影（下/右）
      inset 0 -2px 0 rgba(0, 0, 0, 0.4),
      inset -2px 0 0 rgba(0, 0, 0, 0.25),
      // 内侧倒角阴影（凹进去的感觉）
      inset 0 0 8px 2px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(40, 15, 5, 0.9);

    // 内边框倒角（斜面高光）
    &::before {
      content: '';
      position: absolute;
      inset: 4px;
      border-top: 2px solid rgba(255, 220, 180, 0.12);
      border-left: 2px solid rgba(255, 220, 180, 0.06);
      border-bottom: 2px solid rgba(0, 0, 0, 0.2);
      border-right: 2px solid rgba(0, 0, 0, 0.15);
      pointer-events: none;
    }
    // 最内侧卡纸线
    &::after {
      content: '';
      position: absolute;
      inset: 10px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
      pointer-events: none;
    }
  }
}

// 金漆框：鎏金宫廷风 — 3D立体效果
.mount-jin-qi {
  .card-container { margin: 5px; }
  .mount-mat {
    padding: 20px;
    position: relative;
    border-radius: 1px;
    background: linear-gradient(150deg,
      #9a7209 0%, #c49a1a 10%, #f0d060 22%,
      #ffd700 35%, #e8b820 50%, #c49a1a 62%,
      #daa520 75%, #f0d060 88%, #b8860b 100%
    );
    box-shadow:
      6px 8px 24px rgba(0, 0, 0, 0.3),
      2px 3px 8px rgba(100, 70, 0, 0.15),
      // 金属高光
      inset 0 2px 0 rgba(255, 245, 200, 0.5),
      inset 2px 0 0 rgba(255, 245, 200, 0.2),
      inset 0 -2px 0 rgba(100, 60, 0, 0.4),
      inset -2px 0 0 rgba(100, 60, 0, 0.2),
      inset 0 0 6px 2px rgba(100, 60, 0, 0.1);
    border: 1px solid rgba(150, 100, 10, 0.8);

    &::before {
      content: '';
      position: absolute;
      inset: 5px;
      border-top: 2px solid rgba(255, 245, 200, 0.35);
      border-left: 2px solid rgba(255, 245, 200, 0.15);
      border-bottom: 2px solid rgba(80, 50, 0, 0.3);
      border-right: 2px solid rgba(80, 50, 0, 0.2);
      pointer-events: none;
    }
    &::after {
      content: '';
      position: absolute;
      inset: 11px;
      border: 1px solid rgba(100, 70, 0, 0.15);
      box-shadow: inset 0 1px 3px rgba(100, 60, 0, 0.12);
      pointer-events: none;
    }
  }
}

// 竹框：文人气质 — 3D立体效果
.mount-zhu-kuang {
  .card-container { margin: 5px; }
  .mount-mat {
    padding: 16px;
    position: relative;
    border-radius: 2px;
    background: linear-gradient(175deg,
      #d4c48a 0%, #c8b87a 10%, #b5a568 30%,
      #a89555 50%, #b5a568 70%, #c8b87a 90%, #d4c48a 100%
    );
    box-shadow:
      5px 7px 20px rgba(0, 0, 0, 0.18),
      2px 3px 6px rgba(0, 0, 0, 0.1),
      inset 0 2px 0 rgba(255, 255, 230, 0.25),
      inset 2px 0 0 rgba(255, 255, 230, 0.1),
      inset 0 -2px 0 rgba(80, 60, 20, 0.2),
      inset -2px 0 0 rgba(80, 60, 20, 0.1),
      inset 0 0 4px rgba(80, 60, 20, 0.08);
    border: 1px solid rgba(140, 120, 60, 0.6);

    // 竹节
    &::before, &::after {
      content: '';
      position: absolute;
      left: 2px; right: 2px;
      height: 3px;
      background: linear-gradient(90deg,
        transparent 0%, rgba(80, 60, 20, 0.12) 15%,
        rgba(80, 60, 20, 0.18) 50%,
        rgba(80, 60, 20, 0.12) 85%, transparent 100%
      );
      border-top: 1px solid rgba(255, 255, 230, 0.1);
    }
    &::before { top: 35%; }
    &::after { top: 68%; }
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
// ── 标题区 ──
.panel-title-bar {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 6px 4px 8px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  margin-bottom: 6px;
}
.panel-title-text {
  font-family: $font-calligraphy;
  font-size: 14px;
  color: var(--c-ink);
  letter-spacing: 2px;
}
.panel-title-sub {
  font-size: 11px;
  color: #aaa;
  font-family: $font-calligraphy;
  letter-spacing: 1px;
}

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


.control-panel {
  width: 100%;
  padding: 20px 28px;
  background-color: $color-paper;
  border: 1px solid var(--c-border);
  border-top: 2px solid color-mix(in srgb, var(--c-vermilion) 25%, transparent);
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
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
  background: transparent;
  border: 1px solid var(--c-ink-06);
  border-radius: 3px;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s;

  @media (hover: hover) {
    &:hover {
      border-color: var(--c-ink-12);
      background: rgba(0,0,0,0.01);
    }
  }

  &:active {
    opacity: 0.85;
  }

  &--slider {
    cursor: default;

    @media (hover: hover) {
      &:hover {
        border-color: var(--c-ink-06);
        background: transparent;
      }
    }

    &:active {
      opacity: 1;
    }
  }
}

.selector-label {
  font-family: $font-calligraphy;
  font-size: 16px;
  color: var(--c-ink);
  line-height: 1;
  letter-spacing: 2px;
}

.selector-name {
  font-size: 11px;
  color: #aaa;
  letter-spacing: 0.5px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
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

// ── 落款 · 印章 传统面板 ──
.ink-section {
  margin-top: 10px;
}
.ink-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
}
.ink-section-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ink-section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 12px;
  font-family: $font-calligraphy;
  color: var(--c-ink);
  border: 1px solid var(--c-ink-25, rgba(0,0,0,0.12));
  border-radius: 1px;
  letter-spacing: 0;
  opacity: 0.6;
}
.ink-section-icon--seal {
  color: #cc3333;
  border-color: rgba(204,51,51,0.4);
  opacity: 0.8;
}
.ink-section-title {
  font-family: $font-calligraphy;
  font-size: 16px;
  font-weight: 500;
  color: var(--c-ink);
  letter-spacing: 3px;
}
.ink-section-arrow {
  font-size: 18px;
  color: #bbb;
  transition: transform 0.25s;
  transform: rotate(-90deg);
  &.open { transform: rotate(90deg); }
}
.ink-section-body {
  padding: 4px 4px 10px;
}

// ── 字段行 ──
.ink-field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
}
.ink-field--slider { gap: 8px; }
.ink-field-value {
  font-size: 12px;
  color: #5b7f95;
  font-family: $font-calligraphy;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}
.ink-field-label {
  flex-shrink: 0;
  width: 36px;
  font-size: 13px;
  font-family: $font-calligraphy;
  color: #888;
  letter-spacing: 1px;
  text-align: justify;
  text-align-last: justify;
}
.ink-field-input {
  flex: 1;
  height: 30px;
  padding: 0 6px;
  font-family: $font-calligraphy;
  font-size: 16px;
  color: var(--c-ink);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--c-ink-06, rgba(0,0,0,0.06));
  letter-spacing: 3px;
  text-align: center;
  &:focus { border-bottom-color: #5b7f95; outline: none; }
}

// ── 印章风格选择项 ──
.ink-seal-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  flex: 1;
}
.ink-seal-chip {
  padding: 4px 12px;
  font-size: 13px;
  font-family: $font-calligraphy;
  color: #bbb;
  letter-spacing: 1px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  transition: all 0.2s;
  &:active { opacity: 0.7; }
  &.active {
    color: var(--c-ink);
    border-color: var(--c-ink-25, rgba(0,0,0,0.1));
    background: rgba(0,0,0,0.02);
  }
}

// ── 日期开关 ──
.ink-date-toggle {
  font-size: 13px;
  font-family: $font-calligraphy;
  color: #bbb;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 3px 10px;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 2px;
  transition: all 0.2s;
  &.active {
    color: #5b7f95;
    border-color: rgba(91,127,149,0.25);
  }
}

// ── 统一滑块 ──
.ink-slider {
  flex: 1;
  margin: 0;
  padding: 0 4px;
}

// ── 竖排预览卡 ──
.ink-preview-card {
  margin-top: 6px;
  padding: 10px 14px;
  display: flex;
  justify-content: center;
}
.ink-preview-cols {
  display: flex;
  gap: 10px;
  direction: rtl;
}
.ink-preview-col {
  writing-mode: vertical-rl;
  font-size: 13px;
  color: var(--c-ink);
  font-family: $font-calligraphy;
  letter-spacing: 2px;
  line-height: 1.6;
}

// ── 印章面板 ──
.ink-stamp-font-sel {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 2px 0;
  &:active { opacity: 0.7; }
}
.ink-stamp-font-preview {
  font-size: 18px;
  color: #cc3333;
}
.ink-stamp-font-name {
  font-size: 12px;
  font-family: $font-calligraphy;
  color: #999;
}
.ink-stamp-pos {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ink-pos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  width: 72px;
}
.ink-pos-cell {
  aspect-ratio: 1;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  &:active { opacity: 0.7; }
  &.active {
    border-color: #cc3333;
    background: rgba(204,51,51,0.04);
  }
}
.ink-pos-mark {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ddd;
  .ink-pos-cell.active & { background: #cc3333; }
  &--top-left { top: 3px; left: 3px; }
  &--top-right { top: 3px; right: 3px; }
  &--bottom-left { bottom: 3px; left: 3px; }
  &--bottom-right { bottom: 3px; right: 3px; }
}
.ink-pos-hint {
  font-size: 11px;
  color: #ccc;
  font-family: $font-calligraphy;
}

// ── 以下保留旧 class 兼容 ──
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

.stamp-shape-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.stamp-shape-btn {
  padding: 4px 10px;
  border: 1px solid var(--c-ink-12);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: var(--c-mountain); }
  &.active {
    border-color: $color-vermilion;
    background: rgba(199, 62, 29, 0.08);
    .stamp-shape-label { color: $color-vermilion; }
  }
}
.stamp-shape-label {
  font-family: $font-calligraphy;
  font-size: 12px;
  color: var(--c-ink-65);
  letter-spacing: 1px;
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

.font-loading-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: $color-mountain;
  opacity: 0.8;
  margin-top: 6px;
  letter-spacing: 2px;
  animation: fontPulse 1.2s ease-in-out infinite;
}

@keyframes fontPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
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

  &--fav .action-btn-text::before { content: none; }
  &--fav .action-btn-icon {
    font-size: 15px;
    margin-right: 3px;
    color: var(--c-ink-45);
    transition: color 0.3s, transform 0.3s;
  }
  &--fav.is-fav .action-btn-icon {
    color: $color-vermilion;
    transform: scale(1.15);
  }
  &--save .action-btn-text::before { color: $color-vermilion; }
  &--copy .action-btn-text::before { color: $color-mountain; }
  &--share .action-btn-text::before { color: var(--c-gold); }
  &--print .action-btn-text::before { color: #6b8e8e; }
}

/* ── 印刷导出面板 ── */
.print-panel {
  background: var(--c-paper-card);
  border: 1px solid var(--c-ink-08);
  border-radius: 12px;
  padding: 20px;
  margin-top: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.print-panel-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; padding-bottom: 12px;
  border-bottom: 1px solid var(--c-ink-08);
}
.print-panel-title {
  font-family: $font-calligraphy;
  font-size: 16px; font-weight: 600; letter-spacing: 2px;
  color: var(--c-ink-85);
}
.print-panel-close {
  font-size: 20px; color: var(--c-ink-45); cursor: pointer;
  width: 28px; height: 28px; text-align: center; line-height: 28px;
  border-radius: 50%;
  &:hover { background: var(--c-ink-06); }
}
.print-row {
  margin-bottom: 14px;
}
.print-label {
  display: block; font-size: 13px; color: var(--c-ink-65);
  margin-bottom: 8px; letter-spacing: 1px;
}
.print-chips {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.print-chip {
  padding: 5px 14px; border-radius: 16px; font-size: 12px;
  background: var(--c-ink-06); color: var(--c-ink-65);
  cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
  border: 1px solid transparent;
  &.active {
    background: rgba(91, 127, 149, 0.12);
    color: #5b7f95;
    border-color: rgba(91, 127, 149, 0.3);
    font-weight: 500;
  }
}
.print-info {
  background: var(--c-ink-04); border-radius: 8px;
  padding: 12px 14px; margin: 16px 0;
}
.print-info-text {
  display: block; font-size: 12px; color: var(--c-ink-55);
  line-height: 1.6; font-family: 'Courier New', monospace;
}
.print-info-bleed {
  color: #b8860b; margin-top: 4px;
}
.print-actions {
  display: flex; gap: 10px;
}
.print-export-btn {
  flex: 1; text-align: center;
  padding: 12px 0; border-radius: 8px;
  background: linear-gradient(135deg, #5b7f95, #4a6a7e);
  cursor: pointer; transition: opacity 0.2s;
  &:active { opacity: 0.85; }
  &--tiff {
    background: linear-gradient(135deg, #6b8e8e, #557a7a);
  }
}
.print-export-text {
  font-size: 14px; color: #fff; letter-spacing: 1px;
  font-family: $font-calligraphy;
}

/* ── 分享海报面板 ── */
.share-panel {
  background: var(--c-paper-card);
  border: 1px solid var(--c-ink-08);
  border-radius: 12px;
  padding: 20px;
  margin-top: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.share-panel-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; padding-bottom: 12px;
  border-bottom: 1px solid var(--c-ink-08);
}
.share-panel-title {
  font-family: $font-calligraphy;
  font-size: 16px; font-weight: 600; letter-spacing: 2px;
  color: var(--c-ink-85);
}
.share-panel-close {
  font-size: 20px; color: var(--c-ink-45); cursor: pointer;
  width: 28px; height: 28px; text-align: center; line-height: 28px;
  border-radius: 50%;
  &:hover { background: var(--c-ink-06); }
}
.share-row {
  margin-bottom: 14px;
}
.share-label {
  display: block; font-size: 13px; color: var(--c-ink-65);
  margin-bottom: 8px; letter-spacing: 1px;
}
.share-chips {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.share-chip {
  padding: 5px 14px; border-radius: 16px; font-size: 12px;
  background: var(--c-ink-06); color: var(--c-ink-65);
  cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
  border: 1px solid transparent;
  &.active {
    background: rgba(91, 127, 149, 0.12);
    color: #5b7f95;
    border-color: rgba(91, 127, 149, 0.3);
    font-weight: 500;
  }
}
.poster-images {
  display: flex; align-items: center; gap: 12px;
}
.poster-img-item {
  position: relative; width: 64px; height: 64px; border-radius: 8px; overflow: hidden;
  border: 1px solid var(--c-ink-08);
}
.poster-img-thumb {
  width: 64px; height: 64px;
}
.poster-img-remove {
  position: absolute; top: -1px; right: -1px;
  width: 20px; height: 20px; line-height: 20px; text-align: center;
  background: rgba(0,0,0,0.5); color: #fff; font-size: 14px;
  border-radius: 0 8px 0 8px; cursor: pointer;
}
.poster-img-add {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 64px; height: 64px; border-radius: 8px;
  border: 1px dashed var(--c-ink-15); cursor: pointer;
  transition: border-color 0.2s;
  &:active { border-color: #5b7f95; }
}
.poster-img-add-icon {
  font-size: 20px; color: var(--c-ink-25); line-height: 1;
}
.poster-img-add-text {
  font-size: 10px; color: var(--c-ink-35); margin-top: 2px;
}
.poster-preview-wrap {
  display: flex; justify-content: center; align-items: center;
  padding: 16px; min-height: 200px;
  background: var(--c-ink-04); border-radius: 8px;
  margin-bottom: 14px;
}
.poster-preview-img {
  width: 280px;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.poster-preview-loading {
  font-size: 13px; color: var(--c-ink-35);
  letter-spacing: 1px;
}
.share-actions {
  display: flex; gap: 10px; margin-bottom: 16px;
}
.share-action-btn {
  flex: 1; text-align: center;
  padding: 12px 0; border-radius: 8px;
  cursor: pointer; transition: opacity 0.2s;
  &:active { opacity: 0.85; }
  &--poster {
    background: linear-gradient(135deg, #c06040, #a04828);
  }
  &--direct {
    background: linear-gradient(135deg, #5b7f95, #4a6a7e);
  }
}
.share-action-text {
  font-size: 14px; color: #fff; letter-spacing: 1px;
  font-family: $font-calligraphy;
}
.share-copy-box {
  background: var(--c-ink-04); border-radius: 8px;
  padding: 14px 16px; cursor: pointer;
  position: relative; transition: background 0.2s;
  &:active { background: var(--c-ink-08); }
}
.share-copy-text {
  display: block; font-size: 13px; color: var(--c-ink-65);
  line-height: 1.8; white-space: pre-wrap; word-break: break-all;
}
.share-copy-hint {
  display: block; text-align: right; margin-top: 8px;
  font-size: 11px; color: var(--c-ink-35); letter-spacing: 1px;
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
    border-color: rgba(232, 228, 223, 0.06);
    border-top-color: rgba(224, 96, 64, 0.25);
  }
  .selector {
    background: transparent !important;
    border-color: rgba(232, 228, 223, 0.06);
  }
  .selector-label { color: var(--c-ink); }
  .selector-name { color: rgba(232, 228, 223, 0.35); }

  /* 落款 · 印章面板 */
  .ink-field-input { border-bottom-color: rgba(232,228,223,0.08); }
  .ink-seal-chip.active {
    border-color: rgba(232,228,223,0.15);
    background: rgba(232,228,223,0.06);
  }
  .ink-date-toggle { border-color: rgba(232,228,223,0.08); }
  .ink-date-toggle.active { border-color: rgba(91,127,149,0.4); }
  .ink-pos-cell { border-color: rgba(232,228,223,0.08); }
  .ink-pos-cell.active { border-color: #cc3333; background: rgba(204,51,51,0.08); }
  .ink-pos-mark { background: rgba(232,228,223,0.2); }

  /* 3D 预览 */
  .scene3d-container { background: #1e1e22; }
  .frame3d-wrap { background: #1e1e22; }
  .frame3d-wrap:fullscreen { background: #1e1e22; }
  .grid-toggle {
    color: #999;
    background: rgba(40,40,46,0.8);
    &:hover { background: rgba(50,50,58,0.9); color: #ccc; }
    &.active { color: #7aadca; }
  }
  .scene-selector {
    background: rgba(30,30,36,0.8);
  }
  .scene-chip {
    color: #aaa;
    &:hover { background: rgba(255,255,255,0.08); }
    &.active { color: #fff; background: #5b7f95; }
  }
  .record-settings {
    background: rgba(30,30,36,0.92);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  .rec-label { color: #888; }
  .rec-option {
    color: #aaa;
    background: rgba(255,255,255,0.06);
    &:hover { background: rgba(255,255,255,0.12); }
    &.active { color: #fff; background: #5b7f95; }
  }

  /* 操作按钮 */
  .actions-bar {
    background: var(--c-paper-card);
    border-color: rgba(232, 228, 223, 0.08);
  }
  .action-btn {
    background: var(--c-paper-card);
    border-right-color: rgba(232, 228, 223, 0.06);
  }

  .print-panel {
    background: var(--c-paper-card);
    border-color: rgba(232, 228, 223, 0.08);
  }
  .print-chip {
    background: rgba(232, 228, 223, 0.06);
    color: rgba(232, 228, 223, 0.65);
    &.active {
      background: rgba(122, 168, 194, 0.15);
      color: #7aa8c2;
      border-color: rgba(122, 168, 194, 0.25);
    }
  }
  .print-info { background: rgba(232, 228, 223, 0.04); }
  .print-info-text { color: rgba(232, 228, 223, 0.55); }

  .share-panel {
    background: var(--c-paper-card);
    border-color: rgba(232, 228, 223, 0.08);
  }
  .share-chip {
    background: rgba(232, 228, 223, 0.06);
    color: rgba(232, 228, 223, 0.65);
    &.active {
      background: rgba(122, 168, 194, 0.15);
      color: #7aa8c2;
      border-color: rgba(122, 168, 194, 0.25);
    }
  }
  .poster-preview-wrap { background: rgba(232, 228, 223, 0.04); }
  .share-copy-box { background: rgba(232, 228, 223, 0.04); }
  .share-copy-text { color: rgba(232, 228, 223, 0.65); }

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

// ── 版式面板 ──
.format-custom-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
}
.format-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.format-input-label {
  font-size: 12px;
  color: #888;
  font-family: $font-calligraphy;
  white-space: nowrap;
}
.format-input {
  flex: 1;
  height: 30px;
  border: 1px solid var(--c-ink-06, rgba(0,0,0,0.06));
  border-radius: 4px;
  padding: 0 8px;
  font-size: 13px;
  font-family: $font-calligraphy;
  color: var(--c-ink);
  background: rgba(0,0,0,0.02);
  text-align: center;
  &:focus { border-color: #5b7f95; }
}
.format-input-x {
  font-size: 13px;
  color: #aaa;
}
.format-unit {
  font-size: 11px;
  color: #aaa;
  white-space: nowrap;
}
.format-slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
}
.format-slider-label {
  font-size: 12px;
  color: #888;
  font-family: $font-calligraphy;
  white-space: nowrap;
  min-width: 24px;
}
.format-slider-value {
  font-size: 11px;
  color: #5b7f95;
  min-width: 50px;
  text-align: right;
}
.format-slider-input {
  width: 52px;
  height: 22px;
  border: 1px solid var(--c-ink-06, rgba(0,0,0,0.06));
  border-radius: 3px;
  padding: 0 4px;
  font-size: 11px;
  color: #5b7f95;
  text-align: center;
  background: rgba(0,0,0,0.02);
  flex-shrink: 0;
  &:focus { border-color: #5b7f95; }
}
.format-reset-row {
  display: flex;
  justify-content: flex-end;
  padding: 2px 10px 6px;
}
.format-reset-btn {
  font-size: 11px;
  color: #5b7f95;
  font-family: $font-calligraphy;
  cursor: pointer;
  &:active { opacity: 0.6; }
}

/* ══════════════════════════════════════
   结果页移动端适配（≤ 768px）
   ══════════════════════════════════════ */
@media (max-width: #{$breakpoint - 1px}) {
  // ── 手机端：预览吸顶 + 控制区可滚 ──
  .page {
    height: 100vh;
    min-height: unset;
    overflow: hidden;
  }
  .main-layout {
    flex-direction: column;
    gap: 0;
    padding: 0;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
    height: calc(100vh - #{$nav-height});
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  // 面板强制全宽
  .panel {
    width: 100% !important;
    min-width: unset !important;
    max-width: unset !important;
    flex: none !important;
  }

  // 预览区：sticky 吸顶
  .panel-left {
    position: sticky !important;
    top: 0;
    z-index: 10;
    background: var(--c-paper);
    max-height: 44vh;
    overflow: hidden;
    padding: 8px 8px 0;
    border-bottom: 1px solid var(--c-ink-06);
    // 底部淡出遮罩
    &::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 16px;
      background: linear-gradient(transparent, var(--c-paper));
      pointer-events: none;
      z-index: 1;
    }
  }
  .card-section {
    overflow: hidden;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .preview-toolbar {
    flex-shrink: 0;
  }

  // 控制面板
  .panel-center {
    padding: 12px !important;
  }
  .panel-right {
    padding: 0 12px 16px;
  }

  // 卡片预览缩放适配
  .mount-frame {
    max-width: 100%;
    transform: scale(0.8);
    transform-origin: center center;
  }
  .tilt-wrapper {
    max-width: 100%;
  }

  // 装裱在手机端缩小 padding
  .mount-jing-pian .mount-mat { padding: 12px; }
  .mount-ling-biao .mount-mat { padding: 16px 12px; }
  .mount-xuan-he .mount-mat { padding: 28px 14px 22px; }
  .mount-hong-mu .mount-mat,
  .mount-jin-qi .mount-mat { padding: 10px; }
  .mount-zhu-kuang .mount-mat { padding: 8px; }
  .mount-li-zhou .mount-mat { padding: 16px 12px; }
  .scroll-rod { width: calc(100% + 16px); height: 14px; }

  // 预览控制栏紧凑
  .preview-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  .preview-3d-chips {
    gap: 0;
  }
  .preview-zoom-bar {
    min-width: 100%;
  }

  // 控制面板
  .panel-center {
    padding: 0 4px;
  }

  // 选择器网格横向排列（2列）
  .selector-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .selector {
    min-width: unset;
  }

  // 字号/间距滑块
  .param-slider {
    gap: 6px;
  }

  // 书法家标签换行紧凑
  .calligrapher-chips {
    gap: 6px;
  }
}

/* 极小屏（≤ 375px） */
@media (max-width: 375px) {
  .mount-jing-pian .mount-mat { padding: 8px; }
  .mount-ling-biao .mount-mat { padding: 10px 8px; }
  .mount-xuan-he .mount-mat { padding: 20px 10px 16px; }

  .selector-mark {
    font-size: 24px;
  }
  .selector-name {
    font-size: 10px;
  }
}
</style>
