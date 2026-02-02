
### 第一步：安装“三件套” (依赖环境)

新电脑是干净的，你需要先装好这三个软件（直接去官网下，或者用 Winget）：

1. **Git:** (版本控制工具)
    
    - 去 [git-scm.com](https://git-scm.com/) 下载 Windows 版。
        
    - _安装时一路“下一步”就行。_
        
2. **Node.js:** (Quartz 的运行环境)
    
    - 去 [nodejs.org](https://nodejs.org/) 下载 **LTS 版本** (长期支持版)。
        
    - _这一步不做，你的 `npx quartz` 命令就没法用。_
        
3. **Obsidian:** (你的编辑器)
    
    - 去官网下载并安装。
        

---

### 第二步：克隆仓库 (Git Clone)

不要用 U 盘拷文件！那是外行做法。我们要用 Git 拉取。

1. 在你想要存放笔记的地方（比如 `D盘` 或 `文档`），鼠标右键 -> **Open Git Bash here** (或者打开 CMD)。
    
2. 输入下面这行命令（把云端的代码完整拉下来）：
    
    Bash
    
    ```
    git clone https://github.com/joseph359/beyond-escape.git
    ```
    
3. 你会发现多了一个叫 `beyond-escape` 的文件夹。
    

---

### 第三步：恢复 Quartz 依赖 (npm install)

刚才拉下来的只是代码，Quartz 的“零件” (node_modules) 通常不会被上传到 GitHub，所以你需要重新组装一下。

1. 在黑窗口里进入文件夹：
    
    Bash
    
    ```
    cd beyond-escape
    ```
    
2. 执行安装命令：
    
    Bash
    
    ```
    npm ci
    ```
    
    _(这一步会下载很多东西，可能需要几分钟。如果报错网络问题，可能需要梯子或换淘宝源)_。
    

---

### 第四步：连接 Obsidian

1. 打开 **Obsidian**。
    
2. 点击 **“打开仓库” (Open folder as vault)**。
    
3. 选择你刚才克隆下来的 `beyond-escape` 文件夹。
    

🎉 **此时，你熟悉的笔记、插件、主题设置应该全部回来了！**

---

### ⚠️ 两个特别提醒

1. **身份验证：**
    
    在新电脑上第一次执行 `git push` 时，它会弹窗让你登录 GitHub。直接在弹出的浏览器里点“Authorize”授权即可（Win10/11 会自动记住密码）。
    
2. **验证环境：**
    
    为了确保一切正常，建议你立刻运行一下预览命令：
    
    Bash
    
    ```
    npx quartz build --serve
    ```
    
    如果能看到本地网页，说明你的新电脑环境配置完美成功！


**遇到问题一

PS C:\Users\cool'sheep\Documents\beyond-escape> node -v

v24.13.0

PS C:\Users\cool'sheep\Documents\beyond-escape> npm ci

npm : 无法加载文件 C:\Program Files\nodejs\npm.ps1，因为在此系统上禁止运行脚本。有关详细信息，请参阅 https:/go.microsof

t.com/fwlink/?LinkID=135170 中的 about_Execution_Policies。

所在位置 行:1 字符: 1**

这是一个非常经典的 Windows PowerShell **权限拦截**问题。

简单来说，Windows 默认为了安全，把 PowerShell 设置为“禁止运行任何脚本”，就像是把你刚买的法拉利锁在了车库里，只准看不准开。

即使你是管理员，默认也是锁着的。作为工程师，你需要手动**解除这个封印**。

这里有两种解决办法，**推荐第一种**，一次解决，永不复发。

🔧 方法一：解除 PowerShell 封印（推荐）

你需要告诉 Windows：“我是自己人，允许我运行脚本。”

1. **不要关闭**你现在的这个蓝色/黑色窗口。
    
2. 直接复制粘贴下面这行命令（注意空格和拼写），然后回车：
    
    PowerShell
    
    ```
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```
    
3. **关键步骤：** 系统可能会问你是否更改策略（显示 `[Y] 是 [A] 全是 ...`）。
    
4. 请输入 **`A`** （代表“全是”），然后**回车**。
    

**做完这步后，再次输入 `npm ci`，应该就能跑起来了！**