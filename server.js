const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
var corsOptions = {
  origin: "http://localhost:8081"
};
var swaggerUi = require('swagger-ui-express'), swaggerDocument = require('./swagger.json');
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// adding swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// database settings
const db = require("./models");
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");
}).then(() => {
  db.users.create({
    username: "admin",
    apiKey: "b7db324f-e3ce-4f8e-a0e8-f73f35f1060c",
    role: "admin",
  })
  let i = 0
  while (i < 5) {
    db.users.create({
        username: "user"+i,
        role: "user",
    });
    i++;
  }
  i = 0
  privacy = [true, false]
  usernames = ["user0", "user1", "user2", "user3", "user4"]
  while (i < 1000) {
    privacy = privacy.sort(() => Math.random() - 0.5)
    usernames = usernames.sort(() => Math.random() - 0.5)
    db.videos.create({
        name: "fake inputs",
        url: "http://test.url",
        thumbnailUrl : "http://test.url/image",
        isPrivate: privacy[0],
        timesViewed: Math.floor(Math.random() * 100),
        username: usernames[0],
    });
    i++;
  }
});
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Randy's videos application." });
});
// route to apis
require("./routes/healthcheck")(app);
require("./routes/user")(app);
require("./routes/video")(app);
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});