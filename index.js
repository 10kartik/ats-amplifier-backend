const serverless = require("serverless-http");
const express = require("express"),
  morgan = require("morgan"),
  helmet = require("helmet"),
  winston = require("winston"),
  cors = require("cors");
customUrlParser = require("url");
require("dotenv").config();

const rootPrefix = ".";
const basicHelper = require(rootPrefix + "/helpers/basic"),
  customMiddleware = require(rootPrefix + "/helpers/customMiddleware");

const apiRoutes = require(rootPrefix + "/routes/index");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

morgan.token("id", function getId(req) {
  return req.id;
});

// eslint-disable-next-line no-unused-vars
morgan.token("pid", function getPid(req) {
  return process.pid;
});

// eslint-disable-next-line no-unused-vars
morgan.token("endTime", function getEndTime(req) {
  return Date.now();
});

// eslint-disable-next-line no-unused-vars
morgan.token("endDateTime", function getEndDateTime(req) {
  return basicHelper.logDateFormat();
});

morgan.token("ipAddress", function getIpAddress(req) {
  return req.headers["x-real-ip"];
});

/**
 * First log line of request start
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 *
 * @returns {Promise<void>}
 */
const startRequestLogLine = function (req, res, next) {
  const message = [
    "Started '",
    customUrlParser.parse(req.originalUrl).pathname, // Todo: deprecation fix
    "'  '",
    req.method,
    "' at ",
    basicHelper.logDateFormat(),
  ];

  console.info(message.join(""));

  if (!basicHelper.isProduction()) {
    logger.info(
      "\nHEADERS FOR CURRENT REQUEST=====================================\n",
      JSON.stringify(req.headers),
      "\n========================================================"
    );
  }

  next();
};

/**
 * Get request params
 *
 * @param {object} req
 * @return {*}
 */
const getRequestParams = function (req) {
  // IMPORTANT NOTE: Don't assign parameters before sanitization.
  if (req.method === "POST") {
    return req.body;
  } else if (req.method === "GET") {
    return req.query;
  }

  return {};
};

/**
 * Assign params
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 *
 * @returns {Promise<void>}
 */
const assignParams = function (req, res, next) {
  req.decodedParams = getRequestParams(req);

  /**
   * Internal decoded params are for parameters which are not passed in the request from outside.
   */
  req.internalDecodedParams = {};

  next();
};

/**
 * Set response headers
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 *
 * @returns {Promise<void>}
 */
const setResponseHeader = async function (req, res, next) {
  res.setHeader("Pragma", "no-cache");
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate, post-check=0, pre-check=0"
  );
  res.setHeader("Vary", "*");
  res.setHeader("Expires", "-1");
  res.setHeader("Last-Modified", new Date().toUTCString());
  next();
};

// Set worker process title.
process.title = "API node worker";

// Create express application instance.
const app = express();

// Add id and startTime to request.
app.use(customMiddleware());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "ats-amplifier-frontend.vercel.app",
      "kk10-ats.vercel.app",
      "https://*.vercel.app",
      "https://ats-amplifier.vercel.app",
      "ats-booster.vercel.app",
      "https://ats.10kk.tech",
    ],
    credentials: true,
  })
);

// Load Morgan
app.use(
  morgan(
    "[:pid][:id][:endTime][" +
      process.env.APP_NAME +
      '] Completed with ":status" in :response-time ms at :endDateTime -  ":res[content-length] bytes" - ":ipAddress" ":remote-user" - "HTTP/:http-version :method :url" - ":referrer" - ":user-agent" \n\n'
  )
);

app.use(function (req, res, next) {
  let data = "";
  req.on("data", function (chunk) {
    data += chunk;
  });
  req.on("end", function () {
    req.rawBody = data;
  });
  next();
});

// Helmet helps secure Express apps by setting various HTTP headers.
app.use(helmet());

// Start Request logging. Placed below static and health check to reduce logs.
app.use(startRequestLogLine);

// Set response headers.
app.use(setResponseHeader);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/**
 * NOTE: For API routes: first sanitize and then assign params.
 */
app.use("/api/boost", assignParams, function (request, response, next) {
  apiRoutes(request, response, next);
});

// Add health check route
app.get("/health", function (req, res) {
  res.send("OK");
});

// middleware to handle 404 errors, dont use response helper.
app.use(function (req, res, next) {
  res.status(404).send({ error: "Route Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// If running in development mode, start the server on port 8080, else export handler for lambda
if (process.env.ENVIRONMENT === "development") {
  require("dotenv").config();
  console.log(`Server running on ${process.env.PORT || 8080}`);
  app.listen(process.env.PORT || 8080);
  module.exports = { handler: app };
} else {
  // Export the handler for Lambda on production
  console.log("Exporting handler for lambda");
  module.exports.handler = serverless(app);
}
