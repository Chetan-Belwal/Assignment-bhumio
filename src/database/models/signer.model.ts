import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { DocumentModel } from './document.model';
import { UserModel } from './user.model';

export enum SignerRole {
  SIGNER = 'SIGNER',
  APPROVER = 'APPROVER',
  VIEWER = 'VIEWER',
}

export enum SignerStatus {
  IN_PROGRESS = 'In-Progress',
  COMPLETED = 'Completed',
}

@Table({ tableName: 'signers' })
export class SignerModel extends BaseModel<SignerModel> {
  @Column
  public name: string;

  @Column
  public email: string;

  @Column
  public role: SignerRole;

  @ForeignKey(() => DocumentModel)
  @Column
  public document_id: number;

  @Default(SignerStatus.IN_PROGRESS)
  @Column
  public status: SignerStatus;

  @ForeignKey(() => UserModel)
  @Column
  public user_id: number;

  @Column(DataType.JSON)
  public fields: string;

  @Column
  public signing_url: string;

  @BelongsTo(() => DocumentModel)
  public document: DocumentModel;

  @BelongsTo(() => UserModel)
  public user: UserModel;
}
