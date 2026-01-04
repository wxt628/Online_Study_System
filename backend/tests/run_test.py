#!/usr/bin/env python3
import subprocess
import sys
import os

def run_tests():
    """运行所有测试"""
    # 获取脚本所在目录的绝对路径
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    result = subprocess.run([
        sys.executable, "-m", "pytest", 
        "tests/", 
        "-v", 
        "--tb=short"
    ], cwd=script_dir)  # 使用脚本所在目录作为工作目录
    
    return result.returncode

if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)