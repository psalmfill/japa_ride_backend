// 2019 Revant Nandgaonkar
// License: MIT

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as rawBody from 'raw-body';

@Injectable()
export class PaystackWebHookGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (req.readable) {
      const X_PAYSTACK_SIGNATURE = 'x-paystack-signature';
      const chunk = (await rawBody(req)).toString().trim();
      const headerSignature = req.headers[X_PAYSTACK_SIGNATURE];
      const signature = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(chunk)
        .digest('hex');
      return headerSignature === signature;
    }
    return false;
  }
}
