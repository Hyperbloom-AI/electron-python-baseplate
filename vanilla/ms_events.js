// Mouse Events in Vanilla
console.log("Listening for mouse events...");

// Element List
const settingsButton = document.getElementById("settingsOpener");
const closeSettingsButton = document.getElementById("settingsCloser");
const settingsIcon = document.getElementById("settingsSvg");
const settingsContent = document.getElementById("innerSettings");
const fileInput = document.getElementById("input");
const fileName = document.getElementById("inputText");
const submitButton = document.getElementById("submitButton");
const rfw = document.getElementById("rfw")

// File tracking
var currentFile = null

closeSettingsButton.addEventListener('click', closeSettings);
settingsButton.addEventListener('click', openSettings);
fileInput.addEventListener('change', updateFileName);

function openSettings() {
    settingsButton.style.width = "260px";
    settingsButton.style.height = "160px";
    settingsIcon.style.opacity = 0;
    settingsButton.style.cursor = "default";
    closeSettingsButton.style.display = "flex";
    settingsContent.style.display = "block"
    settingsButton.style.alignItems = "flex-start"
}

function closeSettings(e) {
    e.stopPropagation()

    settingsButton.style.width = "75px";
    settingsButton.style.height = "44px";
    settingsIcon.style.opacity = 1;
    settingsButton.style.cursor = "pointer"
    closeSettingsButton.style.display = "none";
    settingsContent.style.display = "none"
}

function updateFileName() {
    if(fileInput.value.length > 1) {
        fileName.innerHTML = fileInput.value
        currentFile = fileInput.value
    }
}

function clearFile() {
    fileInput.value = ""
    fileName.innerHTML = "Click to Select File"
    currentFile = null
}

const sendToPython = async(input) => {

    /* 
        JSON File loading here is temporary
    */

    //const config = 'C:\\Users\\Charles McNamara\\OneDrive\\Documents\\Work\\electron-poc\\config\\default.config.json'
    let url = ""
    const data = await fetch('./config/default.config.json').then(response => {
        url = response.url;
    });

    console.log(url.toString())
    const config_url = url.toString().replace(/%20/g, ' ').replace('file:///', '').replaceAll('/', '\\')

    var result = await window.python.sendCalculation(input, config_url)
    console.log(result)
    console.log(JSON.parse(result))
    return result
}
    
submitButton.addEventListener('click', async() => {
    var filePath = fileInput.files[0].path
    const res = await sendToPython(filePath);

    if(document.getElementById("fowra")) {
        document.getElementById("fowra").remove();
    }

    const fileElementWrapper = document.createElement('div')
    fileElementWrapper.classList.add('file_output__wrapper')
    fileElementWrapper.setAttribute('id', 'fowra')
    
    const newFile = JSON.parse(res).file
    const statusCode = JSON.parse(res).statusCode
    const statusText = JSON.parse(res).statusText

    if(newFile) {
        console.log("File Exists")

        const fileDraggable = document.createElement('div')
        fileDraggable.classList.add('draggable-file')
        fileDraggable.setAttribute('id', 'drag')
        fileDraggable.setAttribute('draggable', true)

        fileElementWrapper.appendChild(fileDraggable)

        fileDraggable.ondragstart = (event) => {
            event.preventDefault()
            window.electron.startDrag(newFile)
        }
    
        fileDraggable.innerHTML = newFile
    } else {
        console.log("File does not exist due to a python error")
    }
    const stElement = document.createElement('p')
    const scElement = document.createElement('p')
    const scc = document.createElement('span')
    scElement.innerHTML = "Response Code: " + (statusCode == 200 ? '<span class="status-code success">' : '<span class="status-code failure">') + statusCode + "</span>"
    stElement.innerHTML = "Response Text: " + statusText
    fileElementWrapper.appendChild(scElement)
    fileElementWrapper.appendChild(stElement)

    rfw.appendChild(fileElementWrapper)
});
