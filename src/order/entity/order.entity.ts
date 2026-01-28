import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    reference: string;

    @Column()
    amount: number;

    @Column()
    email: string;

    @Column({ default: 'pending' })
    status: string; //pending, paid, failed

    @Column({nullable:true})
    productId: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}