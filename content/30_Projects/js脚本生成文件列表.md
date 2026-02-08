// ==============================================
// Job 中 JavaScript 读取上游文件列表核心脚本
// ==============================================

// 1. 获取 Job 的结果集对象（存储上游的文件列表）
function extractTableName(filePath) {
    // 正则解释：
    // [^/_]+ 匹配表名（不含下划线和斜杠）
    // _\d+ 匹配 "_数字" 部分
    // \.CSV$ 匹配结尾的 .CSV（不区分大小写）
	const  regex = /([^/]+)_\d+\.CSV$/i;
    const  match = filePath.match(regex);
    
    // 匹配成功返回表名，失败返回空字符串（可根据需求调整）
    return match ? match[1] : '';
}

var job=parent_job;
var result = previous_result;
var rows = result.getResultFilesList(); // 结果集的行数据，返回 List 类型

// 2. 初始化变量存储文件列表和数量
var fileList = []; // 存储文件路径列表
var fileCount = 0; // 文件总数
var tableList=[];

// 3. 遍历结果集，读取文件信息
if (rows != null && rows.size() > 0) {
  // 遍历每一行（Kettle 中用 get(i) 获取第 i 行）
  for (var i = 0; i < rows.size(); i++) {
    var row = rows.get(i); // 获取单行数据（RowMetaAndData 对象）
    
    // 读取行中的字段（对应上游转换输出的字段名）
    var filePath = row.getFile().toString().substring(7); // 读取 filepath 字段，默认空字符串
    // 过滤空路径，避免无效数据
    if (filePath != "") {
      var tableName=extractTableName(filePath);
      if( tableList.indexOf(tableName) == -1){
        tableList.push(tableName);
      }
      fileList.push(filePath); // 加入文件列表
      fileCount++; // 计数+1
           
    }
  }
  
  // 4. 将文件列表和数量写入 Job 变量（供后续步骤使用）
  // 注意：变量值需转为字符串，列表用逗号分隔
  job.setVariable("FILE_LIST", fileList.join(",")); 
  job.setVariable("TABLE_NAME", tableList.join(","));
  job.setVariable("FILE_COUNT", fileCount + ""); // 转为字符串存储
  _entry_.logBasic("表名[TABLE_NAME]：" + tableList.join(","));
  _entry_.logBasic("总文件数[FILE_COUNT]：" + fileCount);
  _entry_.logBasic("文件列表[FILE_LIST]：" + fileList.join(","));
  
} else {
  // 无文件时的处理
  job.setVariable("FILE_LIST", "");
  job.setVariable("FILE_COUNT", "0");
  _entry_.logWarn("总文件数[FILE_COUNT]：" + 0);
}

// 5. 确保 Job 正常执行（必须返回 true，否则 Job 会中断）
fileCount>0;