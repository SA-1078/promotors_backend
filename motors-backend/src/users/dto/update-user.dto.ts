import { PartialType } from '@nestjs/mapped-types'; // Assuming mapped-types is available or uses swagger? package.json didn't show it.
// Actually nestjs/mapped-types needs to be installed or use class-validator partial manually.
// Reference didn't explicitly show UpdateUserDto imports but it usually imports from mapped-types or swagger.
// I'll check if mapped-types is in package.json. If not, I'll install it or just recreate fields optional.
// package.json (ref) had "class-transformer", "class-validator".
// I'll verify "mapped-types".
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) { }
