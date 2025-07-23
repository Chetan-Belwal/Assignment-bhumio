import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import { Session } from 'express-session';

export const VALIDATION_ERROR = 'ValidationError';

@Catch(UnprocessableEntityException)
export class ValidationErrorFilter implements ExceptionFilter {
  catch(exception: UnprocessableEntityException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const session: Session & { [key: string]: any } = request.session;

    const errorResponse = exception.getResponse();

    const errors = this.formattedErrors(
      errorResponse['message'] as ValidationError[],
    );

    request.flash(VALIDATION_ERROR);
    request.flash(VALIDATION_ERROR, JSON.stringify(errors));

    request.session.save(() => {
      response.redirect((session._previousUrl as string) || '/');
    });
  }

  /**
   * Returns errors formatted to specification
   * @param errors
   * @param propertyPrefix
   */
  public formattedErrors(errors: ValidationError[], propertyPrefix = '') {
    let formattedErrors = {};

    for (const error of errors) {
      formattedErrors[`${propertyPrefix}${error.property}`] = [];
      for (const constraintKey of Object.keys(error.constraints || [])) {
        formattedErrors[`${propertyPrefix}${error.property}`].push(
          error.constraints[constraintKey],
        );
      }

      if (error?.children?.length > 0) {
        formattedErrors = {
          ...this.formattedErrors(
            error.children,
            `${propertyPrefix}${error.property}.`,
          ),
          ...formattedErrors,
        };
      }
    }

    const finalFormattedErrors: { [key: string]: string[] } = {} as Record<
      string,
      string[]
    >;
    for (const errorKey of Object.keys(formattedErrors)) {
      if (
        // eslint-disable-next-line no-prototype-builtins
        formattedErrors.hasOwnProperty(errorKey) &&
        formattedErrors[errorKey].length > 0
      ) {
        finalFormattedErrors[errorKey] = formattedErrors[errorKey] as string[];
      }
    }
    return finalFormattedErrors;
  }
}
