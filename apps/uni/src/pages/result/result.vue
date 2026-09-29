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
              :class="{ active: preview3DMode === 'scene' }"
              @tap="switchTo3DScene()"
            ><text>书房</text></view>
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
          <template v-if="preview3DMode !== 'scene'">
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

          <!-- 3D 书房场景（完全替换 2D 区域） -->
          <div v-if="preview3DMode === 'scene'" class="scene3d-container" ref="scene3dRef" />
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
    padding: [16, 16, 16, 16], margin: 4,
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#5c2e0e'); g.addColorStop(0.12, '#7a3d1a')
      g.addColorStop(0.25, '#6b3015'); g.addColorStop(0.4, '#8b4c28')
      g.addColorStop(0.55, '#5c2e0e'); g.addColorStop(0.7, '#7a3d1a')
      g.addColorStop(0.85, '#6b3015'); g.addColorStop(1, '#5c2e0e')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      // 内边线
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1
      ctx.strokeRect(3, 3, w - 6, h - 6)
    },
  },
  'jin-qi': {
    padding: [16, 16, 16, 16], margin: 4,
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#b8860b'); g.addColorStop(0.15, '#daa520')
      g.addColorStop(0.3, '#ffd700'); g.addColorStop(0.5, '#daa520')
      g.addColorStop(0.65, '#b8860b'); g.addColorStop(0.8, '#cd950c')
      g.addColorStop(1, '#b8860b')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1
      ctx.strokeRect(4, 4, w - 8, h - 8)
    },
  },
  'zhu-kuang': {
    padding: [14, 14, 14, 14], margin: 4,
    draw(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#c8b87a'); g.addColorStop(0.15, '#b5a568')
      g.addColorStop(0.4, '#a89555'); g.addColorStop(0.6, '#b5a568')
      g.addColorStop(0.85, '#c8b87a'); g.addColorStop(1, '#b5a568')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      // 竹节横线
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2
      ctx.globalAlpha = 0.5
      const drawLine = (y: number) => {
        const lg = ctx.createLinearGradient(3, 0, w - 3, 0)
        lg.addColorStop(0, 'transparent'); lg.addColorStop(0.5, 'rgba(0,0,0,0.15)'); lg.addColorStop(1, 'transparent')
        ctx.strokeStyle = lg; ctx.beginPath(); ctx.moveTo(3, y); ctx.lineTo(w - 3, y); ctx.stroke()
      }
      drawLine(h * 0.3); drawLine(h * 0.7)
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
const preview3DMode = ref<'flat' | 'tilt' | 'scene'>('flat')
const tiltWrapperRef = ref<any>(null)
const scene3dRef = ref<any>(null)
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
let threeFrameGroup: any = null
let threeScene: any = null
let threeModule: any = null

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

async function switchTo3DScene() {
  if (preview3DMode.value === 'scene') {
    preview3DMode.value = 'flat'
    enable3DTilt.value = false
    if (threeCleanup) { threeCleanup(); threeCleanup = null }
    return
  }
  preview3DMode.value = 'scene'
  enable3DTilt.value = false
  await nextTick()
  await init3DScene()
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
    backgroundImage: bgImage.value,
    customWidth: customWidth.value || undefined,
    customHeight: customHeight.value || undefined,
    colSpacingScale: colSpacingScale.value,
    charSpacingScale: charSpacingScale.value,
  }
}

async function renderCard() {
  await ensureFontReady(currentFont.value)

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
  [currentFont, currentBg, currentTmpl, currentBorder, currentTexture, currentTextureType, textureStrength, fontScale, stampText, stampSizeVal, stampPosition, stampFontKey, stampX, stampY, offsetX, offsetY, previewScale, colophonCalligrapher, colophonVerb, colophonShowDate, colophonOffsetX, colophonOffsetY, colophonLayout, colSpacingScale, charSpacingScale, customWidth, customHeight],
  async () => {
    await renderCard()
  },
)

watch(previewScale, (val) => {
  if (threeCamera && preview3DMode.value === 'scene') {
    threeCamera.position.z = 3.0 / (val / 100)
  }
})

// 存储 buildFrame 引用
let threeBuildFrame: ((mount: string) => void) | null = null

watch(() => currentMount.value, (val) => {
  if (threeBuildFrame && preview3DMode.value === 'scene') {
    threeBuildFrame(val)
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
  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
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
