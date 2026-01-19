const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { minify } = require('html-minifier-terser');
const esbuild = require('esbuild');

const PLUGIN_ROOT = path.resolve(__dirname, '..');

const PATHS = {
  templates: {
    src: path.resolve(PLUGIN_ROOT, 'src/templates'),
    dest: path.resolve(PLUGIN_ROOT, 'lib/templates'),
  },
  queries: {
    src: path.resolve(PLUGIN_ROOT, 'src/queries'),
    dest: path.resolve(PLUGIN_ROOT, 'lib/queries'),
  }
};

// Minify 配置
const MINIFY_OPTS = {
  collapseWhitespace: true,
  removeComments: true,
  keepClosingSlash: true,
  minifyCSS: true,
  ignoreCustomFragments: [ /<%[\s\S]*?%>/, /<\?[\s\S]*?\?>/ ]
};

// --- 主逻辑 ---
async function main() {
  console.log('🚀 Starting Asset Build...');

  // 1. 处理 Templates (EJS, CSS, Images)
  await processDir(PATHS.templates.src, PATHS.templates.dest, async (src, dest, ext) => {
    if (ext === '.ejs') {
      await compileEjs(src, dest);
    } else if (ext === '.css') {
      await compileCss(src, dest);
    } else {
      copyFile(src, dest); // 图片等直接复制
    }
  });

  // 2. 处理 Queries (GraphQL) - 直接全部复制
  await processDir(PATHS.queries.src, PATHS.queries.dest, async (src, dest, ext) => {
    copyFile(src, dest);
  });

  console.log('✅ Asset Build Complete.');
}

// --- 核心功能函数 ---

// 通用目录遍历处理器
async function processDir(srcRoot, destRoot, handler) {
  if (!fs.existsSync(srcRoot)) return;

  // 确保输出根目录存在
  if (!fs.existsSync(destRoot)) fs.mkdirSync(destRoot, { recursive: true });

  const files = glob.sync('**/*', { cwd: srcRoot, nodir: true });

  for (const file of files) {
    const srcPath = path.join(srcRoot, file);
    const destPath = path.join(destRoot, file);
    const ext = path.extname(file).toLowerCase();

    // 确保子文件夹存在
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    await handler(srcPath, destPath, ext);
  }
}

// EJS 处理：去注释 + 压缩
async function compileEjs(src, dest) {
  let content = fs.readFileSync(src, 'utf8');
  // 极致优化：移除 <%# %> 注释
  content = content.replace(/<%#[\s\S]*?%>/g, '');
  try {
    const minified = await minify(content, MINIFY_OPTS);
    fs.writeFileSync(dest, minified);
    console.log(`[EJS]  ${path.relative(PLUGIN_ROOT, dest)}`);
  } catch (e) {
    console.error(`[ERR]  EJS Minify failed for ${src}, using raw.`, e);
    fs.writeFileSync(dest, content);
  }
}

// CSS 处理：esbuild 压缩
async function compileCss(src, dest) {
  try {
    await esbuild.build({
      entryPoints: [src],
      outfile: dest,
      minify: true,
      allowOverwrite: true,
    });
    console.log(`[CSS]  ${path.relative(PLUGIN_ROOT, dest)}`);
  } catch (e) {
    console.error(`[ERR]  CSS Minify failed for ${src}`, e);
  }
}

// 普通文件复制
function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`[COPY] ${path.relative(PLUGIN_ROOT, dest)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
