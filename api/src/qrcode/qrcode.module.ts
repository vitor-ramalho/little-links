import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QrCodeController } from './controllers/qr-code.controller';
import { QrCodeService } from './services/qr-code.service';

@Module({
  imports: [ConfigModule],
  controllers: [QrCodeController],
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}
