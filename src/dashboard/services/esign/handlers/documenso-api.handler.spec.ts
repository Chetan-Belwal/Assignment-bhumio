/* eslint-disable @typescript-eslint/no-require-imports */
import { Test, TestingModule } from '@nestjs/testing';
import { DocumensoApiHandler } from './documenso-api.handler';
import { ConfigService } from '@nestjs/config';
import { DocumentRepoService } from '../../document-repo.service';
import { SignerRepoService } from '../../signer-repo.service';
import { getQueueToken } from '@nestjs/bull';
import { QueueNameEnum } from '../../../../queue/enums/queue-name.enum';
import { Job, Queue } from 'bull';
import { InitialDocProcessJobData } from '../../document-handler.service';
import { DocumentModel } from '../../../../database/models/document.model';
import {
  SignerModel,
  SignerRole,
} from '../../../../database/models/signer.model';
import { QueueEvents } from '../../../../queue/enums/queue-events';

// Mock external modules
jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(() => Buffer.from('test file content')),
  stat: jest.fn(() => ({ size: 100 })),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('DocumensoApiHandler', () => {
  let handler: DocumensoApiHandler;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;
  let documentRepo: DocumentRepoService;
  let signerRepo: SignerRepoService;
  let queue: Queue;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockDocumentRepoService = {
    findById: jest.fn(),
    updateDocumensoId: jest.fn(),
  };

  const mockSignerRepoService = {
    findAllSignerByDocumentId: jest.fn(),
    updateDocumensoRecipientId: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumensoApiHandler,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
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

    handler = module.get<DocumensoApiHandler>(DocumensoApiHandler);
    configService = module.get<ConfigService>(ConfigService);
    documentRepo = module.get<DocumentRepoService>(DocumentRepoService);
    signerRepo = module.get<SignerRepoService>(SignerRepoService);
    queue = module.get<Queue>(getQueueToken(QueueNameEnum.GeneralQueue));
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should process initial document and add handle file upload job', async () => {
      const jobData: Job<InitialDocProcessJobData> = {
        data: { document_id: 1 },
      } as Job<InitialDocProcessJobData>;
      const cb = jest.fn();

      const document = {
        id: 1,
        original_name: 'test.pdf',
        path: './test.pdf',
      } as DocumentModel;
      const signers = [
        {
          id: 1,
          name: 'Signer 1',
          email: 'signer1@example.com',
          role: SignerRole.SIGNER,
          sequence_number: 1,
        } as SignerModel,
      ];

      mockDocumentRepoService.findById.mockResolvedValue(document);
      mockSignerRepoService.findAllSignerByDocumentId.mockResolvedValue(
        signers,
      );
      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            uploadUrl: 'http://upload.url',
            documentId: 123,
            recipients: [{ recipientId: 1, email: 'signer1@example.com' }],
          }),
      });
      mockQueue.add.mockResolvedValue(true);

      await handler.uploadDocument(jobData, cb);

      expect(documentRepo.findById).toHaveBeenCalledWith(
        jobData.data.document_id,
      );
      expect(signerRepo.findAllSignerByDocumentId).toHaveBeenCalledWith(
        jobData.data.document_id,
      );
      expect(mockFetch).toHaveBeenCalledWith(
        'undefined/documents',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            title: document.original_name,
            recipients: [
              {
                name: signers[0].name,
                email: signers[0].email,
                role: signers[0].role,
                signingOrder: signers[0].sequence_number,
              },
            ],
            meta: {
              subject: 'Sign the document',
              message: 'Please sign the document',
            },
          }),
        }),
      );
      expect(documentRepo.updateDocumensoId).toHaveBeenCalledWith(
        document.id,
        123,
      );
      expect(signerRepo.updateDocumensoRecipientId).toHaveBeenCalledWith(
        signers[0].id,
        1,
      );
      expect(queue.add).toHaveBeenCalledWith(QueueEvents.HANDLE_FILE_UPLOAD, {
        uploadUrl: 'http://upload.url',
        documentId: 123,
        recipients: [{ recipientId: 1, email: 'signer1@example.com' }],
        path: document.path,
        docId: document.id,
      });
      expect(cb).toHaveBeenCalledWith(null, true);
    });
  });

  describe('handleFileUpload', () => {
    it('should upload the document file and add handle signer fields job', async () => {
      const jobData: Job<any> = {
        data: {
          uploadUrl: 'http://upload.url',
          path: './test.pdf',
          docId: 1,
          documentId: 123,
        },
      } as Job<any>;
      const cb = jest.fn();

      mockFetch.mockResolvedValue(true);
      mockQueue.add.mockResolvedValue(true);

      await handler.handleFileUpload(jobData, cb);

      expect(require('node:fs/promises').readFile).toHaveBeenCalledWith(
        jobData.data.path,
      );
      expect(require('node:fs/promises').stat).toHaveBeenCalledWith(
        jobData.data.path,
      );
      expect(mockFetch).toHaveBeenCalledWith(
        jobData.data.uploadUrl,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Length': '100',
          },
          body: Buffer.from('test file content'),
        }),
      );
      expect(queue.add).toHaveBeenCalledWith(QueueEvents.HANDLE_SIGNER_FIELDS, {
        docId: jobData.data.docId,
        documensoDocId: jobData.data.documentId,
      });
      expect(cb).toHaveBeenCalledWith(null, true);
    });
  });

  describe('handleSignerFields', () => {
    it('should add signer fields and add sent doc for signing job', async () => {
      const jobData: Job<any> = {
        data: { docId: 1, documensoDocId: 123 },
      } as Job<any>;
      const cb = jest.fn();

      const signers = [
        {
          id: 1,
          documenso_recipient_id: 1,
          field: { type: 'SIGNATURE' },
        } as SignerModel,
      ];

      mockSignerRepoService.findAllSignerByDocumentId.mockResolvedValue(
        signers,
      );
      mockFetch.mockResolvedValue(true);
      mockQueue.add.mockResolvedValue(true);

      await handler.handleSignerFields(jobData, cb);

      expect(signerRepo.findAllSignerByDocumentId).toHaveBeenCalledWith(
        jobData.data.docId,
      );
      expect(mockFetch).toHaveBeenCalledWith(
        'undefined/documents/123/fields',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            recipientId: signers[0].documenso_recipient_id,
            ...signers[0].field,
          }),
        }),
      );
      expect(queue.add).toHaveBeenCalledWith(QueueEvents.SENT_DOC_FOR_SIGNING, {
        documentId: jobData.data.documensoDocId,
      });
      expect(cb).toHaveBeenCalledWith(null, true);
    });
  });

  describe('sentDocForSigning', () => {
    it('should send the document for signing', async () => {
      const jobData: Job<any> = {
        data: { documentId: 123 },
      } as Job<any>;

      mockFetch.mockResolvedValue(true);

      await handler.sentDocForSigning(jobData);

      expect(mockFetch).toHaveBeenCalledWith(
        'undefined/documents/123/send',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            sendEmail: true,
            sendCompletionEmails: true,
          }),
        }),
      );
    });
  });
});
