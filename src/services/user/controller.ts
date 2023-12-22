import db from './db.js';
import crypto from 'node:crypto';
import express from 'express';
import util from './util.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

type User = {
    user_id: crypto.UUID,
    username: string,
    email: string,
    password: string,
};

type RedactedUser = {
    user_id: crypto.UUID,
    username: string,
    email: string,
};

const signup = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const hashed_password = util.hash_it(req.body.password);

        const [existing_values] = await db.execute<RowDataPacket[]>('SELECT * FROM users where username = ? OR email = ?', [req.body.username, req.body.email]);

        if (existing_values.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'A user with this data already exists!'
            });
        };

        const user: User = {
            user_id: crypto.randomUUID(),
            username: req.body.username,
            email: req.body.email,
            password: hashed_password
        };

        await db.execute('INSERT INTO users (user_id, username, email, password) VALUES (?, ?, ?, ?)', Object.values(user));

        return res.status(201).json({
            status: 'success',
            message: 'user created succesfully',
            user: {
                user_id: user.user_id,
                email: user.email,
                username: user.username,
            }
        });

    } catch (error) {
        next(error);
    }
};


const signin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const [existing_values] = await db.execute<RowDataPacket[]>('SELECT * FROM users where username = ?', [req.body.username]);

        if (existing_values.length <= 0) {
            return res.status(404).json({
                status: 'error',
                message: 'user not found!'
            });
        };

        const user: User = existing_values[0] as User;

        if (!util.compare_hash(user.password, req.body.password)) {
            return res.status(404).json({
                status: 'error',
                message: 'invalid credentials!'
            });
        };

        const redacted_user: RedactedUser = {
            user_id: user.user_id,
            email: user.email,
            username: user.username
        };

        return res.status(201).json({
            status: 'success',
            message: 'user logged in succesfully',
            user: redacted_user
        });

    } catch (error) {
        next(error);
    }
};

const update_user = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const requested_updates = Object.keys(req.body);

        const allowed_updates = ['username', 'email', 'password'];

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

        let final_updates = requested_updates.map((update) => {
            return req.body[update];
        });

        const query = await db.execute<ResultSetHeader[]>(`UPDATE users SET ${updates_in_query} where user_id = '${req.headers.user_id}';`, final_updates);

        const updated_user: any = query[0];

        if (updated_user.affectedRows <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'cannot update user!'
            });
        };

        return res.status(200).json({
            status: 'success',
            message: 'user updated successfully!'
        });

    } catch (error) {
        next(error);
    };
};

const delete_user = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const query = await db.execute<ResultSetHeader[]>('DELETE FROM users WHERE user_id = ?;', [req.headers.user_id]);
        const deleted_user: any = query[0];

        if (deleted_user.affectedRows <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'cannot delete user!'
            });
        };

        return res.status(200).json({
            status: 'success',
            message: 'user deleted successfully!'
        });

    } catch (error) {
        next(error);
    };
};

export default { signup, signin, update_user, delete_user };