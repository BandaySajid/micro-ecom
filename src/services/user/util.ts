import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { AuthTokenData } from './types';
import config from '../../config.js';

const hash_it = (plaintext: string): string => {
    const hash = crypto
        .createHash('sha256')
        .update(plaintext)
        .digest('hex')

    return hash;
};

const compare_hash = (hash: string, plaintext: string) => {
    return hash_it(plaintext) === hash;
};

const generate_auth_token = (auth_token_data: AuthTokenData) => {
    const token = jwt.sign(auth_token_data, config.jwt.secret, {algorithm : 'HS256'});
    return token;
};

export default { hash_it, compare_hash, generate_auth_token };