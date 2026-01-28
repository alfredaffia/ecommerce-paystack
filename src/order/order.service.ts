import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepository:Repository<Order>,
    ){}
    async createFromWebhook(reference:string,amount:number,email:string,status:string,productId?:number){
        const order=  this.orderRepository.create({
            reference,
            amount,
            email,
            status:'paid',
            productId,
        })
        return await this.orderRepository.save(order);
    }
}
