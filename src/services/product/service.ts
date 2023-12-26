import server_creator from "../../server/server_creator.js";
import config from '../../config.js';

import router from './router.js';

const service = server_creator('product');

const app = service.init(router);

service.listen(app, config.http.services.product.port);