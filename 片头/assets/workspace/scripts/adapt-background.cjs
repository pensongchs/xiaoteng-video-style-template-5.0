// 只保存视频时钟适配逻辑；背景原文由目标电脑从官方固定提交获取。
module.exports = function adaptBackground(source) {
  const replace = (before, after) => {
    if (!source.includes(before)) throw Error('背景官方版本与适配逻辑不匹配');
    source = source.replace(before, after);
  };
  replace("import { useEffect, useRef } from 'react';", "import { useEffect, useLayoutEffect, useRef, useState } from 'react';\nimport { cancelRender, continueRender, delayRender, useVideoConfig } from 'remotion';");
  replace("import './GradientASCII.css';", "import './AsciiGradientBackground.css';");
  replace('const GradientASCII = ({', 'const AsciiGradientBackground = ({\n  renderTime = 0,');
  replace('  const containerRef = useRef(null);', "  const {width: compositionWidth, height: compositionHeight} = useVideoConfig();\n  const [handle] = useState(() => delayRender('加载039字符渐变背景'));\n  const drawRef = useRef(null);\n  const timeRef = useRef(renderTime);\n  timeRef.current = renderTime;\n  const containerRef = useRef(null);");
  replace('  const wakeRef = useRef(null);\n', '');
  replace('  settingsRef.current = settings;', '  settingsRef.current = settings;\n  useLayoutEffect(() => {drawRef.current?.(renderTime);}, [renderTime]);');
  replace('      stencil: false', '      stencil: false,\n      preserveDrawingBuffer: true');
  replace('if (!container || !canvas || !gl) return undefined;', "if (!container || !canvas || !gl) {cancelRender(new Error('背景需要WebGL2'));return undefined;}");
  replace('if (!field || !halo || !blur || !composite) return undefined;', "if (!field || !halo || !blur || !composite) {cancelRender(new Error('背景着色器编译失败'));return undefined;}");
  replace('container.clientWidth)', 'container.clientWidth || compositionWidth)');
  replace('container.clientHeight)', 'container.clientHeight || compositionHeight)');
  replace('      draw();\n      wake();', '      draw();');
  const start = source.indexOf('    const updateInput = dt => {');
  const end = source.indexOf('    return () => {', start);
  if (start < 0 || end < 0) throw Error('背景时间驱动适配失败');
  source = source.slice(0, start) + `    const renderAt = seconds => {
      if (disposed) return;
      const s = settingsRef.current;
      const clock = seconds + 3;
      time = clock * s.speed * 0.5;
      glyphTime = clock * Math.max(s.speed, 0.15);
      introClock = 1;
      frameSeed = Math.floor(clock * 24) % 97;
      draw();
      gl.finish();
    };
    drawRef.current = renderAt;
    resize();
    renderAt(timeRef.current);
    Promise.resolve(document.fonts?.ready).then(() => {
      if (disposed) return;
      renderAt(timeRef.current);
      continueRender(handle);
    }).catch(cancelRender);

` + source.slice(end);
  const cleanupStart = source.indexOf('      cancelAnimationFrame(raf);');
  const cleanupEnd = source.indexOf('      [fieldTarget', cleanupStart);
  if (cleanupStart < 0 || cleanupEnd < 0) throw Error('背景清理逻辑适配失败');
  source = source.slice(0, cleanupStart) + '      drawRef.current = null;\n' + source.slice(cleanupEnd);
  replace('  useEffect(() => {\n    wakeRef.current?.();\n  });\n', '');
  replace('export default GradientASCII;', 'export default AsciiGradientBackground;');
  return '// Local adaptation of React Bits Gradient ASCII, copyright David Haz. See .runtime/React-Bits-LICENSE.md.\n' + source;
};
