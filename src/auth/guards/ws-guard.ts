import { CanActivate, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    if (!context.args[0].handshake.headers.authorization) return false;
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(bearerToken) as any;

      return new Promise((resolve, reject) => {
        return this.userService.findOne(decoded.user.id).then((user) => {
          context.switchToWs().getData().user = user;
          if (user) {
            resolve(user);
          } else {
            reject(false);
          }
        });
      });
    } catch (ex) {
      return false;
    }
  }
}
