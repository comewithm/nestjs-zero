# Jest 测试语法和 API 详解

## 一、测试文件基本结构

### describe - 测试套件

```typescript
describe('测试套件名称', () => {
  // 测试用例和设置
});
```

**说明**：
- `describe` 用于组织相关的测试用例
- 可以嵌套使用，形成测试分组
- 第一个参数是测试套件的描述
- 第二个参数是包含测试用例的函数

**示例**：
```typescript
describe('UsersService', () => {
  describe('findOne', () => {
    // 测试 findOne 方法的用例
  });
  
  describe('create', () => {
    // 测试 create 方法的用例
  });
});
```

---

## 二、测试生命周期钩子

### 1. beforeEach - 每个测试前执行

```typescript
beforeEach(async () => {
  // 在每个测试用例执行前运行
  // 通常用于准备测试环境、重置 Mock 等
});
```

**作用**：
- 在每个 `it` 测试前执行
- 用于准备测试数据和重置状态
- 确保每个测试都是独立的环境

**示例**：
```typescript
beforeEach(async () => {
  // 创建测试模块
  const module = await Test.createTestingModule({
    providers: [UsersService],
  }).compile();
  
  service = module.get<UsersService>(UsersService);
});
```

### 2. afterEach - 每个测试后执行

```typescript
afterEach(() => {
  // 在每个测试用例执行后运行
  // 通常用于清理资源
});
```

**作用**：
- 在每个测试后执行
- 用于清理测试数据、重置 Mock 等

### 3. beforeAll - 所有测试前执行一次

```typescript
beforeAll(async () => {
  // 在所有测试开始前执行一次
});
```

**作用**：
- 只执行一次，在所有测试开始前
- 用于初始化全局资源（如数据库连接）

### 4. afterAll - 所有测试后执行一次

```typescript
afterAll(async () => {
  // 在所有测试结束后执行一次
});
```

**作用**：
- 只执行一次，在所有测试结束后
- 用于清理全局资源

---

## 三、测试用例

### it 或 test - 单个测试用例

```typescript
it('测试描述', async () => {
  // 测试代码
});

// 或者
test('测试描述', async () => {
  // 测试代码
});
```

**说明**：
- `it` 和 `test` 完全等价，可以互换使用
- 第一个参数是测试描述（应该清晰描述测试内容）
- 第二个参数是测试函数（可以是 async 函数）
- 每个 `it` 应该只测试一个功能点

**示例**：
```typescript
it('should return a user when found', async () => {
  // 测试代码
});

it('should return null when user not found', async () => {
  // 测试代码
});
```

---

## 四、NestJS 测试 API

### 1. Test.createTestingModule - 创建测试模块

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    UsersService,  // 要测试的服务
    {
      provide: getRepositoryToken(User),  // 提供依赖的 Token
      useValue: mockRepository,  // 使用 Mock 对象替代真实依赖
    },
  ],
}).compile();
```

**说明**：
- 创建独立的测试模块，不依赖真实的数据库或其他服务
- `providers`：注册要测试的服务和其依赖
- `getRepositoryToken(User)`：获取 Repository 的注入 Token
- `useValue`：使用 Mock 对象替代真实依赖
- `.compile()`：编译测试模块

**示例**：
```typescript
const module = await Test.createTestingModule({
  providers: [
    UsersService,
    {
      provide: getRepositoryToken(User),
      useValue: {
        findOne: jest.fn(),
        save: jest.fn(),
        // ... 其他方法
      },
    },
  ],
}).compile();
```

### 2. module.get<T>() - 获取服务实例

```typescript
service = module.get<UsersService>(UsersService);
repository = module.get<Repository<User>>(getRepositoryToken(User));
```

**说明**：
- 从测试模块中获取服务实例
- 用于在测试中使用服务
- 类型参数 `<T>` 指定返回类型

---

## 五、Mock（模拟）相关 API

### 1. jest.fn() - 创建 Mock 函数

```typescript
const mockFn = jest.fn();
```

**说明**：
- 创建一个可追踪的 Mock 函数
- 可以记录调用次数、参数等
- 可以设置返回值或实现

**示例**：
```typescript
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};
```

### 2. mockFn.mockReturnValue() - 设置返回值（同步）

```typescript
mockRepository.create.mockReturnValue(mockUser);
```

**说明**：
- 设置同步函数的返回值
- 用于 `create` 这类同步方法
- 每次调用都返回相同的值

**示例**：
```typescript
const mockUser = { id: 1, email: 'test@example.com' };
mockRepository.create.mockReturnValue(mockUser);

