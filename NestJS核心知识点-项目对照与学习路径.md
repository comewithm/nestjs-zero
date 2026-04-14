# NestJS 核心知识点与 nestjs-zero 项目对照

> 文档章节与 [NestJS 中文站](https://nestjs.uihtm.com/) 中「控制器 / 提供者 / 模块 / 中间件 / 异常过滤器 / 管道 / 守卫 / 拦截器 / 自定义装饰器」对应，用于：**已学内容验收**、**缺口补齐**、**按项目循序渐进练习**。

---

## 一、总览：已使用 vs 未使用

| 知识点 | 项目中是否出现 | 学习深度（相对官方章节） |
|--------|----------------|---------------------------|
| 控制器 | ✅ 多处使用 | **部分掌握** |
| 提供者 | ✅ 广泛使用 | **部分掌握** |
| 模块 | ✅ 广泛使用 | **部分掌握** |
| 中间件 | ❌ 未使用 | **未学/未练** |
| 异常过滤器 | ✅ 全局过滤器 | **部分掌握** |
| 管道 | ✅ 全局 + 内置 + 自定义类（未绑定路由） | **部分掌握** |
| 守卫 | ✅ JWT / 可选 JWT | **部分掌握** |
| 拦截器 | ✅ 全局响应包装 | **部分掌握** |
| 自定义装饰器 | ✅ 参数装饰器 | **部分掌握** |

---

## 二、已使用知识点：划分与查缺补漏

### 1. 控制器（Controllers）

**项目中已体现：**

- `@Controller` 与路由前缀：`users`、`articles`、`auth`、`profiles` 等。
- HTTP 方法：`@Get` `@Post` `@Put` `@Delete`。
- 参数：`@Param` `@Body` `@Query`，以及 `ParseIntPipe`（如 `UsersController`）。
- 依赖注入：构造函数注入 `*Service`。
- Swagger：`@ApiTags` `@ApiOperation` `@ApiBearerAuth` 等（`AuthController`）。

**判定：部分学习（未覆盖官方常见进阶点）**

**缺口清单：**

| 类别 | 说明 |
|------|------|
| 与官方对照 | 未使用：路由版本（Versioning）、全局/控制器前缀组合的高级场景、`@Header`/`@Redirect`、SSE/流式响应等。 |
| 与本项目相关 | `AppController` 当前无路由方法，仅保留与管道相关的**示例类**（`UsernameValidationPipe`、`RangeValidationPipe`），属于「写在控制器文件里但未通过任何端点练习」的**死代码式示例**，容易让人误以为已用在路由上。 |
| 建议补齐 | 要么给 `AppController` 增加极简演示路由并绑定上述管道，要么迁至独立 demo 模块并删掉冗余，避免「学了管道类却从未挂到路由」。 |

---

### 2. 提供者（Providers）

**项目中已体现：**

- 各业务 `@Injectable()` Service：`UsersService`、`AuthService`、`ArticlesService` 等。
- 与 TypeORM：`TypeOrmModule.forFeature` + 仓储注入。
- 与 Passport：`JwtStrategy` 作为可注入提供者。
- **动态模块工厂**：`JwtModule.registerAsync` + `useFactory` + `ConfigService` 注入（`auth.module.ts`）。
- 测试：`users.service.spec.ts` 中使用 `useValue` 模拟 Repository。

**判定：部分学习**

**缺口清单：**

| 类别 | 说明 |
|------|------|
| 业务模块内自定义 Provider | 较少使用 `useClass` / `useFactory` / `useValue` 在 `@Module({ providers: [...] })` 中显式注册可替换实现（除测试外）。 |
| 作用域 | 未使用请求级（`Scope.REQUEST`）等提供者作用域。 |
| 循环依赖 | 未涉及 `forwardRef` 场景（若后续拆分模块可能出现）。 |

---

### 3. 模块（Modules）

**项目中已体现：**

- 功能拆分：`AuthModule`、`ArticlesModule`、`ProfileModule`、`TagsModule` 等。
- `imports` / `controllers` / `providers` / `exports`（如 `ArticlesModule` 导出 `ArticlesService`）。
- `ConfigModule.forRoot({ isGlobal: true })`：全局配置模块。
- `TypeOrmModule.forRootAsync`：异步根配置。
- `TypeOrmModule.forFeature`：实体级注册。

**判定：部分学习**

**缺口清单：**

| 类别 | 说明 |
|------|------|
| 全局业务模块 | 未自定义 `@Global()` 业务模块（仅依赖 `ConfigModule` 的全局行为）。 |
| 动态模块自研 | 会使用第三方动态模块（`JwtModule`、`TypeOrmModule`），未自写 `Module.register` 类 API。 |
| 模块组织 | `AppModule` 同时注册 `UsersController` 与 `UsersService`，与 `AuthModule` 内再次提供 `UsersService` 等，需在团队内明确「用户领域」边界，避免重复注册与职责模糊（属架构习惯，官方文档会讲模块边界）。 |

---

### 4. 中间件（Middlewares）

**项目中已体现：** 无（未发现 `NestMiddleware`、`MiddlewareConsumer`、`app.use` 注册自定义 Nest 中间件）。

**判定：未使用 / 未练**

**缺口：** 整章可视为待学；与 RealWorld API 常见结合点见下文「循序渐进」第 2 步。

---

### 5. 异常过滤器（Exception Filters）

**项目中已体现：**

- 全局：`app.useGlobalFilters(new HttpExceptionFilter())`（`main.ts`）。
- `@Catch(HttpException)` + `ExceptionFilter` 接口，统一 JSON 错误结构。

**判定：部分学习**

**缺口清单：**

| 类别 | 说明 |
|------|------|
| 异常类型 | 仅处理 `HttpException`；未处理非 HTTP 异常、未捕获运行时错误（如 `AllExceptionsFilter` 模式）。 |
| 绑定方式 | 仅全局；未在控制器/方法上使用 `@UseFilters`。 |
| 其他上下文 | 未涉及微服务/RPC/WebSocket 的 `ArgumentsHost` 分支（若未来扩展）。 |

---

### 6. 管道（Pipes）

**项目中已体现：**

- 全局：`ValidationPipe`（`main.ts`）。
- 内置：`ParseIntPipe`（`UsersController` 的 `@Param`）。
- DTO：`class-validator` + `class-transformer`（如 `QueryArticlesDto`、`RegisterDto`）。
- 自定义类：`UsernameValidationPipe`、`RangeValidationPipe`（定义在 `app.controller.ts` 内）。

**判定：部分学习**

**缺口清单：**

| 类别 | 说明 |
|------|------|
| 自定义管道落地 | 两个自定义管道**未通过 `@Param`/`@Query`/`@UsePipes` 绑定到任何路由**，与「管道」章节要求的端到端练习不一致。 |
| 细粒度管道 | 未使用控制器级/方法级 `@UsePipes(new ValidationPipe({ ... }))` 做差异化校验选项。 |
| 其他内置管道 | 可补充 `ParseBoolPipe`、`DefaultValuePipe` 等（按需）。 |

---

### 7. 守卫（Guards）

**项目中已体现：**

- `JwtAuthGuard`、`OptionalJwtAuthGuard` 继承 `@nestjs/passport` 的 `AuthGuard('jwt')`。
- `@UseGuards` 在文章、资料、认证等控制器上使用。

**判定：部分学习**

**缺口清单：**

| 类别 | 说明 |
|------|------|
| 声明式元数据 | 未使用 `SetMetadata` + `Reflector` 实现基于角色/权限的守卫（RBAC 常见写法）。 |
| 手写 `CanActivate` | 未脱离 Passport 自写纯 Nest `Guard` 做简单规则（适合学习与单测）。 |
| 与本项目相关 | `ArticlesController` 中 `removeTagFromArticle` 等路由的鉴权策略需与产品一致（是否应加 `@UseGuards(JwtAuthGuard)` 等），属安全与守卫知识的交叉点。 |

---

### 8. 拦截器（Interceptors）

**项目中已体现：**

- 全局：`TransformInterceptor` 统一 `{ success, data, message, timestamp }` 包装（`main.ts`）。

**判定：部分学习**

**缺口清单：**

| 类别 | 说明 |
|------|------|
| 局部拦截器 | 未使用 `@UseInterceptors` 在单路由做日志、缓存、超时。 |
| RxJS 侧 | 当前主要 `map`；可练习 `tap`、`catchError`、计时等。 |

---

### 9. 自定义装饰器（Custom Decorators）

**项目中已体现：**

- `CurrentUser`：`createParamDecorator` 从 `request.user` 取当前用户。

**判定：部分学习**

**缺口清单：**

| 类别 | 说明 |
|------|------|
| 方法/类装饰器 | 未组合 `applyDecorators`（如同时附加 `@ApiBearerAuth` + `@UseGuards`）。 |
| 元数据装饰器 | 未自定义 `@Roles('admin')` 等与守卫联动。 |

---

## 三、项目中尚未用到的知识点（划分与用途）

以下为官方章节中常见、但本仓库**基本未触碰**的能力，可按模块归类：

| 划分 | 内容提要 |
|------|----------|
| 请求流水线前置 | 可配置、可路由匹配的 **Nest 中间件**（日志、耗时、原始 body 等）。 |
| 错误处理完备性 | **全局兜底**过滤器、多 `@Catch`、与日志/告警对接。 |
| 管道深度 | **自定义管道真实挂路由**、`@UsePipes` 分层、内置管道全家桶。 |
| 授权模型 | **Reflector + 元数据 + 守卫** 的 RBAC/细粒度权限。 |
| 拦截器深度 | **方法级**日志、性能、响应改写策略与全局策略的配合。 |
| 模块进阶 | **自定义动态模块**、`@Global()` 封装基础设施、`forwardRef` 解循环。 |
| 提供者进阶 | **请求作用域**、显式 `useFactory` 业务 Bean。 |

---

## 四、结合本项目的循序渐进功能开发（学习路线）

建议顺序兼顾依赖关系与 RealWorld 场景，每一步都对应「补上一类官方章节」。

### 第 1 步：管道 —— 让自定义管道「真的跑起来」

- **目标**：补齐「自定义 Pipe + 参数绑定」闭环。
- **做法（二选一）**：在 `UsersController` 或独立 `DemoController` 上为查询参数增加分页演示，使用已有的 `RangeValidationPipe`，或新建极简 `@Get('demo')` 绑定 `UsernameValidationPipe`。
- **对照文档**：管道（Pipes）。

### 第 2 步：中间件 —— 请求日志与耗时

- **目标**：第一次使用 `NestMiddleware` + `MiddlewareConsumer`（在 `AppModule` 中 `configure`），或对全局路径打日志。
- **做法**：记录 `method`、`url`、耗时；可跳过敏感头。
- **对照文档**：中间件（Middlewares）。

### 第 3 步：异常过滤器 —— 兜底非 HTTP 异常

- **目标**：增加 `AllExceptionsFilter` 或第二个 `@Catch()`，统一 500 与未预料错误结构，并与现有 `HttpExceptionFilter` 分工。
- **对照文档**：异常过滤器（Exception Filters）。

### 第 4 步：守卫 + 自定义装饰器 —— 基于角色的写操作

- **目标**：`@Roles('admin')` + `RolesGuard`（`Reflector`），仅对例如「删除用户」或「管理标签」接口生效（按你产品定义选路由）。
- **对照文档**：守卫（Guards）、自定义装饰器（Custom Decorators）。

### 第 5 步：拦截器 —— 局部日志或慢查询告警

- **目标**：某一控制器 `@UseInterceptors(LoggingInterceptor)`，与全局 `TransformInterceptor` 并存。
- **对照文档**：拦截器（Interceptors）。

### 第 6 步：模块 / 提供者 —— 小型动态配置模块（进阶）

- **目标**：将 JWT 以外的某类配置（如分页默认值、功能开关）封装为 `forRootAsync` 风格模块，或演示 `useFactory` 注册服务。
- **对照文档**：模块（Modules）、提供者（Providers）。

### 第 7 步：控制器进阶（可选）

- **目标**：URI 版本控制（`/v1/articles`）或统一前缀策略，与 Swagger 分组一并练习。
- **对照文档**：控制器（Controllers）。

---

## 五、已使用 vs 未使用：对照小结

| 维度 | 已使用部分 | 未使用或薄弱部分 |
|------|------------|------------------|
| 控制器 | 多资源 REST、Swagger、基础参数装饰器 | 版本控制、重定向/头、流式响应；`AppController` 演示管道未落地 |
| 提供者 | Injectable、异步动态模块（JWT、TypeORM） | 业务侧 `useFactory`/`useValue`、请求作用域 |
| 模块 | 拆分、exports、`ConfigModule` 全局 | 自研动态模块、`@Global` 业务包、`forwardRef` |
| 中间件 | — | 全流程未练 |
| 异常过滤器 | 全局 `HttpException` | 兜底异常、路由级过滤器 |
| 管道 | 全局校验、`ParseIntPipe`、DTO | 自定义管道挂路由、`@UsePipes` 分层 |
| 守卫 | Passport JWT / 可选 JWT | 元数据 + RBAC、纯 `CanActivate` |
| 拦截器 | 全局响应变换 | 路由级拦截器、日志/计时 |
| 自定义装饰器 | `CurrentUser` 参数装饰器 | `applyDecorators`、`Roles` 等元数据装饰器 |

---

## 六、参考链接

- [控制器](https://nestjs.uihtm.com/10/controllers)
- [提供者](https://nestjs.uihtm.com/10/providers)
- [模块](https://nestjs.uihtm.com/10/modules)
- [中间件](https://nestjs.uihtm.com/10/middlewares)
- [异常过滤器](https://nestjs.uihtm.com/10/exceptionfilters)
- [管道](https://nestjs.uihtm.com/10/pipes)
- [守卫](https://nestjs.uihtm.com/10/guards)
- [拦截器](https://nestjs.uihtm.com/10/interceptors)
- [自定义装饰器](https://nestjs.uihtm.com/10/customdecorators)

---

*本文档由对照仓库 `nestjs-zero` 源码结构生成，若后续代码变更，请同步更新本章中的文件与行为描述。*
