import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from '../../database/models/user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserModel) public userModel: typeof UserModel) {}

  public create(email: string, password: string): Promise<UserModel> {
    return this.userModel.build().set({ email, password }).save();
  }
}
