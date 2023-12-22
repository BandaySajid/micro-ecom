import express from 'express';
import config from '../config.js';
import Logger from '../logger.js';

const logger = new Logger('gateway');

const gateway = express();

gateway.use(express.json());
gateway.use(express.urlencoded({ extended: false }));

gateway.all('/api/:service/:route', async (req, res) => {
    try {
        const service = req.params.service as keyof typeof config.http.services;
        const service_config = config.http.services[service];

        if (!service_config) {
            return res.status(404).json({
                status: 'route does not exist'
            });
        };

        const path = '/service' + req.path.split('/api')[1];

        const resp = await fetch(`http://${service_config.host}:${service_config.port}${path}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: req.method,
            body: JSON.stringify(req.body)
        });

        const json_resp = await resp.json();

        if (resp.status) {
            return res.status(resp.status).json(json_resp);
        }
    } catch (err) {
        logger.log(`[ERROR]: an error has occured with route: ${req.url}`, err);
        return res.status(500).json({
            status: 'error',
            message: 'internal server error!'
        });
    };
});

gateway.all('*', (req, res) => {
    return res.status(404).json({
        status: 'route not found'
    });
});

const listen = (host: string, port: number) => {
    gateway.listen(port, host, () => {
        console.log('[GATEWAY]: Server is up on:', port);
    });
};

export default { listen };