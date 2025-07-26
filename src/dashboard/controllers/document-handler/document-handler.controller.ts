import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FormDataRequest } from 'nestjs-form-data';
import { DocumentDto } from '../../dtos/document.dto';
import { DocumentHandlerService } from '../../services/document-handler.service';
import { UserAuthGuard } from '../../../auth/guards/user-auth/user-auth.guard';
import { User } from '../../../auth/decorators/auth-user.decorator';
import { UserModel } from '../../../database/models/user.model';
import { Response } from 'express';

@Controller('documents')
export class DocumentHandlerController {
  constructor(
    private readonly documentHandlerService: DocumentHandlerService,
  ) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: DocumentDto,
    schema: {
      properties: {
        document: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(UserAuthGuard)
  @FormDataRequest()
  @Post('submit')
  public submitDocument(
    @Body() body: DocumentDto,
    @User() user: UserModel,
    @Res() res: Response,
  ) {
    return this.documentHandlerService
      .handleFileAndSigners(body.document, body.signers, user)
      .then(() => res.redirect('/documents/success'));
  }

  @Render('successPage')
  @Get('success')
  public getSuccessPage() {
    return {};
  }
}
