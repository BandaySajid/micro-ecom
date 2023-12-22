import { body, validationResult } from 'express-validator';
import express from 'express';

const user_validation_schema = [
    body('email').isEmail(),
    body('username').isLength({ min: 7 }),
    body('password').isLength({ min: 7 })
        .withMessage('minimum 7 characters are required')
        .isLength({ max: 50 })
        .withMessage('Max 50 characters are allowed!'),
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
        console.log('[ERROR]: An error occured while validating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'internal server error'
        });
    };
};

export default { validate_user, user_validation_schema };