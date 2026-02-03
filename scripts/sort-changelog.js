// /scripts/sort-changelog.js

const fs = require('fs');
const path = require('path');

// --- 配置区 ---
// 定义顺序 (请确保这里的标题与 .versionrc.js 中的 section 完全一致)
const SECTION_ORDER = [
  '### ✨ 新增功能',
  '### 🚀 功能优化',
  '### 🎨 样式',
  '### 🐛 Bug 修复',
  '### ⚡ 性能提升',
  '### 📝 文档',
  '### ⏪ 回滚',
];
const CHANGELOG_PATH = path.resolve(__dirname, '..','changelog.md');
// --- 配置区结束 ---

console.log('🧐 开始对 changelog.md 进行排序...');

try {
  const changelogContent = fs.readFileSync(CHANGELOG_PATH, 'utf-8');

  // 1. 定义一个能匹配 ## 或 ### 的版本标题的正则表达式
  const versionHeaderRegex = /^(##+ \[[0-9].*)$/m;

  // 2. 找到第一个版本标题（即最新版本）
  const firstVersionMatch = changelogContent.match(versionHeaderRegex);
  if (!firstVersionMatch) {
    console.log('ℹ️ 未找到任何版本标题，跳过排序。');
    process.exit(0);
  }
  const latestVersionHeader = firstVersionMatch[0];
  const startIndex = changelogContent.indexOf(latestVersionHeader);

  // 3. 将文件分割成三部分：头部、最新版本内容、历史内容
  const headerContent = changelogContent.substring(0, startIndex);
  const restContent = changelogContent.substring(startIndex + latestVersionHeader.length);

  const secondVersionMatch = restContent.match(versionHeaderRegex);
  let latestVersionBlock = restContent;
  let historicalContent = '';
  if (secondVersionMatch) {
    const endIndex = restContent.indexOf(secondVersionMatch[0]);
    latestVersionBlock = restContent.substring(0, endIndex);
    historicalContent = restContent.substring(endIndex);
  }

  // 4. 将最新版本的内容按区块标题分割成一个 Map
  const sectionMap = new Map();
  const sectionTitles = latestVersionBlock.match(/^### .*$/gm) || [];

  let lastIndex = 0;
  sectionTitles.forEach((title, i) => {
    const nextTitle = sectionTitles[i + 1];
    const sectionStartIndex = latestVersionBlock.indexOf(title, lastIndex);
    const sectionEndIndex = nextTitle ? latestVersionBlock.indexOf(nextTitle, sectionStartIndex) : undefined;

    const sectionContent = latestVersionBlock.substring(sectionStartIndex + title.length, sectionEndIndex);
    sectionMap.set(title.trim(), sectionContent.trim());
    lastIndex = sectionStartIndex;
  });

  // 5. 按照 SECTION_ORDER 重新拼接排序后的内容
  let sortedSectionsContent = '';
  SECTION_ORDER.forEach(title => {
    if (sectionMap.has(title)) {
      sortedSectionsContent += `${title}\n\n${sectionMap.get(title)}\n\n`;
    }
  });

  // 6. 将所有部分重新组合成最终的文件内容
  const finalContent = `${headerContent.trim()}\n\n${latestVersionHeader}\n\n${sortedSectionsContent.trim()}\n\n${historicalContent.trim()}`;

  fs.writeFileSync(CHANGELOG_PATH, finalContent.trim() + '\n');

  console.log('✅ Changelog 排序完成！');
} catch (error) {
  console.error('❌ 排序失败:', error);
  process.exit(1);
}
