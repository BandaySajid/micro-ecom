import crypto from 'node:crypto';

type User = {
    user_id: crypto.UUID,
    username: string,
    email: string,
    password: string,
};

type RedactedUser = {
    user_id: crypto.UUID,
    username: string
    email: string
};

type AuthTokenData = {
    user: RedactedUser
    role: string
    created_on: Date
};

export {User, RedactedUser, AuthTokenData};