const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipc', {
    getBuilds: (buildDir) => ipcRenderer.invoke('get-builds', buildDir),
    runBuild: (directory, build) => ipcRenderer.send("run-build", directory, build),
    stopTrackingBuild: (directory, build) => ipcRenderer.send("stop-tracking-build", directory, build),
    getTrackedBuilds: () => ipcRenderer.invoke("get-tracked-builds"),
    trackBuild: (directory, build) => ipcRenderer.send('track-build', directory, build)
})