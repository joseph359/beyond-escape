


**增加日志空间**

### 第一步：查看现有的文件路径

在 `isql` 中执行以下命令，列出当前所有的设备信息：

SQL

```
sp_helpdevice
go
```

**怎么看结果：**

1. 找到输出结果中的 `device_name` 列（设备名）和 `physical_name` 列（物理路径）。
    
2. 找一个看起来是数据文件的路径。
    
    - 例如，你可能会看到：`/data/sybase/test1_data.dat` 或者 `D:\sybase\data\test1.dat`。
        
3. **复制这个路径的目录部分**。
    
    - 如果现有路径是 `/opt/sybase/data/master.dat`
        
    - 那么你的新路径就可以写成 `/opt/sybase/data/test1_log_fix.dat`
        
    - _原理：既然这里已经放了数据库文件，说明这个目录是存在的，且 Sybase 有权限读写。_
        

### 第二步：尝试创建新设备 (盲测空间)

假设你在第一步里看到现有文件的路径是 `/opt/sybase/data/`。

我们在 `isql` 里尝试在这个目录下创建一个 500MB 的新文件。

SQL

```
use master
go

disk init
name = 'test1_log_rescue',                   -- 给新设备起个临时名字
physname = '/opt/sybase/data/test1_log_rescue.dat', -- 【关键】使用第一步查到的目录，换个文件名
size = '500M'                                -- 先试 500M，如果报错空间不足，就改成 '100M' 试试
go
```

- **如果成功**：会显示 `Disk setup ...` 相关的成功信息。
    
- **如果失败**：
    
    - 如果提示 `No space left on device`：说明这个磁盘满了。你需要看 `sp_helpdevice` 结果里有没有指向其他目录（其他磁盘分区）的文件，换个目录试试。
        
    - 如果提示 `Permission denied`：说明无权写入，但既然你用了现有目录，这种情况很少见。
        

### 第三步：挂载并扩容

如果第二步成功了，立刻把这个空间加给 `TEST_1` 的日志：

SQL

```
alter database TEST_1
log on test1_log_rescue = '500M' -- 大小要和上面创建的一致
go
```

### 第四步：清空日志

扩容成功后，执行最后的清理：

SQL

```
use master
go
dump transaction TEST_1 with truncate_only
go
```

**核心思路：** 利用 `sp_helpdevice` 抄作业（复制现有路径），把新文件放在老文件旁边。

---

**增加数据空间**


### 发生了什么？ (错误代码 1105)

你之前的操作是给**日志 (Log)** 扩容，现在报错 `default segment is full`，意思是**数据 (Data) 存放的空间**也满了。

你可以把数据库想象成一个仓库：

1. **Log（账本）：** 记录谁进出过。之前账本写满了，你刚换了个新账本（扩容日志）。
    
2. **Data（货架）：** 存放实际货物。现在的错误是**货架也塞满了**，再也塞不进任何货物（数据行）了。
    

---

### 解决方法：给数据空间扩容

操作逻辑和刚才扩充日志几乎一样，唯一的区别是命令里**不要加 `log on`**，而是直接 `on`。

请按照以下步骤，再创建一个设备并挂载给数据空间：

#### 第一步：新建一个专门存数据的设备

利用你刚才成功的路径 `D:\sybase_data\data\`，我们再建一个新文件：

SQL

```
use master
go

disk init
name = 'test1_data_rescue',                    -- 名字叫 data_rescue
physname = 'D:\sybase_data\data\test1_data_rescue.dat', -- 注意文件名改一下
size = '500M'                                  -- 给数据也来 500M (或更多)
go
```

#### 第二步：把这个设备加给数据库（注意语法区别）

**关键点：** 这次命令里**没有** `log` 这个词。

SQL

```
alter database TEST_1
on test1_data_rescue = '500M'   -- 这里是 'on'，不是 'log on'
go
```

#### 第三步：重新运行 BCP

执行完上述命令后，你的“货架”就多了 500MB 空间。此时重新运行你的 `bcp` 导入命令即可。


