import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Analytics } from './analytics.entity';

@Entity('links')
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalUrl: string;

  shortUrl?: string; // Virtual property, not stored in database

  @Column({ unique: true })
  shortCode: string;

  @Column({ default: 0 })
  clicks: number;

  @ManyToOne(() => User, (user) => user.links, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @OneToMany(() => Analytics, (analytics) => analytics.link)
  analytics: Analytics[];

  @Column({ nullable: true })
  customSlug: string;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date;

  @Column({ nullable: true })
  maxClicks: number;

  @Column({ nullable: true })
  password: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  qrCodePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
