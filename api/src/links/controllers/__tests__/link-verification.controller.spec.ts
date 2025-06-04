import { Test, TestingModule } from '@nestjs/testing';
import { LinkVerificationController } from '../link-verification.controller';
import { LinksService } from '../../links.service';

describe('LinkVerificationController', () => {
  let controller: LinkVerificationController;
  let linksService: LinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkVerificationController],
      providers: [
        {
          provide: LinksService,
          useValue: {
            verifyLinkPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LinkVerificationController>(
      LinkVerificationController,
    );
    linksService = module.get<LinksService>(LinksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('verifyPassword', () => {
    it('should return success: true when password is valid', async () => {
      // Using arrow function to avoid unbound method lint error
      const mockVerify = jest.fn().mockResolvedValue(true);
      jest
        .spyOn(linksService, 'verifyLinkPassword')
        .mockImplementation(mockVerify);

      const result = await controller.verifyPassword('abc123', {
        password: 'valid-password',
      });

      expect(result).toEqual({ success: true });
      expect(mockVerify).toHaveBeenCalledWith('abc123', 'valid-password');
    });

    it('should return success: false when password is invalid', async () => {
      const mockVerify = jest.fn().mockResolvedValue(false);
      jest
        .spyOn(linksService, 'verifyLinkPassword')
        .mockImplementation(mockVerify);

      const result = await controller.verifyPassword('abc123', {
        password: 'invalid-password',
      });

      expect(result).toEqual({ success: false });
      expect(mockVerify).toHaveBeenCalledWith('abc123', 'invalid-password');
    });
  });
});
