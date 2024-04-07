async function RenderBuilds(directory) {
    const builds = await window.ipc.getBuilds(directory);
    const buildDiv = document.getElementById("buildList");
    if (buildDiv) {
        for (const build of builds.builds) {
            window.ipc.trackBuild(builds.directory, build);
            const element = document.createElement("section");
            element.setAttribute('id', `${builds.directory} ${build}`);
            element.setAttribute("class", "homepage-section");
            const text = document.createElement("h2");
            text.textContent = build;
            const buildPath = document.createElement("p");
            buildPath.textContent = `Location: ${builds.directory}`;
            const button = document.createElement("button");
            button.setAttribute("class", "homepage-button");
            button.textContent = "Run build";
            const remove = document.createElement("button");
            remove.setAttribute('class', 'homepage-button');
            remove.textContent = "Stop tracking build";
            element.appendChild(text);
            element.appendChild(buildPath);
            element.appendChild(button);
            element.appendChild(remove);
            buildDiv.appendChild(element);
            button.onclick = () => handleRunRequest(builds.directory, build);
            remove.onclick = () => stopTrackingBuild(builds.directory, build, element);
        }
    }
}

async function RenderTrackedBuilds() {
    const tracked = await window.ipc.getTrackedBuilds();
    const buildDiv = document.getElementById("buildList");
    if (buildDiv) {
        for (const builds of tracked) {
            for (const build of builds.builds) {
                const element = document.createElement("section");
                element.setAttribute('id', `${builds.directory} ${build}`);
                element.setAttribute("class", "homepage-section");
                const text = document.createElement("h2");
                text.textContent = build;
                const buildPath = document.createElement("p");
                buildPath.textContent = `Location: ${builds.directory}`;
                const button = document.createElement("button");
                button.setAttribute("class", "homepage-button");
                button.textContent = "Run build";
                const remove = document.createElement("button");
                remove.setAttribute('class', 'homepage-button');
                remove.textContent = "Stop tracking build";
                element.appendChild(text);
                element.appendChild(buildPath);
                element.appendChild(button);
                element.appendChild(remove);
                buildDiv.appendChild(element);
                button.onclick = () => handleRunRequest(builds.directory, build);
                remove.onclick = () => stopTrackingBuild(builds.directory, build, element);
            }
        }
    }
}

async function RefreshBuildContainers() {
    const tracked = await window.ipc.getTrackedBuilds();
    for (const trackedBuild of tracked) {
        for (const build of trackedBuild.builds) {
            const element = document.getElementById(`${trackedBuild.directory} ${build}`);
            stopTrackingBuild(trackedBuild.directory, build, element);
        }
    }
    for (const trackedBuild of tracked) {
        RenderBuilds(trackedBuild.directory);
    }
}

RenderTrackedBuilds();

function handleRunRequest(directory, build) {
    window.ipc.runBuild(directory, build);
}

function stopTrackingBuild(directory, build, element) {
    window.ipc.stopTrackingBuild(directory, build);
    element.parentNode.removeChild(element);
}