/**
 * 📦 自动化发布脚本 (Release Script)
 * * 该脚本用于自动化发布流程：更新版本 -> 生成 Changelog -> 提交 -> 打 Tag -> 推送。
 * * 🛠 用法:
 * yarn release [版本参数] [脚本参数]
 * * 📋 参数说明:
 * 1. 版本参数 (直接透传给 koishi bump):
 * (空)             : 默认更新小版本 (Patch), e.g., 1.0.0 -> 1.0.1
 * -1, --major      : 更新大版本 (Major), e.g., 1.0.0 -> 2.0.0
 * -2, --minor      : 更新中版本 (Minor), e.g., 1.0.0 -> 1.1.0
 * -3, --patch      : 更新小版本 (Patch), e.g., 1.0.0 -> 1.0.1
 * -p, --prerelease : 更新预览版本 (alpha/beta/rc)
 * -v <ver>         : 强制指定版本号
 * * 2. 脚本参数 (自定义功能):
 * -i, --issue <id> : 关联并关闭 GitHub/Gitee Issue
 * (Commit 信息将包含 "Closes #<id>")
 * * 💡 常见示例:
 * yarn release                   // 常规发布: Patch 版本
 * yarn release -2                // 功能更新: Minor 版本
 * yarn release -i 105            // 修复 Bug: Patch 版本并关闭 Issue #105
 * yarn release -2 -i 106         // 功能完成: Minor 版本并关闭 Issue #106
 * yarn release -p                // 这里的 -p 会根据当前版本自动推算下一个 alpha/beta
 */

const { execSync } = require("child_process");
const path = require("path");

// --- 脚本设置 ---
// Koishi 根目录的 execOptions
const rootExecOptions = { stdio: "inherit" };

// --- 变量定义 ---
const PLUGIN_DIR = path.resolve(__dirname, "..");
const PLUGIN_NAME = path.basename(PLUGIN_DIR);
const BRANCH = "master";

// 为所有 Git 命令定义一个新的 execOptions，并指定工作目录
const gitExecOptions = {
  stdio: "inherit",
  cwd: PLUGIN_DIR, // <--- 指定 Git 命令在这里执行
};

// --- 参数解析 ---
const args = process.argv.slice(2);
let bumpArgs = [];
let issueNumber = "";
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "-i" || arg === "--issue") {
    issueNumber = args[i + 1];
    i++;
  } else {
    bumpArgs.push(arg);
  }
}
if (bumpArgs.length === 0) {
  bumpArgs.push("--patch");
}

// --- 自动化流程开始 ---
try {
  console.log("✅ 步骤 1/6: 使用 Koishi bump 命令更新版本...");
  // 这个命令需要在根目录运行
  execSync(`yarn bump ${PLUGIN_NAME} ${bumpArgs.join(" ")}`, rootExecOptions);

  const newVersion = require(path.join(PLUGIN_DIR, "package.json")).version;
  console.log(`   - 新版本号为: ${newVersion}`);

  console.log("✅ 步骤 2/6: 生成 Changelog...");
  // 这个命令也需要在根目录运行
  execSync("yarn changelog", rootExecOptions);

  console.log("✅ 步骤 3/6: 提交版本变更...");
  // 因为 cwd 已经设置，所以路径可以直接写文件名
  execSync(`git add package.json changelog.md`, gitExecOptions);

  const commitTitle = `chore(release): ${newVersion}`;
  let commitCommand = `git commit -m "${commitTitle}"`;
  if (issueNumber) {
    const commitBody = `Closes #${issueNumber}`;
    commitCommand += ` -m "${commitBody}"`;
    console.log(`   - 关联并关闭 Issue #${issueNumber}`);
  }
  execSync(commitCommand, gitExecOptions);
  console.log(`   - 已创建 Commit: ${commitTitle}`);

  console.log("✅ 步骤 4/6: 创建 Git 标签...");
  execSync(`git tag -a "v${newVersion}" -m "Version ${newVersion}"`, gitExecOptions);
  console.log(`   - 已创建标签: v${newVersion}`);

  console.log("✅ 步骤 5/6: 推送 Commit 和标签到远程仓库...");
  execSync(`git push --follow-tags origin ${BRANCH}`, gitExecOptions);
  console.log("   - 推送成功！");

  console.log(`🎉 全部完成！版本 v${newVersion} 已成功发布。`);
} catch (error) {
  console.error("❌ 自动化发布失败:" + error.message);
  process.exit(1);
}
