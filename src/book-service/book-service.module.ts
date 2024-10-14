import { Module } from '@nestjs/common';
import { BookServiceGrpcModule } from 'src/book-service-grpc/book-service-grpc.module';
import { BookServiceController } from './book-service.controller';
import { BookServiceService } from './book-service.service';

@Module({
  imports: [BookServiceGrpcModule],
  controllers: [BookServiceController],
  providers: [BookServiceService],
})
export class BookServiceModule {}
