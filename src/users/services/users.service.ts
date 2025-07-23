import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from '../../database/models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
  ) {}

  /**
   * Creates a new user.
   * @param email
   * @param password
   * @returns
   */

  public create(userInfo: Partial<UserModel>): Promise<UserModel> {
    return this.userModel
      .build()
      .set({ ...userInfo })
      .save();
  }

  /**
   * Finds a user by email.
   * @param email
   * @returns
   */
  public async findByEmail(email: string): Promise<UserModel | null> {
    return this.userModel.findOne({
      where: { email },
    });
  }

  /**
   * Finds a user by ID.
   * @param id
   * @returns
   */
  public async findById(id: number): Promise<UserModel | null> {
    return this.userModel.findByPk(id);
  }
}
