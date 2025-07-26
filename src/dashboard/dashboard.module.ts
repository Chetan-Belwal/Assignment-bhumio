import { Module } from '@nestjs/common';
import { DocumentHandlerController } from './controllers/document-handler/document-handler.controller';
import { DashboardController } from './controllers/dashboard/dashboard.controller';
import { DocumentRepoService } from './services/document-repo.service';
import { SignerRepoService } from './services/signer-repo.service';
import { DocumentHandlerService } from './services/document-handler.service';
import { DocumensoApiHandler } from './services/esign/handlers/documenso-api.handler';

@Module({
  imports: [],
  controllers: [DashboardController, DocumentHandlerController],
  providers: [
    DocumentHandlerService,
    DocumentRepoService,
    SignerRepoService,
    DocumensoApiHandler,
  ],
})
export class DashboardModule {}
