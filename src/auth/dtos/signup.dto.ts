import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Match } from '../validator/match.validator';
import { UserAlreadyExists } from '../validator/user-already-exists.validator';

export class SignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @UserAlreadyExists()
  public email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public password: string;

  @ApiProperty()
  @IsNotEmpty()
  @Match('password')
  @IsString()
  public confirmPassword: string;
}
