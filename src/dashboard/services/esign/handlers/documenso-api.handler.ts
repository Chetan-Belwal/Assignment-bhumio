import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumensoConfig } from '../../../../environment/interfaces/documenso';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { QueueNameEnum } from '../../../../queue/enums/queue-name.enum';
import { QueueEvents } from '../../../../queue/enums/queue-events';
import { DoneCallback, Job, Queue } from 'bull';
import { InitialDocProcessJobData } from '../../document-handler.service';
import { DocumentRepoService } from '../../document-repo.service';
import { SignerRepoService } from '../../signer-repo.service';
import { SignerModel } from '../../../../database/models/signer.model';
import { DocumentModel } from '../../../../database/models/document.model';
import { readFile, stat } from 'node:fs/promises';

export interface RecipientInfo {
  recipientId: number;
  name: string;
  email: string;
  token: string;
  role: string;
  signingOrder?: number;
  signingUrl: string;
}

export interface CreateDocumentResponse {
  uploadUrl: string;
  documentId: number; // Documenso Document Id
  recipients: RecipientInfo[];
  path: string;
  docId: number;
}

@Processor(QueueNameEnum.GeneralQueue)
@Injectable()
export class DocumensoApiHandler implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly documentRepo: DocumentRepoService,
    private readonly signerRepo: SignerRepoService,
    @InjectQueue(QueueNameEnum.GeneralQueue) private readonly queue: Queue,
  ) {}

  #apiToken: string;
  #baseUrl: string;
  onModuleInit() {
    const { url, apiKey } =
      this.configService.get<DocumensoConfig>('documenso');
    this.#apiToken = apiKey;
    this.#baseUrl = url;
  }

  @Process(QueueEvents.INITIAL_DOC_PROCESS)
  public async uploadDocument(
    jobData: Job<InitialDocProcessJobData>,
    cb: DoneCallback,
  ) {
    const { document_id } = jobData.data;

    const document: DocumentModel =
      await this.documentRepo.findById(document_id);
    const signers: SignerModel[] =
      await this.signerRepo.findAllSignerByDocumentId(document_id);

    const reqBody = {
      title: document.original_name,
      recipients: signers.map((signer) => {
        return {
          name: signer.name,
          email: signer.email,
          role: signer.role,
          signingOrder: signer.sequence_number,
        };
      }),
      meta: {
        subject: 'Sign the document',
        message: 'Please sign the document',
      },
    };

    const response: Response = await fetch(`${this.#baseUrl}/documents`, {
      headers: this.getHeaders('application/json'),
      method: 'POST',
      body: JSON.stringify(reqBody),
    });

    const resData: CreateDocumentResponse =
      (await response.json()) as CreateDocumentResponse;

    await this.documentRepo.updateDocumensoId(document.id, resData.documentId);

    for (const signer of signers) {
      const recipient = resData.recipients.find(
        (recipient) => recipient.email === signer.email,
      );

      await this.signerRepo.updateDocumensoRecipientId(
        signer.id,
        recipient.recipientId,
      );
    }

    cb(
      null,
      await this.queue.add(QueueEvents.HANDLE_FILE_UPLOAD, {
        ...resData,
        path: document.path,
        docId: document.id,
      }),
    );
  }

  @Process(QueueEvents.HANDLE_FILE_UPLOAD)
  public async handleFileUpload(
    jobData: Job<CreateDocumentResponse>,
    cb: DoneCallback,
  ) {
    const resData = jobData.data;

    const docFile = await readFile(resData.path);

    const stats = await stat(resData.path);

    await fetch(`${resData.uploadUrl}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': stats.size.toString(),
      },
      body: docFile,
    });

    cb(
      null,
      await this.queue.add(QueueEvents.HANDLE_SIGNER_FIELDS, {
        docId: resData.docId,
        documensoDocId: resData.documentId,
      }),
    );
  }

  @Process(QueueEvents.HANDLE_SIGNER_FIELDS)
  public async handleSignerFields(
    jobData: Job<{ docId: number; documensoDocId: number }>,
    cb: DoneCallback,
  ) {
    const { docId, documensoDocId } = jobData.data;

    const signers: SignerModel[] =
      await this.signerRepo.findAllSignerByDocumentId(docId);

    for (const signer of signers) {
      await fetch(`${this.#baseUrl}/documents/${documensoDocId}/fields`, {
        headers: this.getHeaders('application/json'),
        method: 'POST',
        body: JSON.stringify({
          recipientId: signer.documenso_recipient_id,
          ...signer.field,
        }),
      });
    }

    cb(
      null,
      await this.queue.add(QueueEvents.SENT_DOC_FOR_SIGNING, {
        documentId: documensoDocId,
      }),
    );
  }

  @Process(QueueEvents.SENT_DOC_FOR_SIGNING)
  public async sentDocForSigning(jobData: Job<{ documentId: number }>) {
    await fetch(`${this.#baseUrl}/documents/${jobData.data.documentId}/send`, {
      headers: this.getHeaders('application/json'),
      method: 'POST',
      body: JSON.stringify({
        sendEmail: true,
        sendCompletionEmails: true,
      }),
    });
  }

  private getHeaders(contentType: string) {
    return {
      Authorization: `Bearer ${this.#apiToken}`,
      'Content-Type': contentType,
    };
  }
}
