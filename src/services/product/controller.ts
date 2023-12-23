import express from 'express';
import db from './db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

type Product = {
    product_id: string | number // 'DEFAULT' when inserting and a number when SELECTING: for mysql
    product_name: string
    product_description: string
    price: number
    category: string
    size: string | undefined
    quantity: number
};

const handle_create_product = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { product_name, product_description, price, category, quantity } = req.body;

        const product: Product = {
            product_id: 'default',
            product_name,
            product_description,
            price: parseFloat(price),
            category,
            size: req.body.size ? req.body.size : undefined,
            quantity: Number(quantity)
        };

        const keys = Object.keys(product).filter((key) => {
            const k = key as keyof typeof product; // doing this to access property of product
            return product[k];
        });

        const query = `INSERT INTO products (${keys.join(', ')}) VALUES(${keys.map((k, i) => i <= 0 ? 'default' : '?').join(', ')})`;

        await db.execute(query, Object.values(product).slice(1).filter((p) => p)); // filtering out undefined values.

        return res.status(201).json({
            status: 'success',
            message: 'product was created successfully!',
            product
        });

    } catch (error) {
        next(error);
    };
};

const handle_get_products = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        let query = 'SELECT * FROM products';

        const id = Number(req.query.id);

        if (id) {
            query = query + ' where product_id = ?;';
        };

        const [products] = await db.execute<RowDataPacket[]>(query, id ? [id] : []);

        return res.status(200).json({
            status: 'success',
            products
        });

    } catch (error) {
        next(error);
    };
};

const handle_update_product = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                status: 'error',
                error: 'product id is required'
            });
        };

        const allowed_updates = ['product_name', 'product_description', 'category', 'price', 'category', 'size', 'quantity'];

        const requested_updates = req.body.updates ? Object.keys(req.body.updates) : [];

        if (requested_updates.length <= 0) {
            return res.status(404).json({
                status: 'error',
                message: 'updates property is required and at least 1 update should be provided!',
                allowed_updates
            });
        };

        const are_valid_updates = requested_updates.every((update) => {
            return allowed_updates.includes(update);
        });

        if (!are_valid_updates) {
            return res.status(404).json({
                status: 'error',
                message: 'invalid update requested',
                allowed_updates
            });
        };

        const updates_in_query = requested_updates.map((update, i) => {
            let update_string = update + ' = ?'
            if (i > 0 && i !== requested_updates.length) {
                return update_string + ','
            } else {
                return update_string;
            };
        });

        let final_update_values = requested_updates.map((update) => {
            return req.body.updates[update];
        });

        const [result] = await db.execute<ResultSetHeader>(`UPDATE products SET ${updates_in_query} where product_id = ? ;`, final_update_values.concat(id));

        if (result.affectedRows <= 0) {
            return res.status(404).json({
                status: 'error',
                error: `product with id:${id} does not exist`
            });
        };

        return res.status(200).json({
            status: 'success',
            message: `product with id:${id} was updated successfully`,
        });

    } catch (error) {
        next(error);
    };
};

const handle_delete_product = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                status: 'error',
                error: 'product id is required'
            });
        };

        const [result] = await db.execute<ResultSetHeader>('DELETE FROM products where product_id = ?', [id]);

        if (result.affectedRows <= 0) {
            return res.status(404).json({
                status: 'error',
                error: `product with id:${id} does not exist`
            });
        };

        return res.status(200).json({
            status: 'success',
            message: `product with id:${id} was deleted successfully`
        });

    } catch (error) {
        next(error);
    };
};

export default { handle_create_product, handle_get_products, handle_update_product, handle_delete_product };

















