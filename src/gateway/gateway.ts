import express from 'express';
import config from '../config.js';
import Logger from '../logger.js';
import nodeURL from 'node:url';

const logger = new Logger('gateway');

const gateway = express();

gateway.use(express.json());
gateway.use(express.urlencoded({ extended: false }));

gateway.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const xss = Object.values(req.body).find((val: any) => {
            return is_xss(val.toString());
        });
        if (xss) {
            return res.status(400).json({
                status: 'error',
                error: `Don't be too smart. Malicious input detected!`
            });
        };
        next();
    } catch (error) {
        return res.status(500).json({
            status: 'gateway error'
        });
    }
});

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

        const url = nodeURL.format({
            protocol: req.protocol,
            hostname: service_config.host,
            pathname: path,
            query: req.query as any,
            port: service_config.port
        });

        delete req.headers['content-length'];

        const resp = await fetch(url, {
            headers: req.headers as any,
            method: req.method,
            body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : null
        });

        const json_resp = await resp.json();

        if (resp.status) {
            return res.status(resp.status).json(json_resp);
        };
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

function is_xss(input: string) {
    const xssPattern = /<[^>]*>/;
    if (xssPattern.test(input)) {
        return true
    } else {
        return false;
    };
}

const listen = (host: string, port: number) => {
    gateway.listen(port, host, () => {
        console.log('[GATEWAY]: Server is up on:', port);
    });
};

export default { listen };