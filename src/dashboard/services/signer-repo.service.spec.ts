import { Test, TestingModule } from '@nestjs/testing';
import { SignerRepoService } from './signer-repo.service';
import { getModelToken } from '@nestjs/sequelize';
import { SignerModel, SignerRole } from '../../database/models/signer.model';
import { UserModel } from '../../database/models/user.model';

describe('SignerRepoService', () => {
  let service: SignerRepoService;
  let signerModel: typeof SignerModel;

  const mockSignerModel = {
    build: jest.fn(() => ({
      set: jest.fn().mockReturnThis(),
      save: jest.fn().mockResolvedValue({} as SignerModel),
    })),
    findAll: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignerRepoService,
        {
          provide: getModelToken(SignerModel),
          useValue: mockSignerModel,
        },
      ],
    }).compile();

    service = module.get<SignerRepoService>(SignerRepoService);
    signerModel = module.get<typeof SignerModel>(getModelToken(SignerModel));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('store', () => {
    it('should store a new signer', async () => {
      const signerInfo: Pick<
        SignerModel,
        'name' | 'email' | 'role' | 'sequence_number' | 'field'
      > = {
        name: 'Test Signer',
        email: 'signer@example.com',
        role: SignerRole.SIGNER,
        sequence_number: 1,
        field: null,
      };
      const user = { id: 1 } as UserModel;
      const document_id = 1;
      const transaction = {} as any;

      const mockSignerInstance = {
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue({} as SignerModel),
      };

      mockSignerModel.build.mockReturnValue(mockSignerInstance);

      await service.store(signerInfo, user, document_id, transaction);

      expect(signerModel.build).toHaveBeenCalled();
      expect(mockSignerInstance.set).toHaveBeenCalledWith({
        ...signerInfo,
        document_id,
        user_id: user.id,
      });
      expect(mockSignerInstance.save).toHaveBeenCalledWith({ transaction });
    });
  });

  describe('findAllSignerByDocumentId', () => {
    it('should find all signers by document id', async () => {
      const document_id = 1;
      const transaction = {} as any;

      mockSignerModel.findAll.mockResolvedValue([]);

      await service.findAllSignerByDocumentId(document_id, transaction);

      expect(signerModel.findAll).toHaveBeenCalledWith({
        where: { document_id },
        transaction,
      });
    });
  });

  describe('updateDocumensoRecipientId', () => {
    it('should update the documenso_recipient_id of a signer', async () => {
      const signerId = 1;
      const recipientId = 123;

      mockSignerModel.update.mockResolvedValue([1]);

      await service.updateDocumensoRecipientId(signerId, recipientId);

      expect(signerModel.update).toHaveBeenCalledWith(
        { documenso_recipient_id: recipientId },
        { where: { id: signerId } },
      );
    });
  });
});
