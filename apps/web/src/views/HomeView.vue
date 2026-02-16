<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">BigScreen Pro</span>
          <br />
          企业级大屏可视化设计器
        </h1>
        <p class="hero-description">
          现代化的拖拽式大屏设计工具，提供丰富的可视化组件、实时数据绑定、
          <br />
          智能对齐辅助，让大屏设计更简单、更高效。
        </p>
        <div class="hero-actions">
          <button class="btn btn--primary btn--large" @click="createNewProject">
            <i class="icon-plus" />
            新建项目
          </button>
          <button class="btn btn--default btn--large" @click="openRecentProject">
            <i class="icon-folder-open" />
            打开项目
          </button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="preview-mockup">
          <div class="mockup-screen">
            <div class="mockup-chart chart-1" />
            <div class="mockup-chart chart-2" />
            <div class="mockup-chart chart-3" />
            <div class="mockup-chart chart-4" />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="section-container">
        <h2 class="section-title">核心功能</h2>
        <p class="section-subtitle">强大而全面的功能，满足企业级大屏设计需求</p>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-drag-drop" />
            </div>
            <h3 class="feature-title">拖拽式设计</h3>
            <p class="feature-description">直观的拖拽操作，自由编排组件位置，所见即所得的设计体验</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-chart" />
            </div>
            <h3 class="feature-title">丰富图表库</h3>
            <p class="feature-description">基于 ECharts 的多样化图表，支持折线图、柱状图、饼图、雷达图等</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-align" />
            </div>
            <h3 class="feature-title">智能辅助</h3>
            <p class="feature-description">辅助线、网格吸附、自动对齐，让组件布局更精准、更高效</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-database" />
            </div>
            <h3 class="feature-title">数据绑定</h3>
            <p class="feature-description">支持多种数据源接入，实时数据更新，让大屏动起来</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-palette" />
            </div>
            <h3 class="feature-title">主题系统</h3>
            <p class="feature-description">内置多种主题风格，支持自定义主题，一键切换配色方案</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-team" />
            </div>
            <h3 class="feature-title">团队协作</h3>
            <p class="feature-description">支持多人协作编辑，版本控制，让团队配合更顺畅</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="tech-stack">
      <div class="section-container">
        <h2 class="section-title">技术栈</h2>
        <p class="section-subtitle">基于现代化的前端技术栈构建</p>
        
        <div class="tech-grid">
          <div class="tech-item">
            <img src="/tech/vue.svg" alt="Vue 3" />
            <span>Vue 3.4+</span>
          </div>
          <div class="tech-item">
            <img src="/tech/typescript.svg" alt="TypeScript" />
            <span>TypeScript 5.0+</span>
          </div>
          <div class="tech-item">
            <img src="/tech/vite.svg" alt="Vite" />
            <span>Vite 5.0+</span>
          </div>
          <div class="tech-item">
            <img src="/tech/pinia.svg" alt="Pinia" />
            <span>Pinia 2.1+</span>
          </div>
          <div class="tech-item">
            <img src="/tech/ech