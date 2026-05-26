import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class InventoryReservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productVariantId: number;

  @Column()
  quantity: number;

  @Column()
  expiresAt: Date;

  @Column()
  status: 'active' | 'expired' | 'completed' | 'released';

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;


}