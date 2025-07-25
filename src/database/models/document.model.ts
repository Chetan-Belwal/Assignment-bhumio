import {
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { UserModel } from './user.model';

export enum WorkflowStatus {
  IN_PROGRESS = 'In-Progress',
  COMPLETED = 'Completed',
}

@Table({ tableName: 'documents' })
export class DocumentModel extends BaseModel<DocumentModel> {
  @Column
  public path: string;

  @Column
  public original_name: string;

  @Column
  public documenso_id: number;

  @Default(WorkflowStatus.IN_PROGRESS)
  @Column
  public workflow_status: string;

  @ForeignKey(() => UserModel)
  @Column
  public user_id: number;

  @BelongsTo(() => UserModel)
  public user: UserModel;
}
