const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require('fs');
const child = require('child_process');
const electron_store = require('electron-store');

const store = new electron_store();

/** @type {{[directory: string]: string[]}} */
const tracked = store.get('tracked-builds', {});

let hide = store.get("hide-on-run", false);

const createWindow = () => {
    const win = new BrowserWindow({
        height: 1000,
        width: 1000,
        webPreferences: {
            devTools: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    ipcMain.handle('get-builds', (event, buildDir) => {
        const builds = fs.readdirSync(path.join(buildDir));
        console.log(builds);
        return {builds, directory: path.join(buildDir)};
    })

    ipcMain.handle('get-tracked-builds', () => {
        const buildDirs = Object.keys(tracked);
        const builds = [];
        for (const dir of buildDirs) {
            builds.push(
                {
                    builds: tracked[dir],
                    directory: dir
                }
            )
        }
        console.log(builds);
        return builds;
    })

    ipcMain.on("hide-on-run", (event, hide_run) => {
        hide = hide_run;
        store.set('hide-on-run', hide_run);
    })

    ipcMain.on("run-build", (event, directory, build) => {
        const buildPath = path.join(directory, build);
        console.log(buildPath);
        const executable = fs.readdirSync(buildPath).find((v) => v.endsWith(".exe") && !v.startsWith("UnityCrashHandler"));
        console.log(executable);
        const exePath = path.join(buildPath, executable);
        console.log(exePath);
        const proc = child.execFile(exePath);
        if (hide) {
            win.hide();
            proc.on('close', () => win.show());
            proc.on('exit', () => win.show());
        }
    })

    ipcMain.on('track-build', (event, directory, build) => {
        console.log(`now tracking build ${build} in dir ${directory}`);
        if (tracked[directory] == null) {
            tracked[directory] = [];
        }
        tracked[directory].push(build);
        store.set('tracked-builds', tracked);
        console.log(store.get('tracked-builds'));
    })

    ipcMain.on('stop-tracking-build', (event, directory, build) => {
        console.log(`no longer tracking build ${build} in directory ${directory}`)
        if (tracked[directory].find((v) => v == build) !=  undefined) {
            tracked[directory] = tracked[directory].filter((v) => v != build);
        }
        if (tracked[directory].length == 0) {
            delete tracked[directory]
        }
        store.set('tracked-builds', tracked);
    })

    win.loadFile('src/html/homepage.html');
    win.center();
}

app.whenReady().then(() => createWindow());

app.on('window-all-closed', () => {
    if (process.platform !== "darwin")
        app.quit();
})