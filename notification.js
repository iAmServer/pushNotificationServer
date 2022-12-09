const admin = require("firebase-admin");
const apn = require("apn");
const serviceAccount = require(`./${process.env.ANDROID_SERVICE_ACCOUNT}.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const ios_notification_options = {
  token: {
    key: `${process.env.IOS_KEY}.p8`,
    keyId: process.env.IOS_KEY_ID,
    teamId: process.env.IOS_TEAM_ID,
  },
  production: !!(process.env.IOS_PRODUCTION === "true"),
  pushType: process.env.IOS_PUSH_TYPE,
};

const android_notification_options = {
  priority: process.env.ANDROID_PRIORITY,
  timeToLive: +process.env.ANDROID_TTL,
};

const apnProvider = new apn.Provider(ios_notification_options);

exports.sendIOSPushNotification = (req, res) => {
  const { deviceToken: token, title, body } = req.body;

  if (!token) {
    res.status(400).send("Device token is required");
    return;
  }

  if (!title || !body) {
    res.status(400).send("Title and body are required");
    return;
  }

  const notification = new apn.Notification();

  notification.badge = +process.env.IOS_BADGE;
  notification.sound = process.env.IOS_SOUND;
  notification.alert = { title, body };
  notification.payload = { messageFrom: "Hail No!" };
  notification.topic = process.env.IOS_BUNDLE_ID;

  apnProvider
    .send(notification, token)
    .then((result) => {
      console.log(result);
      res.status(200).send("Successfully sent message");
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send("Error sending message");
    });
};

exports.sendAndroidPushNotification = (req, res) => {
  const { deviceToken: token, title, body } = req.body;

  if (!token) {
    res.status(400).send("Device token is required");
    return;
  }

  if (!title || !body) {
    res.status(400).send("Title and body are required");
    return;
  }

  const message = {
    notification: {
      title,
      body,
    },
    token,
  };

  admin
    .messaging()
    .sendToDevice(token, message, android_notification_options)
    .then((response) => {
      console.log("Successfully sent message:", response);
      res.status(200).send("Successfully sent message");
    })
    .catch((error) => {
      console.log("Error sending message:", error);
      res.status(400).send("Error sending message");
    });
};
