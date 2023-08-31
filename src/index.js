const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const settings = require("electron-settings");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const menuTemplate = [
    {
      label: "Language",
      submenu: [
        {
          label: "English",
          type: "radio",
          checked: settings.get("language") === "en",
          click: () => settings.set("language", "en"),
        },
        {
          label: "Português",
          type: "radio",
          checked: settings.get("language") === "pt",
          click: () => settings.set("language", "pt"),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.loadFile("index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
