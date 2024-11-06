import { Body, Controller, Get, Inject, OnModuleInit, Query } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, Observable, tap } from 'rxjs';
import { BookServiceService } from './book-service.service';

type BookRequest = {
  book_id: number;
};

type BookResponse = {
  book_id: number;
  name: string;
};

interface BookService {
  getBook(request: BookRequest): Observable<BookResponse>;
  getBook2(request: BookRequest): Observable<BookResponse>;
}

@Controller('book-service')
export class BookServiceController implements OnModuleInit {
  private bookService: BookService;
  constructor(
    private readonly bookServiceService: BookServiceService,
    @Inject('module-book') private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.bookService = this.client.getService<BookService>('BookService');
  }

  @Get()
  callService(@Query('book_id') book_id: string) : Observable<BookResponse>{
    return this.bookService.getBook({ book_id: 1 })
  }
}
