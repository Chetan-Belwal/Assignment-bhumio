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

export type FieldType =
  | 'SIGNATURE'
  | 'TEXT'
  | 'EMAIL'
  | 'NAME'
  | 'DATE'
  | 'CHECKBOX'
  | 'RADIO'
  | 'NUMBER'
  | 'SELECT'
  | 'INITIALS';

export interface CreateField {
  recipientId?: number;
  type: FieldType;
  pageNumber: number; // 1-based page number
  pageX: number; // X coordinate on the page
  pageY: number; // Y coordinate on the page
  pageWidth: number; // Width of the field
  pageHeight: number; // Height of the field
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
  public field: CreateField;

  @Column
  public signing_url: string;

  @Column
  public sequence_number: number;

  @Column
  public documenso_recipient_id: number;

  @BelongsTo(() => DocumentModel)
  public document: DocumentModel;

  @BelongsTo(() => UserModel)
  public user: UserModel;
}
