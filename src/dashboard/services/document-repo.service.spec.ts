import { Test, TestingModule } from '@nestjs/testing';
import { DocumentRepoService } from './document-repo.service';
import { getModelToken } from '@nestjs/sequelize';
import { DocumentModel } from '../../database/models/document.model';
import { UserModel } from '../../database/models/user.model';

describe('DocumentRepoService', () => {
  let service: DocumentRepoService;
  let documentModel: typeof DocumentModel;

  const mockDocumentModel = {
    build: jest.fn(() => ({
      set: jest.fn().mockReturnThis(),
      save: jest.fn(),
    })),
    findByPk: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentRepoService,
        {
          provide: getModelToken(DocumentModel),
          useValue: mockDocumentModel,
        },
      ],
    }).compile();

    service = module.get<DocumentRepoService>(DocumentRepoService);
    documentModel = module.get<typeof DocumentModel>(
      getModelToken(DocumentModel),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('store', () => {
    it('should store a new document', async () => {
      const path = 'test/path';
      const user = { id: 1 } as UserModel;
      const original_name = 'test.pdf';
      const transaction = {} as any;

      const mockDocumentInstance = {
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue({} as DocumentModel),
      };

      mockDocumentModel.build.mockReturnValue(mockDocumentInstance);

      await service.store(path, user, original_name, transaction);

      expect(documentModel.build).toHaveBeenCalled();
      expect(mockDocumentInstance.set).toHaveBeenCalledWith({
        original_name,
        path,
        user_id: user.id,
      });
      expect(mockDocumentInstance.save).toHaveBeenCalledWith({ transaction });
    });
  });

  describe('findById', () => {
    it('should find a document by id', async () => {
      const id = 1;
      const transaction = {} as any;

      mockDocumentModel.findByPk.mockResolvedValue({} as DocumentModel);

      await service.findById(id, transaction);

      expect(documentModel.findByPk).toHaveBeenCalledWith(id, { transaction });
    });
  });

  describe('updateDocumensoId', () => {
    it('should update the documenso_id of a document', async () => {
      const id = 1;
      const documensoId = 123;
      const transaction = {} as any;

      mockDocumentModel.update.mockResolvedValue([1]);

      await service.updateDocumensoId(id, documensoId, transaction);

      expect(documentModel.update).toHaveBeenCalledWith(
        { documenso_id: documensoId },
        { where: { id }, transaction },
      );
    });
  });
});
