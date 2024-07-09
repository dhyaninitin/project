const {
  app,
  BrowserWindow,
  Notification,
  globalShortcut,
} = require("electron");
const ioHook = require("iohook");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const expressApp = express();
const screenshot = require("./captureSreenshot.js");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dbProperties = require("./db-properties.js");
const Store = require("electron-store");
const store = new Store();
const imagePath = path.join(__dirname, "assets", "images", "vvt-logo.png");
require("events").EventEmitter.defaultMaxListeners = 40;
const portfinder = require("portfinder");
const NOTIFICATION_ONLINE_TITLE = "You are Online";
const NOTIFICATION_OFFLINE_TITLE = "You are Offline";
const NOTIFICATION_BODY = "Click to close notification";
const helper = require("./middleware/helper.js");
const axios = require("axios");
const { CancelToken } = axios;
const source = CancelToken.source();
const trackerVersion = require("./package.json").version;
const userSchema = require("./app/schemas/users.schema.js");

expressApp.use(
  cors({
    origin: "*",
  })
);

expressApp.set("view engine", "ejs");
expressApp.use("/assets", express.static("assets"));

mongoose.set("strictQuery", true);
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));

function redirectToLogin(req, res, next) {
  if (req.path !== "/login") {
    return res.redirect("/login");
  }
  next();
}
expressApp.get("/", redirectToLogin);

// Global Variables Declared
let win = null;

let userData = {};

let timerInterval = null;
let initialTimerInterval = null;
let isnotificationallowed = null;

let isListening = false;

let initialCounter = 0;
let counter = 0;
let timerEveryMinute = 0;
let totalClicks = 0;
let TotalClickCounts = 0;
let TotalKeyCounts = 0;
let totalKeyPresses = 0;
let timerStartedAt = 0;

let currentsession = "";
let todaysession = "";
let thisweeksession = "";
let projectname = "";
let userId = "";
let task = "";
let toggle = "false";
let assignedHours = 0;

let isUserLoggedIn = false;

const appName = "VV-WST";

const createWindow = () => {
  win = new BrowserWindow({
    width: 350,
    height: 590,
    maximizable: false,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: imagePath,
  });

  win.loadURL(`http://localhost:${dbProperties.PORT}/login`);

  win.on("closed", function () {
    win = null;
  });

  win.webContents.on("did-finish-load", () => {
    win.webContents.executeJavaScript(`
      const fs = require("fs");
      const path = require("path");
      const { shell } = require("electron");

      const appName = "VV-WST";

      const sourceFolderPath = path.join(
        process.env.LOCALAPPDATA,
        "Programs",
        appName
      );

      const destinationFolderPath = path.join(
        process.env.APPDATA,
        "Microsoft",
        "Windows",
        "Start Menu",
        "Programs",
        "Startup"
      );

      const exeFileName = \`${appName}.exe\`;
      const destinationExePath = path.join(destinationFolderPath, exeFileName);

      if (!fs.existsSync(destinationExePath)) {
        const sourceExePath = path.join(sourceFolderPath, exeFileName);

        const shortcutName = \`${appName}.lnk\`;
        const destinationShortcutPath = path.join(destinationFolderPath, shortcutName);

        try {
          shell.writeShortcutLink(destinationShortcutPath, {
            target: sourceExePath,
            icon: sourceExePath,
          });

          console.log(\`${appName} shortcut copied to Startup folder.\`);
        } catch (error) {
          console.error('Error creating shortcut:', error.message);
        }
      } else {
        console.log(\`${appName} shortcut already exists in the Startup folder.\`);
      }
    `);
  });
};

const gotSingleLock = app.requestSingleInstanceLock();

if (!gotSingleLock) {
  app.whenReady().then(() => {
    const options = {
      title: "Another instance is already opened !",
      body: NOTIFICATION_BODY,
      icon: imagePath,
      silent: false,
    };
    new Notification(options).show();

    app.quit();
  });
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(createWindow);

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (win === null) {
      createWindow();
    }
  });
}

app.on("ready", async () => {
  try {
    globalShortcut.register("Control+Shift+D", () => {
      const devToolsOpened = win.webContents.isDevToolsOpened();

      if (devToolsOpened) {
        win.webContents.closeDevTools();
        win.unmaximize();
      } else {
        win.maximize();
        win.webContents.openDevTools();
      }
    });
  } catch (error) {
    console.log("Window is not ready:" + error);
    app.quit();
  }
});

