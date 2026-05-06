import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';

@Entity({
  name: 'card',
})
export class CardEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  editorStage: Record<string, any> | null;

  @ManyToOne(() => FileEntity, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'previewImageId' })
  previewImage?: FileEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
