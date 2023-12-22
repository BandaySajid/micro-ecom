import express from 'express';
import Logger from '../logger.js';

const server_creator = (service: string) => {
    const logger = new Logger(service);

    const init = (router: express.Router | undefined): express.Application => {
        const app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));

        if (router) {
            app.use(`/service/${service}`, router);
            app.use((req: express.Request, res: express.Response)=>{
                return res.status(404).json({
                    status: 'error',
                    message: 'service route not found!'
                });
            });
        };

        app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            logger.log(`[ERROR]: an error has occured with route: ${req.url}`, err);
            return res.status(500).json({
                status: 'error',
                message: 'an error occured from server side!'
            });
        });


        return app;
    };

    const listen = (app: express.Application, port: number) => {
        app.listen(port, '127.0.0.1', () => {
            console.log(`[SERVICE]: ${service} is up on port:`, port);
        });
    };

    return { init, listen };
};

export default server_creator;