app.on("before-quit", () => {
  if (isUserLoggedIn) {
    updateToggleStatus(0, userId);
  }

  globalShortcut.unregisterAll();
  ioHook.stop();
});

// API End Points
expressApp.post("/loginWithCreds", async function (req, res) {
  try {
    const response = await axios.post(
      `${dbProperties.AZURE_BASE_URL}/loginWithCreds`,
      req.body
    );

    if (response.status == 200) {
      const { successMessage, userName, token } = response.data;

      startTimerInitial();
      store.set("token", token);
      userId = await helper.getUserIdFromToken();
      isUserLoggedIn = true;

      const indexPath = path.join(__dirname, "views", "pages", "index.ejs");
      res.render(indexPath, { successMessage, userName, trackerVersion });
    }
  } catch (error) {
    console.log("Error in user login:", error);
  }
});

expressApp.get("/login", async (req, res) => {
  const token = store.get("token");

  let decodedToken;
  if (token) {
    try {
      decodedToken = jwt.verify(token, dbProperties.SECRET_KEY_TRACKER);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        let longErrorMessage =
          "Token has been expired. Please try to login again.";
        const indexPath = path.join(
          __dirname,
          "views",
          "partials",
          "login.ejs"
        );
        return res.render(indexPath, { longErrorMessage });
      } else {
        let longErrorMessage =
          "Internal server error. Please try to login again.";
        const indexPath = path.join(
          __dirname,
          "views",
          "partials",
          "login.ejs"
        );
        return res.render(indexPath, { longErrorMessage });
      }
    }

    if (decodedToken) {
      const id = decodedToken.id;
      const response = await userSchema.findById(id);

      if (response.jwttoken == undefined) {
        let longErrorMessage =
          "Internal server error. Please try to login again.";
        const indexPath = path.join(
          __dirname,
          "views",
          "partials",
          "login.ejs"
        );
        return res.render(indexPath, { longErrorMessage });
      }

      if (response.jwttoken === token) {
        let response = await axios.post(
          `${dbProperties.AZURE_BASE_URL}/login`,
          decodedToken,
          {
            headers: {
              Authorization: `Bearer ${helper.getUserToken()}`,
            },
          }
        );

        if (response) {
          const { successMessage, userName } = response.data;

          startTimerInitial();
          userId = await helper.getUserIdFromToken();
          isUserLoggedIn = true;

          const indexPath = path.join(__dirname, "views", "pages", "index.ejs");
          res.render(indexPath, { successMessage, userName, trackerVersion });
        }
      } else {
        let longErrorMessage =
          "Multiple system access identified. Please try to login again.";
        const indexPath = path.join(
          __dirname,
          "views",
          "partials",
          "login.ejs"
        );
        res.render(indexPath, { longErrorMessage });
      }
    }
  } else {
    const indexPath = path.join(__dirname, "views", "partials", "login.ejs");
    res.render(indexPath);
  }
});

expressApp.post("/logout", async function (req, res) {
  let response = await userSchema.findById(userId);

  if (response.togglestatus == 1) {
    const options = {
      title: "Turn off the Tracker before you logout.",
      body: NOTIFICATION_BODY,
      icon: imagePath,
      silent: false,
    };
    new Notification(options).show();
    res.status(499).send({ message: "unsuccessful" });
  } else {
    userData = {};

    timerInterval = null;
    isnotificationallowed = null;

    isListening = false;
    isUserLoggedIn = false;
    toggle = "false";

    counter = 0;
    initialCounter = 0;
    timerEveryMinute = 0;
    TotalClickCounts = 0;
    totalClicks = 0;
    TotalKeyCounts = 0;
    totalKeyPresses = 0;
    timerStartedAt = 0;
    assignedHours = 0;

    currentsession = "";
    todaysession = "";
    thisweeksession = "";
    projectname = "";
    task = "";
    userId = "";

    stopListening();
    store.delete("token");
    clearInterval(timerInterval);
    clearInterval(initialTimerInterval);
    res.status(200).send({ message: "successful" });
  }
});

