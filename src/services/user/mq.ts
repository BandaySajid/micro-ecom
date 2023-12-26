import amqplib from 'amqplib';

const connect = async () => {
    const connection = await amqplib.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();
    return channel;
};

const mq = async () => {
    const channel = await connect();

    const publish = (queue: string, message: string) => {
        return new Promise(async (resolve, reject) => {
            try {
                const buf: Buffer = Buffer.from(message);
                await channel.assertQueue(queue);
                channel.sendToQueue(queue, buf);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    };

    const consume = (queue: string, consumerTag: string) => { //this method should not be used for listening continuous messages, it should be only used for instant message consuming.
        return new Promise(async (resolve, reject) => {
            try {
                await channel.assertQueue(queue);
                channel.consume(queue, async (msg) => {
                    channel.ack(msg as amqplib.Message);
                    await channel.cancel(consumerTag);
                    resolve(msg);
                }, { noAck: false, consumerTag: consumerTag }); // using consumer tag to cancel 
            }
            catch (err) {
                reject(err);
            }
        });
    };

    return { publish, consume, channel };

    /* returning channel here so that a consumer can use the actual channel.consume method for listening and consuming continuous messages.
    The above custom consume method is used for awaiting for a message that is returned instantly.*/
};

export default mq;