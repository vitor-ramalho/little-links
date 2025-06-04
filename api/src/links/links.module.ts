import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { LinkVerificationController } from './controllers/link-verification.controller';
import { Link } from './entities/link.entity';
import { Analytics } from './entities/analytics.entity';
import { QrCodeModule } from '../qrcode/qrcode.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Link, Analytics]),
    ConfigModule,
    QrCodeModule,
    AnalyticsModule,
    CommonModule,
  ],
  controllers: [LinksController, LinkVerificationController],
  providers: [LinksService],
})
export class LinksModule {}