expressApp.post("/invalidToken", async function (req, res) {
  userData = {};

  timerInterval = null;
  isnotificationallowed = null;

  isListening = false;
  isUserLoggedIn = false;
  toggle = "false";

  counter = 0;
  initialCounter = 0;
  timerEveryMinute = 0;
  TotalClickCounts = 0;
  totalClicks = 0;
  TotalKeyCounts = 0;
  totalKeyPresses = 0;
  timerStartedAt = 0;
  assignedHours = 0;

  currentsession = "";
  todaysession = "";
  thisweeksession = "";
  projectname = "";
  task = "";

  updateToggleStatus(0, userId);
  userId = "";
  stopListening();
  store.delete("token");
  clearInterval(timerInterval);
  clearInterval(initialTimerInterval);

  let errorMessage =
    "Multiple system access identified. Please try to login again.";
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("logout-message", errorMessage);
  });

  win.loadURL(`http://localhost:${dbProperties.PORT}/login`);
  res.status(200).send({ message: "Logout successful" });
});

expressApp.post("/saveWorkStatus", function (req, res) {
  projectname = req.body.projectname;
  task = req.body.task;
  res.status(200).json({ projectname, task });
});

expressApp.post("/getAssignedHours", function (req, res) {
  assignedHours = req.body.assignedHours;
  res.status(200).json({ assignedHours });
});

