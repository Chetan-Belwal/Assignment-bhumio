import { Injectable } from '@nestjs/common';
import { DocumentModel } from '../../database/models/document.model';
import { Transaction } from 'sequelize';
import { UserModel } from '../../database/models/user.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class DocumentRepoService {
  constructor(
    @InjectModel(DocumentModel)
    private readonly documentModel: typeof DocumentModel,
  ) {}

  /**
   * Store document info
   * @param path
   * @param user
   * @param original_name
   * @param transaction
   * @returns
   */
  public store(
    path: string,
    user: UserModel | number,
    original_name: string,
    transaction?: Transaction,
  ): Promise<DocumentModel> {
    return this.documentModel
      .build()
      .set({
        original_name,
        path,
        user_id: typeof user === 'number' ? user : user.id,
      })
      .save({ transaction });
  }
}
