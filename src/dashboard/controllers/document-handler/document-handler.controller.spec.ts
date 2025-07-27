import { Test, TestingModule } from '@nestjs/testing';
import { DocumentHandlerController } from './document-handler.controller';
import { DocumentHandlerService } from '../../services/document-handler.service';
import { UserAuthGuard } from '../../../auth/guards/user-auth/user-auth.guard';
import { DocumentDto } from '../../dtos/document.dto';
import { UserModel } from '../../../database/models/user.model';
import { NestjsFormDataModule } from 'nestjs-form-data';

describe('DocumentHandlerController', () => {
  let controller: DocumentHandlerController;
  let documentHandlerService: DocumentHandlerService;

  const mockDocumentHandlerService = {
    handleFileAndSigners: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NestjsFormDataModule],
      controllers: [DocumentHandlerController],
      providers: [
        {
          provide: DocumentHandlerService,
          useValue: mockDocumentHandlerService,
        },
      ],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DocumentHandlerController>(
      DocumentHandlerController,
    );
    documentHandlerService = module.get<DocumentHandlerService>(
      DocumentHandlerService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitDocument', () => {
    it('should handle file and signers and redirect to success page', async () => {
      const body: DocumentDto = {
        document: {} as any,
        signers: [],
      };
      const user = { id: 1 } as UserModel;
      const res = {
        redirect: jest.fn(),
      } as any;

      mockDocumentHandlerService.handleFileAndSigners.mockResolvedValue(null);

      await controller.submitDocument(body, user, res);

      expect(documentHandlerService.handleFileAndSigners).toHaveBeenCalledWith(
        body.document,
        body.signers,
        user,
      );
      expect(res.redirect).toHaveBeenCalledWith('/documents/success');
    });
  });

  describe('getSuccessPage', () => {
    it('should render the success page', () => {
      expect(controller.getSuccessPage()).toEqual({});
    });
  });
});