expressApp.get("/getWorkStatus", async function (req, res) {
  try {
    const response = await axios.get(
      `${dbProperties.AZURE_BASE_URL}/getWorkStatus`,
      {
        params: {
          id: userId,
        },
        headers: {
          Authorization: `Bearer ${helper.getUserToken()}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.log("Error fetching work status data:", error);
  }
});

expressApp.post("/updateNotificationStatus", async function (req, res) {
  try {
    const response = await axios.put(
      `${dbProperties.AZURE_BASE_URL}/updateNotificationStatus`,
      {
        id: userId,
        isnotificationallowed: req.body.isnotificationallowed,
      },
      {
        headers: {
          Authorization: `Bearer ${helper.getUserToken()}`,
        },
      }
    );

    if (response) {
      isnotificationallowed = response.data.isnotificationallowed;
    }

    res.status(200).json(response.data);
  } catch (error) {
    console.log("Error updating notification status:", error);
  }
});

expressApp.get("/getUser", async (req, res) => {
  try {
    const response = await axios.get(`${dbProperties.AZURE_BASE_URL}/getUser`, {
      params: {
        id: userId,
      },
      headers: {
        Authorization: `Bearer ${helper.getUserToken()}`,
      },
    });

    isnotificationallowed = response.data.userData.isnotificationallowed;
    userData = response.data.userData;

    res.status(200).json(response.data);
  } catch (error) {
    console.log("Error fetching user data:", error);
  }
});

expressApp.get("/getLastScreenshot", async function (req, res) {
  try {
    const response = await axios.get(
      `${dbProperties.AZURE_BASE_URL}/getLastScreenshot`,
      {
        params: {
          id: userId,
        },
        headers: {
          Authorization: `Bearer ${helper.getUserToken()}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.log("Error fetching last screenshot:", error);
  }
});

expressApp.get("/getWeeklySession", async function (req, res) {
  try {
    const response = await axios.get(
      `${dbProperties.AZURE_BASE_URL}/getWeeklySession`,
      {
        params: {
          id: userId,
        },
        headers: {
          Authorization: `Bearer ${helper.getUserToken()}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.log("Error fetching weekly session:", error);
  }
});

function convertToIst() {
  const currentDateTime = new Date();
  currentDateTime.setHours(currentDateTime.getHours() + 5);
  currentDateTime.setMinutes(currentDateTime.getMinutes() + 30);
  return currentDateTime;
}

expressApp.post("/toggleTimer", async (req, res) => {
  toggle = req.body.message;
  timerStartedAt = convertToIst();
  if (toggle == "true") {
    startTimer();
    startListening();
    clearInterval(initialTimerInterval);

    const options = {
      title: NOTIFICATION_ONLINE_TITLE,
      body: NOTIFICATION_BODY,
      icon: imagePath,
      silent: false,
    };
    new Notification(options).show();
  } else if (toggle == "false") {
    counter = 0;
    stopListening();
    clearInterval(timerInterval);

    const options = {
      title: NOTIFICATION_OFFLINE_TITLE,
      body: NOTIFICATION_BODY,
      icon: imagePath,
      silent: false,
    };
    new Notification(options).show();
  } else {
    counter = 0;
    stopListening();
    clearInterval(timerInterval);

    const options = {
      title: toggle,
      icon: imagePath,
      silent: false,
    };
    new Notification(options).show();
  }
  let Status = toggle == "true" ? 1 : 0;
  updateToggleStatus(Status, userId);

  res.status(200).json({ message: "success" });
});

async function updateToggleStatus(status, id) {
  try {
    const response = await axios.put(
      `${dbProperties.AZURE_BASE_URL}/updateUserToggleStatus`,
      {
        status: status,
        id: id,
      },
      {
        headers: {
          Authorization: `Bearer ${helper.getUserToken()}`,
        },
      }
    );

    console.log(response.data.message);
  } catch (error) {
    console.log("Error updating toggle status:", error);
  }
}

expressApp.get("/getImageViewUrl", async function (req, res) {
  try {
    const response = await axios.get(
      `${dbProperties.AZURE_BASE_URL}/getImageViewUrl`,
      {
        params: {
          blobName: req.query.screen,
          id: userId,
        },
        headers: {
          Authorization: `Bearer ${helper.getUserToken()}`,
        },
      }
    );

    res.status(200).json({ imageUrl: response.data.imageUrl });
  } catch (error) {
    console.log("Error fetching image view url:", error);
  }
});

expressApp.delete("/deleteUserScreenshot", async function (req, res) {
  try {
    const isDeleted = await axios.delete(
      `${dbProperties.AZURE_BASE_URL}/deleteUserScreenshot`,
      {
        params: {
          id: userId,
        },
        headers: {
          Authorization: `Bearer ${helper.getUserToken()}`,
        },
      }
    );

    if (isDeleted) {
      res.status(200).json({ message: "Deleted" });
    }
  } catch (error) {
    console.log("Error deleting screenshot:", error);
  }
});

// Axios Interceptor to intercept each api call
axios.interceptors.request.use(
  (config) => {
    config.cancelToken = source.token;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => handleSuccess(response),
  (error) => errorHandler(error)
);

const handleSuccess = async (response) => {
  if (response.data.newToken) {
    await updateNewTokenInStore(response.data.newToken);
  }
  return response;
};

const errorHandler = async (error) => {
  if (axios.isCancel(error)) {
    return new Promise(() => {});
  }

  let errorMessage = "";
  if (error.response) {
    switch (error.response.status) {
      case 400:
        errorMessage = error.response.data.message;
        logoutUser(errorMessage);
        break;
      case 401:
        errorMessage = error.response.data.message;
        logoutUser(errorMessage);
        break;
      case 403:
        errorMessage = error.response.data.message;
        logoutUser(errorMessage);
        break;
      case 451:
        errorMessage = error.response.data.message;
        logoutUser(errorMessage);
        break;
      default:
    }
  }

  return Promise.reject(error);
};

async function updateNewTokenInStore(newToken) {
  try {
    if (newToken) {
      store.delete("token");
      store.set("token", newToken);
      userId = await helper.getUserIdFromToken();
    } else {
      console.error("Failed to update user token");
    }
  } catch (error) {
    console.error("Error updating user token:", error);
  }
}

async function logoutUser(errorMessage) {
  userData = {};

  timerInterval = null;
  isnotificationallowed = null;

  isListening = false;
  isUserLoggedIn = false;
  toggle = "false";

  counter = 0;
  initialCounter = 0;
  timerEveryMinute = 0;
  TotalClickCounts = 0;
  totalClicks = 0;
  TotalKeyCounts = 0;
  totalKeyPresses = 0;
  timerStartedAt = 0;
  assignedHours = 0;

  currentsession = "";
  todaysession = "";
  thisweeksession = "";
  projectname = "";
  task = "";

  updateToggleStatus(0, userId);
  userId = "";

  stopListening();
  store.delete("token");
  clearInterval(timerInterval);
  clearInterval(initialTimerInterval);

  source.token = axios.CancelToken.source().token;

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("logout-message", errorMessage);
  });

  win.loadURL(`http://localhost:${dbProperties.PORT}/login`);
}

// Start Timer Initially
function startTimerInitial() {
  initialTimerInterval = setInterval(() => {
    const now = new Date();
    const currentHour = now.getHours();

    initialCounter++;

    if (currentHour >= 12) {
      stopInitialTimer();
      console.log("Notifications to start the Tracker have been stopped.");
      return;
    }

    notifyStartTrackerIfNeeded();
  }, 1000);
}

function notifyStartTrackerIfNeeded() {
  if (initialCounter % 1800 === 0) {
    const seconds = initialCounter;
    const hours = seconds / 3600;
    const formattedHours =
      Math.floor(hours) === hours ? hours : hours.toFixed(1);

    const options = {
      title: `Hello '${userData.firstname}', Please start your Tracker, it's been ${formattedHours} hour passed!`,
      icon: imagePath,
      silent: false,
    };

    new Notification(options).show();
  }
}

function stopInitialTimer() {
  clearInterval(initialTimerInterval);
}

// Start Timer
function startTimer() {
  timerInterval = setInterval(() => {
    if (!isUserLoggedIn) {
      clearInterval(timerInterval);
      return;
    }

    counter++;
    timerEveryMinute++;

    if (timerEveryMinute % 300 === 0) {
      TotalClickCounts += totalClicks;
      TotalKeyCounts += totalKeyPresses;

      if (totalClicks < 50 && totalKeyPresses < 50) {
        counter -= 120;
      }

      totalClicks = 0;
      totalKeyPresses = 0;
    }

    if (counter % 600 === 0) {
      takeScreenshotIfNeeded();
      resetTimer();
    }
  }, 1000);
}

function takeScreenshotIfNeeded() {
  if (TotalClickCounts > 0 || TotalKeyCounts > 0) {
    takeScreenshot();
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  startTimer();
  TotalClickCounts = 0;
  TotalKeyCounts = 0;
}

// Global Event Listners // Keyboard , Mouse
function startListening() {
  if (!isListening) {
    ioHook.start();
    ioHook.on("mouseclick", handleMouseClick);
    ioHook.on("keydown", handleKeyDown);
    isListening = true;
  }
}

// Stop Global Event Listners // Keyboard , Mouse
function stopListening() {
  if (isListening) {
    resetCounts();
    ioHook.stop();
    ioHook.off("mouseclick", handleMouseClick);
    ioHook.off("keydown", handleKeyDown);
    isListening = false;
  }
}

// Reset counts for keyboard and mouse events
function resetCounts() {
  totalKeyPresses = 0;
  totalClicks = 0;
}

function handleMouseClick(event) {
  if (isListening) {
    totalClicks++;
    logClicksToDevTools();
  }
}

function handleKeyDown(event) {
  if (isListening) {
    totalKeyPresses++;
    logKeypressesToDevTools();
  }
}

function logClicksToDevTools() {
  const contents = win.webContents;
  contents.executeJavaScript(`
    console.log('Total Clicks:', ${totalClicks});
  `);
}

function logKeypressesToDevTools() {
  const contents = win.webContents;
  contents.executeJavaScript(`
    console.log('Total Key Presses:', ${totalKeyPresses});
  `);
}

// Go to Capture Screenshot & take all the events data
async function takeScreenshot() {
  const id = userId;
  counter = 0;
  timerEveryMinute = 0;

  await screenshot.captureScreenShot(
    id,
    projectname,
    task,
    TotalClickCounts,
    TotalKeyCounts,
    isnotificationallowed,
    currentsession,
    todaysession,
    thisweeksession,
    timerStartedAt,
    assignedHours
  );
}

function findAvailablePort(start, end, callback) {
  portfinder.getPort({ port: start, stopPort: end }, (err, port) => {
    if (err) {
      console.error("Error finding an available port:", err);
      process.exit(1);
    }
    callback(port);
  });
}

function startServer(port) {
  const dbURL = dbProperties.DB_URL;
  dbProperties.PORT = port;

  mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  mongoose.connection.on("connected", () => {
    console.log(`mongoose connected on port ${dbProperties.PORT}`);
  });

  expressApp.listen(port, () => {
    console.log(`Server listening on port ${dbProperties.PORT}`);
  });
}

function cleanupAndExit(signal) {
  console.log(`Received ${signal}. Cleaning up before exiting.`);
  process.exit(0);
}

findAvailablePort(dbProperties.START_PORT, dbProperties.END_PORT, startServer);

process.on("exit", () => {
  console.log("Exiting the application. Perform cleanup here.");
});

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
  process.on(signal, () => cleanupAndExit(signal));
});
