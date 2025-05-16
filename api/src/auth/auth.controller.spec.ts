import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService, ILoginResponse, IUserResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(
      (dto: RegisterDto): IUserResponse => ({
        id: 'test-id',
        email: dto.email,
        name: dto.name,
      }),
    ),
    login: jest.fn(
      (dto: LoginDto): ILoginResponse => ({
        accessToken: 'test-token',
        user: {
          id: 'test-id',
          email: dto.email,
          name: 'Test User',
        },
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const dto: RegisterDto = {
      email: 'test@example.com',
      password: 'pass123',
      name: 'Test User',
    };

    expect(await controller.register(dto)).toEqual({
      id: 'test-id',
      email: dto.email,
      name: dto.name,
    });

    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should login a user', async () => {
    const dto: LoginDto = {
      email: 'test@example.com',
      password: 'pass123',
    };

    expect(await controller.login(dto)).toEqual({
      accessToken: 'test-token',
      user: {
        id: 'test-id',
        email: dto.email,
        name: 'Test User',
      },
    });

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });
});
