import { body, validationResult } from 'express-validator';
import express from 'express';

const user_validation_schema = [
    body('email').isEmail().withMessage('invalid email was provided!'),
    body('username').isLength({ min: 7, max : 50 }).withMessage('minimum 7 characters and maximum 50 characters are allowed for username!'),
    body('password').isLength({ min: 7, max : 50 }).withMessage('minimum 7 characters and maximum 50 characters are allowed for password!')
];

const validate_user = async (req: express.Request, res: express.Response, next: any) => {
    try {
        const result = validationResult(req);
        if (result.isEmpty()) {
            return next();
        }
        return res.status(400).json({
            status: 'error',
            errors: result.array()
        });
    } catch (error) {
        console.error('[ERROR]: An error occured while validating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'internal server error'
        });
    };
};

export default { validate_user, user_validation_schema };