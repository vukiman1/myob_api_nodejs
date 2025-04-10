import { Injectable, UseGuards } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentHistory, TransactionType } from './entities/payment.entity';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PaymentService {
    constructor(
        private userService: UserService,
        @InjectRepository(PaymentHistory)
        private paymentHistoryRepository: Repository<PaymentHistory>,
        private configService: ConfigService,
    ) {}

    private extractPaymentId(transactionContent: string): string {
        // Lấy phần đầu của chuỗi cho đến khi gặp " GD "
        const parts = transactionContent.split(' GD ');
        if (parts.length > 0) {
            return parts[0].trim(); // Thêm trim() để loại bỏ khoảng trắng thừa
        }
        return '';
    }

    async checkTransaction(userId: string, paymentId: string, amount: number, method: string): Promise<boolean> {
        try {
            // Kiểm tra xem giao dịch đã tồn tại trong database chưa
            const existingPayment = await this.paymentHistoryRepository.findOne({
                where: { paymentId }
            });

            if (existingPayment) {
                return false; // Giao dịch đã được xác nhận trước đó
            }

            const token = this.configService.get<string>('SEPAY_API_TOKEN');
                const response = await axios.get(
                    `https://my.sepay.vn/userapi/transactions/list?limit=10&amount_in=${amount}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                const data = response.data;
                if (data.status === 200 && data.transactions && data.transactions.length > 0) {
                    // Tìm giao dịch phù hợp bằng cách so sánh paymentId với ID được trích xuất từ transaction_content
                    const transaction = data.transactions.find(t => {
                        const extractedId = this.extractPaymentId(t.transaction_content);
                        return extractedId === paymentId;
                    });

                    if (transaction) {
                    // Lưu vào database
                            const paymentHistory = new PaymentHistory();
                            paymentHistory.price = amount * 100
                            paymentHistory.method = method;
                            paymentHistory.status = 1;
                            paymentHistory.paymentId = paymentId; // Lưu ID gửi từ frontend
                            paymentHistory.user = { id: userId } as any;
                            await this.userService.updateUserMoney(userId, amount * 100, "DEPOSIT");
                            await this.paymentHistoryRepository.save(paymentHistory);
                            return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error checking transaction:', error);
            return false;
        }
    }

    async createTransaction(price: number, method: string,userId: string, type: string) {
        const paymentHistory = new PaymentHistory();
        paymentHistory.price = price
        paymentHistory.transactionType = TransactionType.PURCHASE;
        paymentHistory.status = 1;
        paymentHistory.user = { id: userId } as any;
        await this.paymentHistoryRepository.save(paymentHistory);
        await this.userService.updateUserMoney(userId, price, type)
    }

    @UseGuards(AuthGuard('jwt'))
    async getCurrentMoney(id: string) {
        return this.userService.getUserMoney(id);
    }

    async getHistory(id: string) {
        return this.paymentHistoryRepository.find({
            where: { user: { id } },
            order: { createAt: 'DESC' },
        });
    }
}
