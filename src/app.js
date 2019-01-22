const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const expressWinston = require('express-winston');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./utils/swagger');
const errorHandlers = require('./utils/errorHandlers');
const { winstonConfig } = require('./utils/config');

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
  app.use(expressWinston.logger(winstonConfig));
}

const options = {
  explorer: true,
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
  app.use(expressWinston.errorLogger(winstonConfig));
}

app.use(errorHandlers.notFound);

app.use(errorHandlers.flashValidationErrors);

app.use(errorHandlers.productionErrors);

module.exports = app;
