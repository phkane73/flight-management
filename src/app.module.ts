import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookServiceModule } from './book-service/book-service.module';
import { AirportModule } from './modules/airport/airport.module';
import { FlightRouteModule } from './modules/flight-route/flight-route.module';
import { FlightModule } from './modules/flight/flight.module';
import { PlanePositionModule } from './modules/plane-position/plane-position.module';
import { PlaneModule } from './modules/plane/plane.module';
import { RunwayModule } from './modules/runway/runway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/.env`],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          database: configService.get<string>('DB_NAME'),
          password: configService.get<string>('DB_PASSWORD'),
          entities: ['dist/**/*.entity.js'],
          synchronize: true,
        };
      },
    }),
    AirportModule,
    PlaneModule,
    PlanePositionModule,
    FlightModule,
    FlightRouteModule,
    RunwayModule,
    BookServiceModule,
    // BookServiceGrpcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
