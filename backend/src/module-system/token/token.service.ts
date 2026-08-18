import { BadRequestException, Injectable } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY, JWT_REFRESH_SECRET } from "../../common/constants/app.constant";

@Injectable()
export class TokenService {
    verifyAccessToken(token, option?: jwt.VerifyOptions) {
        const decode = jwt.verify(token, JWT_SECRET_KEY, option);
        return decode;
     }
    verifyRefreshToken(token, option?: jwt.VerifyOptions) {
        const decode = jwt.verify(token, JWT_REFRESH_SECRET, option);
        return decode;
     }
    signAccessToken(id: BigInt) {
        if (!id) { 
            throw new BadRequestException('id not found');
        }
        const payload = { id: id.toString() };
        const token = jwt.sign(payload, JWT_SECRET_KEY as string, {
            expiresIn: '1h',
        })
        return token;
     }
    signRefreshToken(id: BigInt) {
        if (!id) { 
            throw new BadRequestException('id not found');
        }
        const payload = { id: id.toString() };
        const token = jwt.sign(payload, JWT_REFRESH_SECRET as string, {
            expiresIn: '1d',
        })
        return token;
     }
 }