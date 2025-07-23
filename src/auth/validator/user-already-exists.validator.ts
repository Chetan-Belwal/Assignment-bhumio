import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersService } from '../../users/services/users.service';

@ValidatorConstraint({ name: 'userAlreadyExists', async: true })
export class UserAlreadyExistsValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly userService: UsersService) {}
  async validate(email: string) {
    const user = await this.userService.findByEmail(email);
    return !user;
  }

  defaultMessage() {
    return 'User with this email already exists.';
  }
}

export function UserAlreadyExists(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'userAlreadyExists',
      target: object.constructor,
      propertyName: propertyName,
      options: options,
      constraints: [],
      validator: UserAlreadyExistsValidator,
    });
  };
}