const result = repository.create({ email: 'test@example.com' });
// result === mockUser
```

### 3. mockFn.mockResolvedValue() - 设置 Promise 返回值（异步）

```typescript
mockRepository.findOne.mockResolvedValue(mockUser);
```

**说明**：
- 设置异步函数返回已解决的 Promise
- 用于 `findOne`、`save` 等返回 Promise 的方法
- 相当于 `Promise.resolve(mockUser)`

**示例**：
```typescript
mockRepository.findOne.mockResolvedValue(mockUser);

const result = await repository.findOne({ where: { id: 1 } });
// result === mockUser
```

### 4. mockFn.mockRejectedValue() - 设置 Promise 拒绝值（错误）

```typescript
mockRepository.findOne.mockRejectedValue(new Error('Database error'));
```

**说明**：
- 模拟异步函数抛出错误
- 用于测试错误处理逻辑
- 相当于 `Promise.reject(error)`

**示例**：
```typescript
mockRepository.findOne.mockRejectedValue(new Error('Database error'));

await expect(service.findOne(1)).rejects.toThrow('Database error');
```

### 5. mockFn.mockImplementation() - 自定义实现

```typescript
mockRepository.findOne.mockImplementation((options) => {
  if (options.where.id === 1) {
    return Promise.resolve(mockUser);
  }
  return Promise.resolve(null);
});
```

**说明**：
- 自定义 Mock 函数的实现逻辑
- 可以根据参数返回不同的值
- 更灵活，适合复杂场景

**示例**：
```typescript
mockRepository.findOne.mockImplementation((options) => {
  const { where } = options;
  if (where.id === 1) {
    return Promise.resolve({ id: 1, email: 'user1@example.com' });
  }
  if (where.email === 'test@example.com') {
    return Promise.resolve({ id: 2, email: 'test@example.com' });
  }
  return Promise.resolve(null);
});
```

### 6. mockFn.mockClear() - 清除调用记录

```typescript
mockFn.mockClear();
```

**说明**：
- 清除 Mock 函数的调用记录
- 但保留返回值设置
- 通常在 `beforeEach` 中使用

### 7. mockFn.mockReset() - 重置 Mock 函数

```typescript
mockFn.mockReset();
```

**说明**：
- 重置 Mock 函数，清除所有调用记录和返回值设置
- 恢复到初始状态

---

## 六、断言（Assertions）API

### expect(value) - 创建断言

```typescript
expect(actualValue).toBe(expectedValue);
```

**说明**：
- `expect` 是 Jest 的核心断言函数
- 返回一个"期望对象"，可以链式调用断言方法

---

### 相等性断言

#### toBe() - 严格相等

```typescript
expect(result).toBe(expectedValue);
```

**说明**：
- 使用 `===` 进行比较
- 对于对象，比较的是引用（必须是同一个对象实例）

**示例**：
```typescript
const obj = { name: 'test' };
expect(obj).toBe(obj);  // ✅ 通过（同一个对象）
expect({ name: 'test' }).toBe({ name: 'test' });  // ❌ 失败（不同对象）
```

#### toEqual() - 深度相等

```typescript
expect(result).toEqual(expectedValue);
```

**说明**：
- 深度比较对象内容
- 对象内容相同即可，不需要是同一个实例

**示例**：
```typescript
expect({ name: 'test' }).toEqual({ name: 'test' });  // ✅ 通过
expect([1, 2, 3]).toEqual([1, 2, 3]);  // ✅ 通过
```

#### not - 取反

```typescript
expect(result).not.toBe(null);
expect(result).not.toEqual({});
```

**说明**：
- 在断言前加 `.not` 表示取反
- 可以用于所有断言方法

---

### 真值断言

#### toBeTruthy() - 为真值

```typescript
expect(value).toBeTruthy();
```

**说明**：
- 检查值是否为真值（truthy）
- 真值包括：非空字符串、非零数字、true、对象等

#### toBeFalsy() - 为假值

```typescript
expect(value).toBeFalsy();
```

**说明**：
- 检查值是否为假值（falsy）
- 假值包括：false、0、''、null、undefined、NaN

#### toBeNull() - 为 null

```typescript
expect(result).toBeNull();
```

#### toBeUndefined() - 为 undefined

```typescript
expect(result).toBeUndefined();
```

#### toBeDefined() - 已定义（不为 undefined）

```typescript
expect(result).toBeDefined();
```

---

### 数字断言

#### toBeGreaterThan() - 大于

```typescript
expect(number).toBeGreaterThan(3);
```

#### toBeGreaterThanOrEqual() - 大于等于

```typescript
expect(number).toBeGreaterThanOrEqual(3);
```

#### toBeLessThan() - 小于

```typescript
expect(number).toBeLessThan(5);
```

#### toBeLessThanOrEqual() - 小于等于

```typescript
expect(number).toBeLessThanOrEqual(5);
```

---

### 字符串断言

#### toContain() - 包含子字符串

```typescript
expect(str).toContain('substring');
```

**示例**：
```typescript
expect('Hello World').toContain('World');  // ✅ 通过
```

#### toMatch() - 匹配正则表达式

```typescript
expect(str).toMatch(/regex/);
```

**示例**：
```typescript
expect('test@example.com').toMatch(/^[\w-]+@[\w-]+\.\w+$/);  // ✅ 通过
```

---

### 数组断言

#### toContain() - 包含元素

```typescript
expect(array).toContain(item);
```

**示例**：
```typescript
expect([1, 2, 3]).toContain(2);  // ✅ 通过
```

#### toHaveLength() - 长度为指定值

```typescript
expect(array).toHaveLength(3);
```

**示例**：
```typescript
expect([1, 2, 3]).toHaveLength(3);  // ✅ 通过
```

---

### 对象断言

#### toHaveProperty() - 有属性

```typescript
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('key', 'value');  // 属性值为指定值
```

**示例**：
```typescript
expect({ name: 'test', age: 20 }).toHaveProperty('name');  // ✅ 通过
expect({ name: 'test' }).toHaveProperty('name', 'test');  // ✅ 通过
```

---

## 七、Mock 函数验证

### 1. toHaveBeenCalled() - 验证是否被调用

```typescript
expect(mockFn).toHaveBeenCalled();
```

**说明**：
- 验证 Mock 函数至少被调用过一次
- 不关心调用参数

**示例**：
```typescript
mockRepository.findOne.mockResolvedValue(null);
await service.findOne(1);
expect(mockRepository.findOne).toHaveBeenCalled();  // ✅ 通过
```

### 2. toHaveBeenCalledTimes(n) - 验证调用次数

```typescript
expect(mockFn).toHaveBeenCalledTimes(1);
```

**说明**：
- 验证 Mock 函数被调用的次数
- 参数是期望的调用次数

**示例**：
```typescript
await service.findOne(1);
expect(mockRepository.findOne).toHaveBeenCalledTimes(1);  // ✅ 通过

