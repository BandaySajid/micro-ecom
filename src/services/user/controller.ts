import db from './db.js';
import crypto from 'node:crypto';
import express from 'express';
import util from './util.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { User, RedactedUser, AuthTokenData } from './types.js';

const handle_signup = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

        const redacted_user: RedactedUser = {
            user_id: user.user_id,
            email: user.email,
            username: user.username
        };

        const auth_token_data: AuthTokenData = {
            user: redacted_user,
            created_on: new Date()
        };

        const token = util.generate_auth_token(auth_token_data);

        return res.status(201).json({
            status: 'success',
            message: 'user created succesfully',
            user: redacted_user,
            auth_token: token
        });

    } catch (error) {
        next(error);
    }
};


const handle_signin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({
                status: 'error',
                message: 'username and password is required!'
            });
        };

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

        const auth_token_data: AuthTokenData = {
            user: redacted_user,
            created_on: new Date()
        };

        const token = util.generate_auth_token(auth_token_data);

        return res.status(201).json({
            status: 'success',
            message: 'user logged in succesfully',
            user: redacted_user,
            auth_token: token
        });

    } catch (error) {
        next(error);
    }
};

const handle_update_user = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {

        const user: RedactedUser = req.body.user;

        const allowed_updates = ['username', 'email', 'password'];

        const requested_updates = req.body.updates ? Object.keys(req.body.updates) : [];

        if (requested_updates.length <= 0) {
            return res.status(404).json({
                status: 'error',
                message: 'updates property is required and at least 1 update should be provied!',
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

        let final_updates = requested_updates.map((update) => {
            return req.body.updates[update];
        });

        const [result] = await db.execute<ResultSetHeader>(`UPDATE users SET ${updates_in_query} where user_id = ? ;`, final_updates.concat(user.user_id));

        if (result.affectedRows <= 0) {
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

const handle_delete_user = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user: RedactedUser = req.body.user;
        const [result] = await db.execute<ResultSetHeader>('DELETE FROM users WHERE user_id = ?;', [user.user_id]);

        if (result.affectedRows <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'user does not exist!'
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

export default { handle_signup, handle_signin, handle_update_user, handle_delete_user };

