import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { Link } from './entities/link.entity';
import { Analytics } from './entities/analytics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Link, Analytics]), ConfigModule],
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}
