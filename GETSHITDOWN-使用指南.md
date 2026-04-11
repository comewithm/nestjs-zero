# GetShitDone（GSD）使用指南

## 这是什么

GSD（Get Shit Done）是一套面向 Agent 开发的项目工作流命令集合，核心是：

- 用 `ROADMAP` 管阶段
- 用 `PLAN` 管执行步骤
- 用 `SUMMARY/VERIFICATION` 管结果与验收
- 用 `STATE` 跨会话续航

---

## 一、快速上手（最短路径）

```bash
/gsd-new-project
/gsd-plan-phase 1
/gsd-execute-phase 1
```

主循环：

```text
/gsd-new-project → /gsd-plan-phase → /gsd-execute-phase → repeat
```

更新 GSD：

```bash
npx get-shit-done-cc@latest
```

---

## 二、核心命令分组（按使用频率）

## 1) 项目启动与建模

- `/gsd-new-project`：新项目初始化（调研、需求、路线图一体化）
- `/gsd-map-codebase`：已有项目先做代码库地图（brownfield 推荐）
- `/gsd-new-milestone "<name>"`：开启新里程碑

## 2) 阶段规划与执行

- `/gsd-discuss-phase <n>`：先澄清阶段目标（可 `--batch`）
- `/gsd-plan-phase <n>`：生成该阶段执行计划
- `/gsd-execute-phase <n>`：执行该阶段全部计划
- `/gsd-execute-phase <n> --wave <k>`：只执行指定 wave
- `/gsd-research-phase <n>`：复杂领域先做深度研究

## 3) 快速任务（非大阶段）

- `/gsd-quick [--full|--validate|--discuss|--research]`：轻量但保留 GSD 保障
- `/gsd-fast "<desc>"`：极小任务直做（无子代理、无计划文件）
- `/gsd-do "<desc>"`：不知道用哪个命令时让路由器自动匹配

## 4) 进度与会话续航

- `/gsd-progress`：查看进度并路由下一步
- `/gsd-resume-work`：恢复上次上下文
- `/gsd-pause-work`：暂停时写入交接状态

## 5) 质量、验证与交付

- `/gsd-verify-work <n>`：UAT 式验收
- `/gsd-review --phase <n> --all`：多 AI 交叉评审
- `/gsd-ship <n>`：创建 PR 并准备交付
- `/gsd-pr-branch [target]`：生成不含 `.planning/` 噪音的干净 PR 分支

## 6) 路线图与任务管理

- `/gsd-add-phase "<desc>"`：追加阶段
- `/gsd-insert-phase <after> "<desc>"`：插入紧急阶段（如 7.1）
- `/gsd-remove-phase <n>`：删除未来阶段并重排编号
- `/gsd-add-todo [desc]`：快速入待办
- `/gsd-check-todos [area]`：查看并挑选待办
- `/gsd-note <text>`：零摩擦记笔记

## 7) 调试与审计

- `/gsd-debug "<issue>"`：系统化调试（可 `/clear` 后恢复）
- `/gsd-audit-uat`：跨阶段 UAT 债务审计
- `/gsd-audit-milestone [version]`：里程碑达成度审计
- `/gsd-plan-milestone-gaps`：把审计缺口转成新阶段

## 8) 配置与维护

- `/gsd-settings`：交互式配置
- `/gsd-set-profile <quality|balanced|budget|inherit>`：切模型策略
- `/gsd-cleanup`：归档已完成里程碑阶段目录
- `/gsd-update`：查看变更并升级
- `/gsd-help`：查看完整命令参考

---

## 三、推荐工作流（标准版）

```mermaid
flowchart TD
    A[新需求/新项目] --> B{是否已有代码库?}
    B -->|是| C[/gsd-map-codebase]
    B -->|否| D[/gsd-new-project]
    C --> D

    D --> E[/gsd-plan-phase 1]
    E --> F[/gsd-execute-phase 1]
    F --> G[/gsd-verify-work 1]
    G --> H{通过验收?}
    H -->|否| I[/gsd-debug 或 /gsd-quick 修复]
    I --> F
    H -->|是| J{还有后续阶段?}
    J -->|有| K[/gsd-plan-phase N]
    K --> L[/gsd-execute-phase N]
    L --> G
    J -->|无| M[/gsd-ship N]
```

---

## 四、常见场景速用

### 场景 A：今天只想快速修一个小问题

```bash
/gsd-fast "fix typo in README"
```

如果任务不再是“极小”，切换：

```bash
/gsd-quick --validate
```

### 场景 B：中途发现必须先插入紧急工作

```bash
/gsd-insert-phase 5 "Critical security fix"
/gsd-plan-phase 5.1
/gsd-execute-phase 5.1
```

### 场景 C：上下文爆了，需要清空后继续

```bash
/clear
/gsd-resume-work
```

### 场景 D：不知道该敲哪个命令

```bash
/gsd-do "I want to refactor auth with minimal risk"
```

---

## 五、关键目录速记

```text
.planning/
├── PROJECT.md
├── ROADMAP.md
├── STATE.md
├── config.json
├── phases/
├── quick/
├── todos/
├── debug/
├── milestones/
└── codebase/
```

---

## 六、推荐实践（避免走弯路）

- 先 `/gsd-discuss-phase` 再 `/gsd-plan-phase`，能减少“规划偏题”
- 复杂领域先 `/gsd-research-phase`，不要边做边猜
- 大改动优先 `--wave` 分批执行，降低回滚成本
- 每次交付前跑 `/gsd-verify-work`，避免“看起来完成”
- 不确定命令时直接 `/gsd-do`，让路由器决策

