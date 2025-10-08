// .versionrc.js

// 定义顺序
const sectionOrder = ["✨ 新增功能", "🐛 Bug 修复", "🚀 功能优化", "⚡ 性能提升", "📝 文档", "⏪ 回滚"];

module.exports = {
  infile: "changelog.md",
  header: "# 更新日志\n\n",
  bumpFiles: ["package.json"],
  packageFiles: ["package.json"],

  types: [
    { type: "feat", section: "✨ 新增功能" },
    { type: "refine", section: "🚀 功能优化", hidden: false },
    { type: "fix", section: "🐛 Bug 修复" },
    { type: "perf", section: "⚡ 性能提升" },
    { type: "revert", section: "⏪ 回滚" },
    { type: "docs", section: "📝 文档" },
    { type: "style", section: "💄 样式", hidden: true },
    { type: "refactor", section: "♻️ 代码重构", hidden: true },
    { type: "test", section: "✅ 测试", hidden: true },
    { type: "build", section: "📦 构建系统", hidden: true },
    { type: "chore", section: "👷 配置项", hidden: true },
    { type: "ci", section: "CI", hidden: true },
  ],

  writerOpts: {
    // 提供一个自定义的排序函数来强制覆盖默认的排序行为
    commitGroupsSort: (a, b) => {
      const rankA = sectionOrder.indexOf(a.title);
      const rankB = sectionOrder.indexOf(b.title);

      // 如果 a.title 在列表中找不到，把它排到最后
      if (rankA === -1) {
        return 1;
      }
      // 如果 b.title 在列表中找不到，把它排到最后
      if (rankB === -1) {
        return -1;
      }
      return rankA - rankB;
    },
  },

  commitUrlFormat: "{{host}}/{{owner}}/{{repository}}/commit/{{hash}}",
  compareUrlFormat: "{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}",
};
