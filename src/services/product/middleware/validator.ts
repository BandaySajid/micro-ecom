import { body, validationResult } from 'express-validator';
import express from 'express';

const product_validation_schema = [
    body('product_name').exists().withMessage('product_name is required'),
    body('product_description').exists().withMessage('product_description is required'),
    body('category').exists().withMessage('category is required'),
    body('quantity').exists().withMessage('quatity is required').isNumeric().withMessage('quantity should be an number')
];

const validate_product = async (req: express.Request, res: express.Response, next: any) => {
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

export default { validate_product, product_validation_schema };