await service.findOne(1);
await service.findOne(2);
expect(mockRepository.findOne).toHaveBeenCalledTimes(2);  // ✅ 通过
```

### 3. toHaveBeenCalledWith(...args) - 验证调用参数

```typescript
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
```

**说明**：
- 验证 Mock 函数是否用指定的参数调用过
- 至少有一次调用使用了这些参数

**示例**：
```typescript
await service.findOne(1);
expect(mockRepository.findOne).toHaveBeenCalledWith({
  where: { id: 1 }
});  // ✅ 通过
```

### 4. toHaveBeenLastCalledWith(...args) - 验证最后一次调用参数

```typescript
expect(mockFn).toHaveBeenLastCalledWith(arg1, arg2);
```

**说明**：
- 验证最后一次调用的参数

**示例**：
```typescript
await service.findOne(1);
await service.findOne(2);
expect(mockRepository.findOne).toHaveBeenLastCalledWith({
  where: { id: 2 }
});  // ✅ 通过
```

### 5. toHaveBeenNthCalledWith(n, ...args) - 验证第 n 次调用参数

```typescript
expect(mockFn).toHaveBeenNthCalledWith(1, arg1, arg2);
```

**说明**：
- 验证第 n 次调用的参数
- 第一个参数是调用次数（从 1 开始）

**示例**：
```typescript
await service.findOne(1);
await service.findOne(2);
expect(mockRepository.findOne).toHaveBeenNthCalledWith(1, {
  where: { id: 1 }
});  // ✅ 通过
expect(mockRepository.findOne).toHaveBeenNthCalledWith(2, {
  where: { id: 2 }
});  // ✅ 通过
```

---

## 八、测试编写模式：AAA 模式

### Arrange（准备）→ Act（执行）→ Assert（断言）

```typescript
it('测试描述', async () => {
  // Arrange（准备）：准备测试数据和 Mock
  const testData = { email: 'test@example.com' };
  const expectedResult = { id: 1, ...testData };
  mockRepository.save.mockResolvedValue(expectedResult);

  // Act（执行）：执行被测试的方法
  const result = await service.create(testData);

  // Assert（断言）：验证结果
  expect(result).toEqual(expectedResult);
  expect(mockRepository.save).toHaveBeenCalledTimes(1);
});
```

**说明**：
- **Arrange**：准备测试所需的数据、Mock 设置
- **Act**：执行被测试的方法
- **Assert**：验证结果是否符合预期

---

## 九、常见测试场景示例

### 场景 1：测试成功情况

```typescript
it('should return user when found', async () => {
  // Arrange
  const userId = 1;
  const mockUser = { 
    id: userId, 
    email: 'test@example.com',
    username: 'testuser',
  };
  mockRepository.findOne.mockResolvedValue(mockUser);

  // Act
  const result = await service.findOne(userId);

  // Assert
  expect(result).toEqual(mockUser);
  expect(mockRepository.findOne).toHaveBeenCalledWith({
    where: { id: userId }
  });
});
```

### 场景 2：测试失败情况（返回 null）

```typescript
it('should return null when user not found', async () => {
  // Arrange
  mockRepository.findOne.mockResolvedValue(null);

  // Act
  const result = await service.findOne(999);

  // Assert
  expect(result).toBeNull();
  expect(mockRepository.findOne).toHaveBeenCalledWith({
    where: { id: 999 }
  });
});
```

### 场景 3：测试错误处理

```typescript
it('should throw error when database fails', async () => {
  // Arrange
  const error = new Error('Database connection failed');
  mockRepository.findOne.mockRejectedValue(error);

  // Act & Assert
  await expect(service.findOne(1)).rejects.toThrow('Database connection failed');
});
```

### 场景 4：测试方法调用顺序

```typescript
it('should call create then save when creating user', async () => {
  // Arrange
  const createUserDto = { email: 'test@example.com', username: 'test' };
  const mockUser = { id: 1, ...createUserDto };
  mockRepository.create.mockReturnValue(mockUser);
  mockRepository.save.mockResolvedValue(mockUser);

  // Act
  await service.create(createUserDto);

  // Assert
  expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
  expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
  expect(mockRepository.create).toHaveBeenCalledBefore(mockRepository.save);
});
```

---

## 十、完整测试文件示例

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService, CreateUserDto } from './users.service';
import { User } from './users.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  // Mock Repository
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    // 创建测试模块
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    // 获取服务实例
    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // 清除所有 Mock 的调用记录
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      // Arrange
      const userId = 1;
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        bio: null,
        image: null,
        articles: [],
        favoritedArticles: [],
      } as User;

      mockRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(repository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findOne(999);

      // Assert
      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      };

      const mockUser: User = {
        id: 1,
        ...createUserDto,
        bio: null,
        image: null,
        articles: [],
        favoritedArticles: [],
      } as User;

      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(repository.create).toHaveBeenCalledBefore(repository.save);
    });
  });
});
```

