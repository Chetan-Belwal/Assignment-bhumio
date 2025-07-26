import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateField, SignerRole } from '../../database/models/signer.model';
import { Type } from 'class-transformer';

export class SignerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty()
  @IsString()
  @IsIn([SignerRole.SIGNER, SignerRole.APPROVER, SignerRole.VIEWER])
  @IsNotEmpty()
  public role: SignerRole;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  public sequence_number: number;

  @IsOptional()
  public field: CreateField;
}
