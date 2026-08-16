import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * DTO for user signup
 */
export class SignupDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one digit' })
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: 'Password must contain at least one special character',
  })
  password!: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

/**
 * DTO for user login
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  password!: string;
}

/**
 * DTO for token refresh
 */
export class RefreshTokenDto {
  @IsString({ message: 'Refresh token must be a string' })
  refreshToken!: string;
}

/**
 * DTO for email verification
 */
export class VerifyEmailDto {
  @IsString({ message: 'Token must be a string' })
  token!: string;
}

/**
 * DTO for password reset request
 */
export class PasswordResetRequestDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;
}

/**
 * DTO for password reset confirmation
 */
export class PasswordResetConfirmDto {
  @IsString({ message: 'Token must be a string' })
  token!: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one digit' })
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: 'Password must contain at least one special character',
  })
  newPassword!: string;
}

/**
 * DTO for password change (authenticated)
 */
export class ChangePasswordDto {
  @IsString({ message: 'Old password must be a string' })
  oldPassword!: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one digit' })
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: 'Password must contain at least one special character',
  })
  newPassword!: string;
}

/**
 * DTO for legacy CreateUserDto (kept for backwards compatibility)
 */
export class CreateUserDto extends SignupDto {}