---

## 十一、运行测试

### 运行所有测试

```bash
npm test
```

### 运行特定测试文件

```bash
npm test -- users.service.spec.ts
```

### 运行测试并查看覆盖率

```bash
npm test -- --coverage
```

### 监听模式（自动运行测试）

```bash
npm test -- --watch
```

**说明**：
- 监听文件变化，自动运行测试
- 修改测试文件或源代码后自动重新测试
- 按 `a` 运行所有测试，按 `f` 只运行失败的测试

### 运行特定测试用例

```bash
npm test -- -t "测试描述"
```

**说明**：
- 只运行匹配描述的测试用例
- `-t` 是 `--testNamePattern` 的简写

**示例**：
```bash
npm test -- -t "should return user when found"
```

---

## 十二、E2E 测试（端到端测试）

### E2E 测试 vs 单元测试

| 特性 | 单元测试 | E2E 测试 |
|------|---------|---------|
| 测试范围 | 单个方法/函数 | 整个请求流程 |
| 依赖 | Mock 所有依赖 | 使用真实依赖 |
| 速度 | 快 | 慢 |
| 用途 | 测试业务逻辑 | 测试 API 接口 |

### E2E 测试基本结构

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],  // 导入完整的应用模块
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();  // 初始化应用
  });

  afterEach(async () => {
    await app.close();  // 关闭应用
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })
      .expect(201)  // 期望状态码
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('email', 'test@example.com');
      });
  });
});
```

### Supertest API

#### request(app.getHttpServer()) - 创建请求

```typescript
request(app.getHttpServer())
```

**说明**：
- `app.getHttpServer()` 获取 HTTP 服务器实例
- 返回一个可以链式调用的请求对象

#### HTTP 方法

```typescript
.get('/path')      // GET 请求
.post('/path')     // POST 请求
.put('/path')      // PUT 请求
.delete('/path')   // DELETE 请求
.patch('/path')    // PATCH 请求
```

#### 设置请求头

```typescript
.set('Authorization', 'Bearer token')
.set('Content-Type', 'application/json')
```

**示例**：
```typescript
request(app.getHttpServer())
  .post('/articles')
  .set('Authorization', 'Bearer your-token')
  .set('Content-Type', 'application/json')
  .send({ title: 'Test' })
