"""
本地验证脚本

用于在修改 Python 脚本后，模拟真实 issue 场景进行验证。
确保脚本在遇到生产情况时能按预期工作。

使用方法：
    cd scripts/python
    python verify.py

验证流程：
    1. 加载 test_scenarios.json 中的测试场景
    2. 对每个场景设置环境变量并运行 check_issue.py
    3. 解析输出结果，与预期结果对比
    4. 输出验证报告
"""

import json
import os
import subprocess
import sys
from pathlib import Path

# 设置标准输出编码为 UTF-8（Windows 兼容）
if sys.platform == "win32":
    import io

    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")


# ── 配置 ──

SCRIPT_DIR = Path(__file__).parent.parent  # 指向 scripts/python 目录
SCENARIOS_FILE = SCRIPT_DIR / "tests" / "test_scenarios.json"
CHECK_ISSUE_SCRIPT = SCRIPT_DIR / "entry" / "check_issue.py"


# ── 测试结果 ──


class TestResult:
    """单个测试结果"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.passed = False
        self.output = {}
        self.expected = {}
        self.mismatches = []

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "passed": self.passed,
            "output": self.output,
            "expected": self.expected,
            "mismatches": self.mismatches,
        }


# ── 核心函数 ──


def load_scenarios() -> list[dict]:
    """
    加载测试场景配置

    返回：
        场景列表
    """
    with open(SCENARIOS_FILE, encoding="utf-8") as f:
        data = json.load(f)
    return data.get("scenarios", [])


def run_check_issue(env_vars: dict) -> dict[str, str]:
    """
    运行 check_issue.py 并捕获输出

    参数：
        env_vars: 环境变量字典

    返回：
        GITHUB_OUTPUT 解析后的键值对
    """
    # 准备环境变量
    env = os.environ.copy()
    env.update(env_vars)

    # 创建临时 GITHUB_OUTPUT 文件
    import tempfile

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        output_file = f.name

    env["GITHUB_OUTPUT"] = output_file

    # 设置 PYTHONPATH 为 scripts/python 目录，确保模块导入正常
    python_path = str(SCRIPT_DIR)
    if "PYTHONPATH" in env:
        env["PYTHONPATH"] = python_path + os.pathsep + env["PYTHONPATH"]
    else:
        env["PYTHONPATH"] = python_path

    try:
        # 运行脚本
        result = subprocess.run(
            [sys.executable, str(CHECK_ISSUE_SCRIPT)],
            env=env,
            capture_output=True,
            text=True,
            cwd=str(SCRIPT_DIR),
        )

        if result.returncode != 0:
            print(f"  ❌ 脚本执行失败: {result.stderr}")
            return {}

        # 解析 GITHUB_OUTPUT
        outputs = {}
        with open(output_file, encoding="utf-8") as f:
            content = f.read()

        # 解析 heredoc 格式：key<<GKD_OUTPUT_EOF\nvalue\nGKD_OUTPUT_EOF
        lines = content.split("\n")
        i = 0
        while i < len(lines):
            line = lines[i]
            if "<<" in line:
                # heredoc 格式：key<<GKD_OUTPUT_EOF
                key = line.split("<<")[0].strip()
                value_lines = []
                i += 1
                while i < len(lines) and lines[i].strip() != "GKD_OUTPUT_EOF":
                    value_lines.append(lines[i])
                    i += 1
                outputs[key] = "\n".join(value_lines)
            elif "=" in line and "<<" not in line:
                # 简单格式：key=value
                key, value = line.split("=", 1)
                outputs[key.strip()] = value.strip()
            i += 1

        return outputs

    finally:
        # 清理临时文件
        os.unlink(output_file)


def validate_scenario(scenario: dict) -> TestResult:
    """
    验证单个测试场景

    参数：
        scenario: 场景配置

    返回：
        TestResult 验证结果
    """
    name = scenario["name"]
    description = scenario.get("description", "")
    result = TestResult(name, description)

    print(f"\n{'=' * 60}")
    print(f"测试场景: {name}")
    print(f"描述: {description}")
    print(f"{'=' * 60}")

    # 运行脚本
    print("  运行 check_issue.py ...")
    output = run_check_issue(scenario["input"])

    if not output:
        print("  ❌ 无法获取输出")
        result.output = {}
        result.expected = scenario.get("expected", {})
        result.mismatches = ["脚本执行失败"]
        return result

    result.output = output
    result.expected = scenario.get("expected", {})

    # 验证每个预期字段
    mismatches = []
    for key, expected_value in result.expected.items():
        actual_value = output.get(key, "")
        if actual_value != expected_value:
            mismatches.append(f"{key}: 期望='{expected_value}', 实际='{actual_value}'")
            print(f"  ❌ {key}: 期望='{expected_value}', 实际='{actual_value}'")
        else:
            print(f"  ✓ {key}: {actual_value}")

    result.mismatches = mismatches
    result.passed = len(mismatches) == 0

    if result.passed:
        print("  ✅ 测试通过")
    else:
        print(f"  ❌ 测试失败: {len(mismatches)} 个字段不匹配")

    # 显示完整输出
    print("\n  完整输出:")
    for key, value in sorted(output.items()):
        if value:
            # 截断过长的值
            display_value = value[:100] + "..." if len(value) > 100 else value
            print(f"    {key}: {display_value}")

    return result


def run_all_tests() -> list[TestResult]:
    """
    运行所有测试场景

    返回：
        所有测试结果列表
    """
    scenarios = load_scenarios()
    results = []

    print(f"\n{'#' * 60}")
    print("# 本地验证: Python 脚本功能测试")
    print(f"# 共 {len(scenarios)} 个测试场景")
    print(f"{'#' * 60}")

    for i, scenario in enumerate(scenarios, 1):
        print(f"\n[{i}/{len(scenarios)}]", end="")
        result = validate_scenario(scenario)
        results.append(result)

    return results


def print_summary(results: list[TestResult]):
    """
    打印验证摘要

    参数：
        results: 所有测试结果
    """
    print(f"\n{'#' * 60}")
    print("# 验证摘要")
    print(f"{'#' * 60}")

    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)

    print(f"\n总计: {len(results)} 个场景")
    print(f"通过: {passed} ✅")
    print(f"失败: {failed} ❌")

    if failed > 0:
        print("\n失败的场景:")
        for r in results:
            if not r.passed:
                print(f"\n  ❌ {r.name}")
                print(f"     描述: {r.description}")
                for mismatch in r.mismatches:
                    print(f"     - {mismatch}")


def save_results(results: list[TestResult], output_file: Path = None):
    """
    保存验证结果到 JSON 文件

    参数：
        results: 所有测试结果
        output_file: 输出文件路径
    """
    if output_file is None:
        output_file = SCRIPT_DIR / "test_results.json"

    data = {
        "total": len(results),
        "passed": sum(1 for r in results if r.passed),
        "failed": sum(1 for r in results if not r.passed),
        "results": [r.to_dict() for r in results],
    }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n验证结果已保存到: {output_file}")


# ── 主入口 ──


def main():
    """主函数"""
    results = run_all_tests()
    print_summary(results)
    save_results(results)

    # 返回退出码：有失败则返回 1
    failed = sum(1 for r in results if not r.passed)
    sys.exit(1 if failed > 0 else 0)


if __name__ == "__main__":
    main()
