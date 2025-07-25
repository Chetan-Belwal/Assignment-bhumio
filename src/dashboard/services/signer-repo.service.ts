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
    signerInfo: Pick<SignerModel, 'name' | 'email' | 'role'>,
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
}
