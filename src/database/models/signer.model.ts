import { BelongsTo, Column, DataType } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { DocumentModel } from './document.model';
import { UserModel } from './user.model';

export enum SignerRole {
  SIGNER = 'SIGNER',
  APPROVER = 'APPROVER',
  VIEWER = 'VIEWER',
}

export class SignerModel extends BaseModel<SignerModel> {
  @Column
  public name: string;

  @Column
  public email: string;

  @Column
  public role: SignerRole;

  @Column
  public document_id: number;

  @Column
  public status: string;

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
