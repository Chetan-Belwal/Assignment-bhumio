import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'Match', async: true })
export class MatchValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const relatedPropertyName: string = args.constraints[0] as string;

    const relatedValue = args.object[relatedPropertyName] as string;
    return value === relatedValue;
  }

  defaultMessage(): string {
    return 'Passwords does not match';
  }
}

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      validator: MatchValidator,
      options: validationOptions,
    });
  };
}
