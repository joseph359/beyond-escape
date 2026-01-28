#!/bin/bash

# ==========================================
# 1. 环境配置
# ==========================================
# 加载系统配置 (移到这里)
source /etc/profile

# 强制加载 Sybase 环境变量 (防止 ct_connect 报错)
if [ -f "/opt/sybase/SYBASE.sh" ]; then
    source /opt/sybase/SYBASE.sh
else
    export SYBASE=/opt/sybase
    export SYBASE_OCS=OCS-15_0
    export LD_LIBRARY_PATH=$SYBASE/$SYBASE_OCS/lib:$LD_LIBRARY_PATH
fi

# ==========================================
# 2. 接收参数
# ==========================================
TABLE_NAME="$1"
FILE_NAMES="$2"

if [ -z "$TABLE_NAME" ] || [ -z "$FILE_NAMES" ]; then
    echo "错误：缺少参数。"
    echo "用法: $0 <表名> <文件列表>"
    exit 1
fi

# ==========================================
# 3. 执行逻辑
# ==========================================
IFS=',' read -ra FILE_ARRAY <<< "$FILE_NAMES"
TOTAL_COUNT=${#FILE_ARRAY[@]}
FAIL_COUNT=0

echo "===== 开始任务: $TABLE_NAME ====="

for FILE in "${FILE_ARRAY[@]}"; do
    FILE_TRIMMED=$(echo "$FILE" | xargs)
    
    if [ -z "$FILE_TRIMMED" ]; then continue; fi
    
    if [ ! -e "$FILE_TRIMMED" ]; then
        echo "【错误】文件不存在: $FILE_TRIMMED"
        ((FAIL_COUNT++))
        continue
    fi

    echo "正在导入: $FILE_TRIMMED"

    # 执行 BCP (保留了你的 -t"|^|" 和 -r "\n" 和 -Y)
    # 这一行非常长，请确保复制完整
    export LANG=C && /opt/sybase/OCS-15_0/bin/bcp TEST.dbo.$TABLE_NAME in $FILE_TRIMMED \
        -S egServer50 \
        -U sa \
        -P Bjgyfy.024sybase \
        -c -t"|^|" -r "\n" -Y -J utf8 -b50000 -T20971520 
    
    if [ $? -eq 0 ]; then
        echo "【成功】"
    else
        echo "【失败】"
        ((FAIL_COUNT++))
    fi
done

if [ $FAIL_COUNT -gt 0 ]; then exit 1; else exit 0; fi