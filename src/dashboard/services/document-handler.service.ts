import { Injectable } from '@nestjs/common';
import { DocumentRepoService } from './document-repo.service';
import { SignerRepoService } from './signer-repo.service';
import { FileSystemStoredFile } from 'nestjs-form-data';
import { Transaction } from 'sequelize';
import { SignerModel } from '../../database/models/signer.model';
import { UserModel } from '../../database/models/user.model';

@Injectable()
export class DocumentHandlerService {
  constructor(
    private readonly documentRepo: DocumentRepoService,
    private readonly signerRepo: SignerRepoService,
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
    signers: Pick<SignerModel, 'name' | 'email' | 'role'>[],
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
      signers.map((signer) =>
        this.signerRepo.store(signer, user, document.id, transaction),
      ),
    );
  }
}
