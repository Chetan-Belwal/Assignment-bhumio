import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { SignerRole } from '../../database/models/signer.model';

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
}
