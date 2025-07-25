import { BelongsTo, Column } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { UserModel } from './user.model';

export class DocumentModel extends BaseModel<DocumentModel> {
  @Column
  public path: string;

  @Column
  public original_name: string;

  @Column
  public documenso_id: number;

  @Column
  public workflow_status: string;

  @Column
  public user_id: number;

  @BelongsTo(() => UserModel)
  public user: UserModel;
}
