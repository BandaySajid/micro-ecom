import server_creator from "../../server/server_creator.js";

import router from './router.js';

const service = server_creator('product');

const app = service.init(router);

service.listen(app, 9092);