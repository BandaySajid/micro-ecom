import jwt from 'jsonwebtoken';
import express from 'express';
import config from '../../../config.js';

const auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const auth_token = req.headers.authorization?.split('Bearer ')[1];

        if (!auth_token) {
            return res.status(401).json({
                status: 'error',
                error: 'authorization header not present!'
            });
        };

        const decoded = jwt.verify(auth_token, config.jwt.secret) as any;

        req.body.user = decoded.user;

        return next();

    } catch (error) {
        return res.status(401).json({
            status: 'error',
            error: 'unauthenticated user!'
        });
    };
};

export { auth };