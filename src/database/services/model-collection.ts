import { BaseModel } from '../models/base.model';
import { DocumentModel } from '../models/document.model';
import { SignerModel } from '../models/signer.model';
import { UserModel } from '../models/user.model';

export const modelCollection = [
  BaseModel,
  UserModel,
  DocumentModel,
  SignerModel,
];
