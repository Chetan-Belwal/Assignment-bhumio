import { Module } from '@nestjs/common';
import { DocumentHandlerController } from './controllers/document-handler/document-handler.controller';
import { DashboardController } from './controllers/dashboard/dashboard.controller';

@Module({
  imports: [],
  controllers: [DashboardController, DocumentHandlerController],
  providers: [],
})
export class DashboardModule {}
