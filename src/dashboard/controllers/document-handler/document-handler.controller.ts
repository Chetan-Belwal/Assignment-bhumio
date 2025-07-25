import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FormDataRequest } from 'nestjs-form-data';
import { DocumentDto } from '../../dtos/document.dto';

@Controller('documents')
export class DocumentHandlerController {
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
  @FormDataRequest()
  @Post('submit')
  public submitDocument(@Body() body: DocumentDto) {
    console.log('Document submission received:', body);
    // Logic to handle document submission
    return { message: 'Document submitted successfully' };
  }
}
