import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/checkTransaction')
  async checkTransaction( @Body() transactionValue: any, @Req() req: any) {
    const transaction = await this.paymentService.checkTransaction(req.user.id, transactionValue.paymentId, transactionValue.amount, transactionValue.method);
    return {
      errors: {},
      data: transaction
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/getCurrentMoney')
  async getCurrentMoney( @Req() req: any) {
    const currentMoney = await this.paymentService.getCurrentMoney(req.user.id);
    return {
      errors: {},
      currentMoney
    };
  }

  // @Post('/create')
  // async createPayment() {

  // }

  @UseGuards(AuthGuard('jwt'))
  @Get('/getHistory')
  async getHistory( @Req() req: any) {
    const history = await this.paymentService.getHistory(req.user.id);
    return {
      errors: {},
      data: history
    };
  }
}
