const fastify = require('fastify');
const cors = require('cors');

const { APP_PORT } = require('./environment');

// order to register / load
// 1. plugins (from the Fastify ecosystem)
// 2. your plugins (your custom plugins)
// 3. decorators
// 4. hooks and middlewares
// 5. your services

const app = fastify({
  bodyLimit: 1048576 * 2,
  logger: { prettyPrint: true }
});

// plugins
require('./plugins/mongo-db-connector')(app);
app.register(require('./plugins/knex-db-connector'), {});
// app.register(require('./plugins/_mongo-db-connector'), {});
app.register(require('./routes/api'), { prefix: 'api' });

// hooks
app.addHook('onClose', (instance, done) => {
  const { knex } = instance;
  knex.destroy(() => instance.log.info('knex pool destroyed.'));
});

// middlewares
app.use(cors());

// Run the server!
app.listen(APP_PORT, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }

  app.log.info(`server listening on ${address}`);

  process.on('SIGINT', () => app.close());
  process.on('SIGTERM', () => app.close());
});
