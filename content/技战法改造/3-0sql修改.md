
#### 旧版 SQL（你现在用的）

sql

```sql
SELECT
  CONCAT_WS(',', GROUP_CONCAT(M.zjhm SEPARATOR ',')) AS zjhm,
  MAX(M.familyCount) AS familyCount
FROM (
  SELECT
    q.brzjhm,
    q.zjhm,
    q.xm,
    COUNT(c.caseid) AS familyCount,   -- ⬅️ 问题在这
    REPLACE(UUID(), '-', '') AS familyProcessId
  FROM t_qsgx q
  INNER JOIN sys_dict_data s ON ...
  INNER JOIN t_qsgx c              -- ⬅️ 自连接
    ON c.brzjhm = q.brzjhm
    AND c.caseid = q.caseid
  WHERE q.brzjhm = '${idNumber}'
    AND q.caseid = '${caseId}'
  GROUP BY q.brzjhm, q.zjhm, q.xm
  
  UNION ALL
  
  SELECT ... FROM ss_elec_case_object o
  INNER JOIN t_qsgx c ...          -- ⬅️ 又连了一次
) M
GROUP BY M.brzjhm
```

**问题出在 `INNER JOIN t_qsgx c ON c.brzjhm = q.brzjhm`**。

假设张三（`brzjhm = '320102...'`）有 3 个亲属 A、B、C，`t_qsgx` 里有 3 行：

|brzjhm|zjhm|xm|
|---|---|---|
|320102...|111|A|
|320102...|222|B|
|320102...|333|C|

`q` 表扫出 3 行，`c` 表用 `c.brzjhm = q.brzjhm` 也匹配到这同样 3 行。结果是每行 q 都和 3 行 c 做笛卡尔积，变成 **3 × 3 = 9 行**：

|q.zjhm|c.caseid（被 COUNT 的）|
|---|---|
|A 的证件|A 的 caseid|
|A 的证件|B 的 caseid|
|A 的证件|C 的 caseid|
|B 的证件|A 的 caseid|
|B 的证件|B 的 caseid|
|B 的证件|C 的 caseid|
|C 的证件|A 的 caseid|
|C 的证件|B 的 caseid|
|C 的证件|C 的 caseid|

按 `q.zjhm` 分组后，每组 `COUNT(c.caseid)` = 3。所以 `familyCount = 3`，**这次碰巧对了**。

但如果 `t_qsgx` 里有重复行（同一个亲属录了两条，比如数据导入重复），3 个亲属变 4 行数据，`COUNT` 就变成 4，实际亲属还是 3 个。而且 `zjhm` 的拼接也可能出现重复值。

更根本的问题是：**这个自连接本身就没必要**。你要的只是"有哪些亲属的证件号"和"一共几个人"，根本不需要把 `t_qsgx` 连自己。

---

#### 新版 SQL

sql

```sql
SELECT
  GROUP_CONCAT(DISTINCT M.zjhm ORDER BY M.zjhm SEPARATOR ',') AS zjhm,
  COUNT(DISTINCT M.zjhm) AS familyCount
FROM (
  -- 取亲属证件号（去重）
  SELECT DISTINCT q.zjhm
  FROM t_qsgx q
  INNER JOIN sys_dict_data s
    ON s.dict_type = 'family_relationship'
    AND s.dict_label = q.ybrgx
  WHERE q.brzjhm = '${idNumber}'
    AND q.caseid = '${caseId}'
    AND q.zjhm IS NOT NULL
    AND q.zjhm <> ''
  
  UNION               -- ⬅️ UNION 自动去重
  
  SELECT '${idNumber}' AS zjhm   -- ⬅️ 把本人也加进去
) M
```

同样张三有 3 个亲属 A、B、C，内层查出来：

|zjhm|
|---|
|111（A）|
|222（B）|
|333（C）|
|320102...（本人）|

`DISTINCT` 确保不重复，`UNION`（不是 `UNION ALL`）也自动去重。外层直接 `COUNT(DISTINCT)` = 4，`GROUP_CONCAT` = `"111,222,333,320102..."`。

**没有自连接，没有笛卡尔积，数据怎么重复都不会膨胀。**

---

#### 一句话总结区别

旧版用了一个**不必要的自连接**来算人数，数据干净时碰巧结果对，但数据有重复时会膨胀。新版直接 `DISTINCT` + `UNION` 取去重列表再计数，逻辑更简单也更安全。