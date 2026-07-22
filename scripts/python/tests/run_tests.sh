#!/bin/bash
# 条件运行 Python 单元测试
#
# 仅当 scripts/python/ 或 .github/workflows/ 下有文件变更时才运行测试。
# 修改 src/apps/*.ts 等 TypeScript 文件时自动跳过。
#
# 使用方法：
#   bash scripts/python/tests/run_tests.sh

# 对比 origin/main，获取本次 push 涉及的变更文件
changed_files=$(git diff --name-only origin/main..HEAD 2>/dev/null)

# 检查是否有 Python 或 YAML 文件变更
need_test=false
for file in $changed_files; do
  case "$file" in
    scripts/python/*|.github/workflows/*)
      need_test=true
      break
      ;;
  esac
done

if [ "$need_test" = false ]; then
  echo "⏭️  无 Python/YAML 文件变更，跳过 Python 测试"
  exit 0
fi

echo "🔍 检测到 Python/YAML 文件变更，运行 Python 静态检查 + 单元测试..."

echo ""
echo "── ruff check ──"
ruff check scripts/python/

echo ""
echo "── ruff format check ──"
ruff format --check scripts/python/

echo ""
echo "── unittest ──"
cd scripts/python
PYTHONPATH=. python -m unittest discover -s tests -p "test_*.py" -v
