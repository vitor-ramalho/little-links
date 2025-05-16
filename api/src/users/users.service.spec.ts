import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let _userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    _userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user when email is not in use', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      const createdUser = {
        id: 'user-123',
        ...createUserDto,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictException when email is already in use', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      const existingUser = {
        id: 'existing-user-123',
        email: createUserDto.email,
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      const email = 'test@example.com';
      const user = {
        id: 'user-123',
        email,
        name: 'Test User',
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(user);
    });

    it('should return null when user is not found by email', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user when found by id', async () => {
      const id = 'user-123';
      const user = {
        id,
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findById(id);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user is not found by id', async () => {
      const id = 'nonexistent-id';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(id)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });
});
