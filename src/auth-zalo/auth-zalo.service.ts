import {
  HttpStatus,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import ms from 'ms';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { UsersService } from '../users/users.service';
import { SessionService } from '../session/session.service';
import { AllConfigType } from '../config/config.type';
import { AuthZaloLoginDto } from './dto/login.dto';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { ZaloProfileInterface } from '../social/interfaces/zalo-profile.interface';
import { NullableType } from '../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { Session } from '../session/domain/session';

@Injectable()
export class AuthZaloService {
  private readonly zaloFields = 'id, name, picture';
  private readonly logger = new Logger(AuthZaloService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async validateZaloLogin(dto: AuthZaloLoginDto): Promise<LoginResponseDto> {
    const zaloProfile = await this.getZaloProfile(dto.accessToken);

    this.logger.debug(`Zalo profile fetched: ${JSON.stringify(zaloProfile)}`);

    if (zaloProfile.error !== 0) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          zaloAccessToken: `zaloApiError: ${zaloProfile.message}`,
        },
      });
    }

    const user = await this.findOrCreateUser(zaloProfile);

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({ user, hash });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      hash,
    });

    return { token, refreshToken, tokenExpires, user };
  }

  private async getZaloProfile(
    accessToken: string,
  ): Promise<ZaloProfileInterface> {
    const appSecret = this.configService.getOrThrow<string>('zalo.appSecret', {
      infer: true,
    });

    const appsecretProof = crypto
      .createHmac('sha256', appSecret)
      .update(accessToken)
      .digest('hex');

    const apiUrl = this.configService.getOrThrow<string>('zalo.apiUrl', {
      infer: true,
    });

    const url = new URL(apiUrl);
    url.searchParams.set('fields', this.zaloFields);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        access_token: accessToken,
        appsecret_proof: appsecretProof,
      },
    });

    if (!response.ok) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          zaloAccessToken: 'failedToFetchZaloProfile',
        },
      });
    }

    return response.json() as Promise<ZaloProfileInterface>;
  }

  private async findOrCreateUser(profile: ZaloProfileInterface): Promise<User> {
    let user: NullableType<User> = null;

    user = await this.usersService.findBySocialIdAndProvider({
      socialId: profile.id,
      provider: AuthProvidersEnum.zalo,
    });

    if (!user) {
      user = await this.usersService.create({
        firstName: profile.name ?? null,
        lastName: null,
        email: null,
        socialId: profile.id,
        provider: AuthProvidersEnum.zalo,
        role: { id: RoleEnum.user },
        status: { id: StatusEnum.active },
      });

      user = await this.usersService.findById(user.id);
    }

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user: 'userNotFound' },
      });
    }

    return user;
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: data.id, role: data.role, sessionId: data.sessionId },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        { sessionId: data.sessionId, hash: data.hash },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return { token, refreshToken, tokenExpires };
  }
}
