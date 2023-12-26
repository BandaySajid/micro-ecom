type HttpConfig = {
    host: string,
    port: number
};

export default {
    database: {
        host: 'localhost',
        user: 'root',
        password: '12345',
        services: {
            user: 'microEcomUsers',
            product: 'microEcomProducts',
            order: 'microEcomOrder',
        }
    },

    http: {
        gateway: {
            host: '127.0.0.1',
            port: 9090
        } as HttpConfig,
        services: {
            user: {
                host: '127.0.0.1',
                port: 9091
            } as HttpConfig,
            product: {
                host: '127.0.0.1',
                port: 9092
            } as HttpConfig,
            order: {
                host: '127.0.0.1',
                port: 9093
            } as HttpConfig,
        }
    },

    jwt: {
        secret: 'b132130b7cf8c6e833047fe0aca4db5f'
    }
};