// src/utils/rem.ts
// src/utils/rem.ts

/**
 * 移动端 rem 适配工具
 * 基准：320px -> 20px (即 1rem = 20px @ 320宽度)
 * 公式：fontSize = 20 * (clientWidth / 320)
 */

(function (doc, win) {
  const docEl = doc.documentElement;
  
  // 兼容处理：优先使用 orientationchange，其次 resize
  const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';

  // 桌面视口不应用移动端 rem 缩放，否则根字号会被放大到 100px+ 导致默认控件巨大
  const MOBILE_BREAKPOINT = 640;

  const recalc = () => {
    const clientWidth = docEl.clientWidth;

    // 防御性编程：如果宽度为 0 (例如元素未渲染)，则不计算
    if (!clientWidth) return;

    if (clientWidth >= MOBILE_BREAKPOINT) {
      docEl.style.fontSize = '';
      return;
    }

    // 核心算法：保持与你原代码一致
    // 20 * (当前宽度 / 320)
    const fontSize = 20 * (clientWidth / 320);

    docEl.style.fontSize = `${fontSize}px`;
  };

  // 检查浏览器是否支持 addEventListener (现代浏览器都支持，可简化，但保留以防万一)
  if (!doc.addEventListener) return;

  // 监听窗口变化
  win.addEventListener(resizeEvt, recalc, false);
  
  // 监听 DOM 加载完成
  doc.addEventListener('DOMContentLoaded', recalc, false);
  
  // 初始化执行一次 (防止 DOMContentLoaded 触发前的空白)
  recalc();

})(document, window);

// 导出空对象，使其成为一个标准的 ES 模块，避免被构建工具忽略
export {};