```

#### 发送请求体

```typescript
.send({ key: 'value' })
```

**说明**：
- 发送 JSON 数据
- 自动设置 `Content-Type: application/json`

#### 设置查询参数

```typescript
.query({ page: 1, limit: 10 })
```

**示例**：
```typescript
request(app.getHttpServer())
  .get('/articles')
  .query({ author: 'testuser', limit: 10 })
```

#### 期望状态码

```typescript
.expect(200)  // 期望状态码为 200
.expect(201)  // 期望状态码为 201
.expect(404)  // 期望状态码为 404
```

#### 期望响应体

```typescript
.expect('Hello World!')  // 期望响应体为字符串
.expect({ key: 'value' })  // 期望响应体为对象
.expect((res) => {  // 自定义验证函数
  expect(res.body.success).toBe(true);
})
```

**说明**：
- 可以传入字符串、对象或函数
- 函数形式最灵活，可以自定义验证逻辑

---

## 十三、E2E 测试完整示例

### 用户注册接口 E2E 测试

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e-test@example.com',
          username: 'e2etestuser',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('email', 'e2e-test@example.com');
          expect(res.body.data).toHaveProperty('username', 'e2etestuser');
          expect(res.body.data).not.toHaveProperty('password');  // 密码不应该返回
        });
    });

    it('should return 409 when email already exists', async () => {
      // 先注册一个用户
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          username: 'user1',
          password: 'password123',
        });

      // 再次注册相同邮箱
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          username: 'user2',
          password: 'password123',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toContain('Email already exists');
        });
    });

    it('should return 400 when validation fails', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',  // 无效邮箱
          username: 'ab',  // 用户名太短
          password: '123',  // 密码太短
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(Array.isArray(res.body.message)).toBe(true);  // 验证错误是数组
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      // 先注册用户
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login-test@example.com',
          username: 'logintest',
          password: 'password123',
        });

      // 登录
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('token');
          expect(typeof res.body.data.token).toBe('string');
        });
    });

    it('should return 401 with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toContain('Invalid credentials');
        });
    });
  });
});
```

