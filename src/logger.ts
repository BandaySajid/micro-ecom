import fs from 'node:fs/promises';

class Logger<T>{
    public service: string;
    constructor(service: string | undefined) {
        if (!service) {
            this.service = 'global';
        } else {
            this.service = service;
        };
    };

    log(...args: any[]) {
        const final_log = args.map((val) => {
            if (typeof val === 'object') {
                return + ' ' + JSON.stringify(val.stack || val);
            }
            return val + ' ';
        });

        const datetime: Date = new Date();
        let message: string = `[service:${this.service}]-[${datetime}]: ${final_log}\n`;
        this.save_log(message);
        console.log(message);
    };

    private save_log = async (log: any) => {
        const file = await fs.open(`${this.service}-service.log`, 'a+');
        await file.write(log);
        await file.close();
    };
};

export default Logger;