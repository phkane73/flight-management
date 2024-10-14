import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'module-book',
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50052',
          package: 'com.javainuse.employee.grpc',
          protoPath: join(process.cwd(), './src/book-service/book-service.proto'),
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class BookServiceGrpcModule {}
