/**
 * ECharts 主题配置
 */

export const themes = {
  default: {
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
  },
  dark: {
    color: ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9', '#05c091', '#ff8a45', '#8d48e3', '#dd79ff'],
    backgroundColor: 'transparent'
  },
  vintage: {
    color: ['#d87c7c', '#919e8b', '#d7ab82', '#6e7074', '#61a0a8', '#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b']
  },
  macarons: {
    color: ['#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80', '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa', '#07a2a4', '#9a7b6a', '#dada6d']
  },
  shine: {
    color: ['#c12e34', '#e6b600', '#0098d9', '#2b821d', '#005eaa', '#339ca8', '#cda819', '#32a487']
  },
  roma: {
    color: ['#E01F54', '#001852', '#f5e8c8', '#b8d2c7', '#c6b38e', '#a4d8c2', '#f3d999', '#d3758f', '#dcc392', '#2e4783', '#82b6e9', '#ff6347', '#a092f1', '#0a915d', '#eaf889', '#6699FF', '#ff6666', '#3cb371', '#d5e4fc', '#f0a22e']
  },
  walden: {
    color: ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8']
  }
}

/** 获取主题配置 */
export function getTheme(themeName: string): any {
  return themes[themeName as keyof typeof themes] || themes.default
}

/** 获取主题颜色列表 */
export function getThemeColors(themeName: string): string[] {
  const theme = getTheme(themeName)
  return theme.color || themes.default.color
}

export default themes
