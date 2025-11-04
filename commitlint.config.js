// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2, // 2 表示 error 级别
      'always',
      [
        // 在这里继承默认规则，并加入你自己的类型
        'build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test',
        'improve' // <-- 在这里加入我们自定义的类型
      ]
    ]
  }
};
