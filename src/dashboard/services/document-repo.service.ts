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

  /**
   * Find document by id
   * @param id
   * @returns
   */
  public findById(
    id: number,
    transaction?: Transaction,
  ): Promise<DocumentModel | null> {
    return this.documentModel.findByPk(id, { transaction });
  }

  /**
   * update documenso id in document table
   * @param id
   * @param documensoId
   * @param transaction
   * @returns
   */
  public updateDocumensoId(
    id: number,
    documensoId: number,
    transaction?: Transaction,
  ): Promise<[affectedCount: number]> {
    return this.documentModel.update(
      { documenso_id: documensoId },
      { where: { id }, transaction },
    );
  }
}
