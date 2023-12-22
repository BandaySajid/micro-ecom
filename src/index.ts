import config from './config.js';
import gateway from './gateway/gateway.js';

(() => {
    gateway.listen(config.http.gateway.host, config.http.gateway.port);
})();