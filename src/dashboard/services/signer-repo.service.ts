import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { SignerModel } from '../../database/models/signer.model';
import { UserModel } from '../../database/models/user.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class SignerRepoService {
  constructor(
    @InjectModel(SignerModel) private readonly signerModel: typeof SignerModel,
  ) {}

  /**
   * Store signer info
   * @param signerInfo
   * @param user
   * @param document_id
   * @param transaction
   * @returns
   */
  public store(
    signerInfo: Pick<
      SignerModel,
      'name' | 'email' | 'role' | 'sequence_number' | 'field'
    >,
    user: UserModel | number,
    document_id: number,
    transaction?: Transaction,
  ): Promise<SignerModel> {
    return this.signerModel
      .build()
      .set({
        ...signerInfo,
        document_id,
        user_id: typeof user === 'number' ? user : user.id,
      })
      .save({ transaction });
  }
  /**
   * Find all signer by document id
   * @param document_id
   * @param transaction
   * @returns
   */
  public findAllSignerByDocumentId(
    document_id: number,
    transaction?: Transaction,
  ): Promise<SignerModel[]> {
    return this.signerModel.findAll({ where: { document_id }, transaction });
  }

  /**
   * Update documenso recipient id
   * @param signerId
   * @param recipientId
   * @returns
   */
  public updateDocumensoRecipientId(signerId: number, recipientId: number) {
    return this.signerModel.update(
      { documenso_recipient_id: recipientId },
      { where: { id: signerId } },
    );
  }
}
