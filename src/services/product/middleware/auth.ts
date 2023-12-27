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
        req.body.user.role = decoded.role;

        next();

    } catch (error) {
        next(error);
    };
};

const verify_admin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        if (req.body.user.role === 'admin') {
            return next();
        };

        return res.status(400).json({
            status: 'error',
            error: 'you are not authroized to do this action!'
        });
    } catch (error) {
        next(error);
    };
};


export { auth, verify_admin };