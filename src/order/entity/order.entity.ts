import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    reference: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    email: string;

    @Column({ default: 'pending' })
    status: string; // pending, paid, failed

    @Column({ nullable: true })
    productId: number;

    // Link to User - orders are now tied to logged-in users
    @Column({ nullable: true })
    userId: number;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
// andrej karpathy