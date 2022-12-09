const app = require("express")();
require("dotenv").config();
const notification = require("./notification");
const PORT = process.env.PORT || 3000;

console.log(process.env);

app.use(require("body-parser").json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/send/notification/:provider", (req, res) => {
  const { provider } = req.params;

  if (provider === "ios") {
    notification.sendIOSPushNotification(req, res);
  } else if (provider === "android") {
    notification.sendAndroidPushNotification(req, res);
  }
});

// 404
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
