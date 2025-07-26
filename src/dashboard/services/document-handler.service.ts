import { Injectable } from '@nestjs/common';
import { DocumentRepoService } from './document-repo.service';
import { SignerRepoService } from './signer-repo.service';
import { FileSystemStoredFile } from 'nestjs-form-data';
import { Transaction } from 'sequelize';
import { SignerModel, SignerRole } from '../../database/models/signer.model';
import { UserModel } from '../../database/models/user.model';
import { InjectQueue } from '@nestjs/bull';
import { QueueNameEnum } from '../../queue/enums/queue-name.enum';
import { Queue } from 'bull';
import { QueueEvents } from '../../queue/enums/queue-events';

export interface InitialDocProcessJobData {
  user_id: number;
  document_id: number;
}

@Injectable()
export class DocumentHandlerService {
  constructor(
    private readonly documentRepo: DocumentRepoService,
    private readonly signerRepo: SignerRepoService,
    @InjectQueue(QueueNameEnum.GeneralQueue) private readonly queue: Queue,
  ) {}

  /**
   * Handle file and signers
   * @param file
   * @param signers
   * @param user
   * @param transaction
   */
  async handleFileAndSigners(
    file: FileSystemStoredFile,
    signers: Pick<
      SignerModel,
      'name' | 'email' | 'role' | 'sequence_number' | 'field'
    >[],
    user: UserModel | number,
    transaction?: Transaction,
  ) {
    const document = await this.documentRepo.store(
      file.path,
      user,
      file.originalName,
      transaction,
    );
    await Promise.all(
      signers.map(async (signer) => {
        if (
          !signer.field &&
          (signer.role === SignerRole.SIGNER ||
            signer.role === SignerRole.APPROVER)
        ) {
          signer.field = {
            pageX: this.getRandomX(),
            pageY: this.getRandomY(),
            pageWidth: this.getRandomWidth(),
            pageHeight: this.getRandomHeight(),
            pageNumber: this.getRandomPage(),
            type: 'SIGNATURE',
          };
        }

        await this.signerRepo.store(signer, user, document.id, transaction);
      }),
    );

    await this.queue.add(QueueEvents.INITIAL_DOC_PROCESS, {
      user_id: typeof user === 'number' ? user : user.id,
      document_id: document.id,
    } as InitialDocProcessJobData);
  }

  /**
   * Utility methods starts from here
   */
  private getRandomPage(): number {
    return Math.floor(Math.random() * 2) + 1; // Page 1 or 2
  }

  private getRandomX(): number {
    return Math.floor(Math.random() * 60) + 10; // 10-70%
  }

  private getRandomY(offset: number = 0): number {
    return Math.floor(Math.random() * 60) + 10 + offset; // 10-70% + offset
  }

  private getRandomWidth(min: number = 15, max: number = 35): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  private getRandomHeight(min: number = 4, max: number = 8): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
