#!/bin/bash
# Helper script to invoke idf.py with proper environment
export IDF_PATH=/Users/danielwise/esp/esp-idf
source ~/.espressif/python_env/idf5.3_py3.9_env/bin/activate
"$@"
