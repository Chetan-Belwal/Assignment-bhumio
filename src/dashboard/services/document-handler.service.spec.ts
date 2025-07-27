import { Test, TestingModule } from '@nestjs/testing';
import { DocumentHandlerService } from './document-handler.service';
import { DocumentRepoService } from './document-repo.service';
import { SignerRepoService } from './signer-repo.service';
import { getQueueToken } from '@nestjs/bull';
import { QueueNameEnum } from '../../queue/enums/queue-name.enum';
import { Queue } from 'bull';
import { FileSystemStoredFile } from 'nestjs-form-data';
import { SignerModel, SignerRole } from '../../database/models/signer.model';
import { UserModel } from '../../database/models/user.model';
import { QueueEvents } from '../../queue/enums/queue-events';

describe('DocumentHandlerService', () => {
  let service: DocumentHandlerService;
  let documentRepo: DocumentRepoService;
  let signerRepo: SignerRepoService;
  let queue: Queue;

  const mockDocumentRepoService = {
    store: jest.fn(),
  };

  const mockSignerRepoService = {
    store: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentHandlerService,
        {
          provide: DocumentRepoService,
          useValue: mockDocumentRepoService,
        },
        {
          provide: SignerRepoService,
          useValue: mockSignerRepoService,
        },
        {
          provide: getQueueToken(QueueNameEnum.GeneralQueue),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<DocumentHandlerService>(DocumentHandlerService);
    documentRepo = module.get<DocumentRepoService>(DocumentRepoService);
    signerRepo = module.get<SignerRepoService>(SignerRepoService);
    queue = module.get<Queue>(getQueueToken(QueueNameEnum.GeneralQueue));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleFileAndSigners', () => {
    it('should store the document and signers, and add a job to the queue', async () => {
      const file: FileSystemStoredFile = {
        path: 'test/path',
        originalName: 'test.pdf',
      } as any;
      const signers: Pick<
        SignerModel,
        'name' | 'email' | 'role' | 'sequence_number' | 'field'
      >[] = [
        {
          name: 'Signer 1',
          email: 'signer1@example.com',
          role: SignerRole.SIGNER,
          sequence_number: 1,
          field: null,
        },
      ];
      const user = { id: 1 } as UserModel;
      const document = { id: 1 } as any;

      mockDocumentRepoService.store.mockResolvedValue(document);

      await service.handleFileAndSigners(file, signers, user);

      expect(documentRepo.store).toHaveBeenCalledWith(
        file.path,
        user,
        file.originalName,
        undefined,
      );
      expect(signerRepo.store).toHaveBeenCalled();
      expect(queue.add).toHaveBeenCalledWith(QueueEvents.INITIAL_DOC_PROCESS, {
        user_id: user.id,
        document_id: document.id,
      });
    });
  });
});
