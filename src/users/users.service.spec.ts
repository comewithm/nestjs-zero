import { Repository } from 'typeorm';
import { CreateUserDto, UsersService } from './users.service';
import { User } from './users.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserService', () => {
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User), // 提供 Repository Token
          useValue: mockRepository, // 使用Mock Repository
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      // 准备测试数据
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
        following: [],
        followers: []
      } as User;

      // Mock Repository 的 findOne 方法
      mockRepository.findOne.mockResolvedValue(mockUser);

      // 执行测试
      const result = await service.findOne(userId);

      // 验证结果
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(repository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      // Mock Repository 返回null
      mockRepository.findOne.mockResolvedValue(null);

      // 执行测试
      const result = await service.findOne(999);

      // 验证结果
      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // 准备测试数据
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
        following: [],
        followers: []
      } as User;

      // Mock repository 方法
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      // 执行测试
      const result = await service.create(createUserDto);

      // 验证结果
      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
    });
  });
});
