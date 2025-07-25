import { Global, Module } from '@nestjs/common';
import { FileSystemStoredFile, NestjsFormDataModule } from 'nestjs-form-data';

@Global()
@Module({
  imports: [
    NestjsFormDataModule.configAsync({
      useFactory: () => ({
        storage: FileSystemStoredFile,
        cleanupAfterSuccessHandle: false,
        fileSystemStoragePath: `${process.cwd()}/storage/pdf`,
        cleanupAfterFailedHandle: true,
      }),
    }),
  ],
  exports: [NestjsFormDataModule],
})
export class FileManagementModule {}
