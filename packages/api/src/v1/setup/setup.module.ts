import { Module } from '@nestjs/common';
import { CloudModule } from '../cloud/cloud.module';
import { SetupController } from './setup.controller';
import { SetupWizardService } from './setup-wizard.service';
import { AutoKeyInstallerService } from './autokey-installer.service';
import { OsDetectorService } from './os-detector.service';

@Module({
  imports: [CloudModule],
  controllers: [SetupController],
  providers: [SetupWizardService, AutoKeyInstallerService, OsDetectorService],
  exports: [SetupWizardService, AutoKeyInstallerService, OsDetectorService],
})
export class SetupModule {}
