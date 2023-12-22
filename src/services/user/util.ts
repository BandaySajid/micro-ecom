import crypto from 'node:crypto';

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

export default { hash_it, compare_hash };