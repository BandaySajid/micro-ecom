import express from 'express';
import db from './db.js';
import mq from './mq.js';
import amqp from 'amqplib';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import crypto from 'node:crypto';

type Q_Message = {
    type: string
    service: string
    data: any
};

type Product = {
    product_id: number
    product_name: string
    quantity: number //user selected quantity
    price: number
};

type Order = {
    order_id: crypto.UUID
    user_id: crypto.UUID
    status: string
    total_price: number
};

type OrderItem = {
    item_id: crypto.UUID
    item_name: string
    item_price: number
    item_quantity: number
    order_id: crypto.UUID
};

const FROM_PRODUCT_Q = 'PRODUCT:ORDER';
const TO_PRODUCT_Q = 'ORDER:PRODUCT';

const channel = await mq();

const handle_create_order = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const products: Product[] = req.body.products || [];

        if (products.length <= 0) {
            return res.status(400).json({
                status: 'error',
                error: 'minimum 1 product is required!'
            });
        };

        const msg = {
            type: 'GET_INFO',
            service: 'ORDER',
            data: {
                products
            }
        } as Q_Message;

        await channel.publish(TO_PRODUCT_Q, JSON.stringify(msg));

        const product_final_prices = products.map((a) => { //prices according to quantites
            return a.price * a.quantity;
        });

        const total_final_price = product_final_prices.reduce((a, b) => {
            return a + b;
        });

        const order: Order = {
            order_id: crypto.randomUUID(),
            user_id: req.body.user.user_id,
            total_price: total_final_price,
            status: 'PENDING',
        };

        const buf: amqp.Message = await channel.consume(FROM_PRODUCT_Q, `${req.headers.req_id}-consumer`) as any;

        const message: Q_Message = JSON.parse(buf?.content.toString() as any);

        const order_items: OrderItem[] = message.data.products.map((product: Product) => {
            return {
                item_id: crypto.randomUUID(),
                item_name: product.product_name,
                item_price: product.price,
                item_quantity: product.quantity,
                order_id: order?.order_id,
            } as OrderItem;
        });

        const tampered_products = order_items.filter((p, i) => {
            return p.item_price !== products[i].price;
        });

        if (tampered_products.length > 0) {
            return res.status(400).json({
                status: 'error',
                error: 'price has been tampered with products',
                tampered_products
            });
        };

        const order_items_values = order_items.map((item: OrderItem) => {
            return Object.values(item)
        });

        const [new_order_rows] = await db.execute<ResultSetHeader>('INSERT INTO orders (order_id, user_id, total_price, status) VALUES(?, ?, ?, ?)', Object.values(order));
        const [order_item_rows] = await db.execute<ResultSetHeader>('INSERT INTO items (item_id, item_name, item_price, item_quantity, order_id) VALUES (?, ?, ?, ?, ?) ', order_items_values.length === 1 ? order_items_values[0] : order_items_values);

        if (order_item_rows.affectedRows < order_items.length) {
            return res.status(400).json({
                status: 'error',
                error: `ORDER with id:${order?.order_id} cannot be created!`,
            });
        };

        const response_items = order_items.map((item) => {
            return { item_name: item.item_name, item_price: item.item_price, quantity: item.item_quantity };
        });

        return res.status(201).json({
            status: 'success',
            message: 'order has been created successfully',
            order: { ...order, items: response_items }
        });
    } catch (error) {
        next(error);
    };
};

const handle_get_orders = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const [orders] = await db.query<RowDataPacket[]>('SELECT order_id from orders where user_id = ?', [req.body.user.user_id]);

        res.status(200).json({
            status: 'success',
            orders
        });

    } catch (error) {
        next(error);
    };
};

const handle_update_order = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        if (!req.body.order_id) {
            return res.status(400).json({
                status: 'error',
                message: 'order id is required',
            });
        };

        const allowed_updates = ['status'];

        const requested_updates = req.body.updates ? Object.keys(req.body.updates) : [];

        if (requested_updates.length <= 0) {
            return res.status(400).json({
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

        const [updated_order] = await db.execute<ResultSetHeader>(`UPDATE orders SET ${updates_in_query} where order_id = ?`, final_update_values.concat(req.body.order_id));

        if (updated_order.affectedRows <= 0) {
            return res.status(404).json({
                status: 'error',
                error: `order with id ${req.body.order_id} does not exist`
            });
        };

        res.status(200).json({
            status: 'success',
            message: `order with id ${req.body.order_id} was updated successfully`
        });
    } catch (error) {
        next(error);
    };
};

const handle_cancel_order = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        if (!req.body.order_id) {
            return res.status(400).json({
                status: 'error',
                message: 'order id is required',
            });
        };

        const [cancelled_order] = await db.execute<ResultSetHeader>(`UPDATE orders SET status = 'CANCELLED' where order_id = ?`, [req.body.order_id]);

        if (cancelled_order.affectedRows <= 0) {
            return res.status(404).json({
                status: 'error',
                error: `order with id ${req.body.order_id} does not exist`
            });
        };

        res.status(200).json({
            status: 'success',
            message: `order with id ${req.body.order_id} has been cancelled!`
        });
    } catch (error) {
        next(error);
    };
};

const handle_delete_orders = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const orders: Order[] = req.body.orders || [];
        if (orders.length <= 0) {
            return res.status(400).json({
                status: 'error',
                error: 'orders(array) property is required and at least 1 order should be provided!'
            });
        };

        const placeholders = Array(orders.length).fill('?').join(',');

        const [result] = await db.query<ResultSetHeader>(`DELETE FROM orders where order_id IN (${placeholders})`, orders);

        if (result.affectedRows < orders.length) {
            return res.status(404).json({
                status: 'error',
                error: `${orders.length - result.affectedRows} orders does not exist!`
            });
        };

        return res.status(200).json({
            status: 'success',
            message: 'these orders were deleted successfully',
            orders
        });

    } catch (error) {
        next(error);
    };
};

export default { handle_create_order, handle_update_order, handle_delete_orders, handle_get_orders, handle_cancel_order };