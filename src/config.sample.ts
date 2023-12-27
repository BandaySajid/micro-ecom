type HttpConfig = {
    host: string,
    port: number
};

export default {
    database: {
        host: process.env.DB_HOST || 'mysql',
        user: 'root',
        password: '72543',
        services: {
            user: 'microEcomUsers',
            product: 'microEcomProducts',
            order: 'microEcomOrder',
        }
    },

    http: {
        gateway: {
            host: process.env.HTTP_HOST || '127.0.0.1',
            port: 9090
        } as HttpConfig,
        services: {
            user: {
                host: process.env.HTTP_HOST || '127.0.0.1',
                port: 9091
            } as HttpConfig,
            product: {
                host: process.env.HTTP_HOST || '127.0.0.1',
                port: 9092
            } as HttpConfig,
            order: {
                host: process.env.HTTP_HOST || '127.0.0.1',
                port: 9093
            } as HttpConfig,
        }
    },

    rabbitmq: {
        host: process.env.MQ_HOST ||'rabbitmq'
    },

    jwt: {
        secret: 'b132130b7cf8c6e833047fe0aca4db5f'
    }
};