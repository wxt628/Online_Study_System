#!/usr/bin/env python3
import subprocess
import sys

def run_tests():
    """运行所有测试"""
    result = subprocess.run([
        sys.executable, "-m", "pytest", 
        "tests/", 
        "-v", 
        "--tb=short"
    ], cwd=".")
    
    return result.returncode

if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)