---

## 十四、测试最佳实践

### 1. 测试命名规范

```typescript
// ✅ 好的命名
it('should return user when found by id', async () => {});
it('should return null when user not found', async () => {});
it('should throw error when database connection fails', async () => {});

// ❌ 不好的命名
it('test findOne', async () => {});
it('works', async () => {});
```

**规则**：
- 使用 `should` 开头
- 描述清楚测试的场景和预期结果
- 使用完整的句子

### 2. 测试独立性

```typescript
beforeEach(async () => {
  // 每个测试前重置 Mock
  jest.clearAllMocks();
  
  // 重置 Mock 返回值
  mockRepository.findOne.mockResolvedValue(null);
});
```

**原则**：
- 每个测试应该独立，不依赖其他测试
- 使用 `beforeEach` 重置状态
- 避免测试之间的数据共享

### 3. 测试覆盖率

```typescript
// 测试所有分支
it('should handle success case', async () => {});
it('should handle error case', async () => {});
it('should handle null case', async () => {});
```

**目标**：
- 覆盖所有代码分支
- 测试成功和失败情况
- 测试边界条件

### 4. Mock 的使用原则

```typescript
// ✅ 好的做法：只 Mock 外部依赖
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

// ❌ 不好的做法：Mock 被测试的方法本身
const mockService = {
  findOne: jest.fn(),
};
```

**原则**：
- 只 Mock 外部依赖（数据库、API、文件系统等）
- 不要 Mock 被测试的代码本身
- Mock 应该尽可能简单

### 5. 断言要具体

```typescript
// ✅ 好的断言
expect(result).toEqual(expectedUser);
expect(result.email).toBe('test@example.com');
expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });

// ❌ 不好的断言
expect(result).toBeTruthy();  // 太模糊
expect(mockRepository.findOne).toHaveBeenCalled();  // 没有验证参数
```

---

## 十五、常见问题和解决方案

### 问题 1：Mock 函数没有重置

**症状**：测试之间相互影响

**解决**：
```typescript
beforeEach(() => {
  jest.clearAllMocks();  // 清除所有 Mock 的调用记录
  // 或
  mockRepository.findOne.mockReset();  // 重置特定 Mock
});
```

### 问题 2：异步测试没有等待

**症状**：测试通过但实际没有执行

**解决**：
```typescript
// ✅ 正确
it('should return user', async () => {
  const result = await service.findOne(1);
  expect(result).toBeDefined();
});

// ❌ 错误
it('should return user', () => {
  service.findOne(1).then(result => {
    expect(result).toBeDefined();  // 可能不会执行
  });
});
```

### 问题 3：类型错误

**症状**：TypeScript 类型检查失败

**解决**：
```typescript
// 使用类型断言
const mockUser = {
  id: 1,
  email: 'test@example.com',
} as User;  // 使用 as 断言

// 或使用 Partial
const mockUser: Partial<User> = {
  id: 1,
  email: 'test@example.com',
};
```

---

## 十六、测试命令总结

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有测试 |
| `npm test -- users.service.spec.ts` | 运行特定测试文件 |
| `npm test -- -t "测试描述"` | 运行匹配描述的测试 |
| `npm test -- --watch` | 监听模式，自动运行测试 |
| `npm test -- --coverage` | 运行测试并生成覆盖率报告 |
| `npm run test:e2e` | 运行 E2E 测试 |

---

## 总结

### 测试三要素

1. **Arrange（准备）**：准备测试数据和 Mock
2. **Act（执行）**：执行被测试的方法
3. **Assert（断言）**：验证结果

### 测试原则

1. **独立性**：每个测试应该独立运行
2. **可重复性**：测试结果应该一致
3. **快速性**：测试应该快速执行
4. **清晰性**：测试代码应该易于理解

### 测试类型

1. **单元测试**：测试单个方法/函数
2. **集成测试**：测试多个组件的协作
3. **E2E 测试**：测试完整的用户流程

---

**参考资源**：
- [Jest 官方文档](https://jestjs.io/)
- [NestJS 测试文档](https://docs.nestjs.com/fundamentals/testing)
- [Supertest 文档](https://github.com/visionmedia/supertest)