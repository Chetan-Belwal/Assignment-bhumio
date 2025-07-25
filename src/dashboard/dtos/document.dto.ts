import {
  MaxFileSize,
  IsFile,
  HasExtension,
  FileSystemStoredFile,
} from 'nestjs-form-data';
import { SignerDto } from './signer.dto';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DocumentDto {
  @ApiProperty()
  @MaxFileSize(5e6, {
    message: 'File size must be less than 5MB',
  })
  @IsFile()
  @HasExtension(['pdf'])
  public document: FileSystemStoredFile;

  @ApiProperty({ type: SignerDto, isArray: true })
  @IsArray()
  @Type(() => SignerDto)
  signers: SignerDto[];
}
