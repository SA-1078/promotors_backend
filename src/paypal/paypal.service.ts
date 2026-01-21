import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PayPalService {
    private readonly logger = new Logger(PayPalService.name);
    private readonly baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
    private readonly clientId = process.env.PAYPAL_CLIENT_ID;
    private readonly clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    async getAccessToken(): Promise<string> {
        try {
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            const response = await axios.post(
                `${this.baseUrl}/v1/oauth2/token`,
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
            return response.data.access_token;
        } catch (error) {
            this.logger.error('Error getting PayPal access token', error.response?.data || error.message);
            throw new InternalServerErrorException('Could not authenticate with PayPal');
        }
    }

    async createOrder(amount: number, returnUrl: string, cancelUrl: string): Promise<{ orderId: string; approvalUrl: string }> {
        const accessToken = await this.getAccessToken();

        try {
            const response = await axios.post(
                `${this.baseUrl}/v2/checkout/orders`,
                {
                    intent: 'CAPTURE',
                    purchase_units: [
                        {
                            amount: {
                                currency_code: 'USD',
                                value: amount.toFixed(2),
                            },
                        },
                    ],
                    application_context: {
                        return_url: returnUrl,
                        cancel_url: cancelUrl,
                        user_action: 'PAY_NOW',
                    },
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const orderId = response.data.id;
            const approvalUrl = response.data.links.find((link: any) => link.rel === 'approve').href;

            return { orderId, approvalUrl };
        } catch (error) {
            this.logger.error('Error creating PayPal order', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to create PayPal order');
        }
    }

    async captureOrder(orderId: string): Promise<any> {
        const accessToken = await this.getAccessToken();

        try {
            const response = await axios.post(
                `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error) {
            this.logger.error('Error capturing PayPal order', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to capture PayPal order');
        }
    }
}
