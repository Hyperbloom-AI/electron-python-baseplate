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
        console.log(fileInput.value)
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
    var result = await window.python.sendCalculation(input)
    console.log(result)
  }
    
submitButton.addEventListener('click', () => {
    sendToPython(fileInput.value);
});