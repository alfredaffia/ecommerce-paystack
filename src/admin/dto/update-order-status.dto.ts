import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'paid',
    description: 'Order status',
    enum: ['pending', 'paid', 'failed', 'refunded'],
  })
  @IsString()
  @IsIn(['pending', 'paid', 'failed', 'refunded'], {
    message: 'Status must be one of: pending, paid, failed, refunded',
  })
  status: string;
}
