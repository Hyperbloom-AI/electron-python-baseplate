let matched = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (matched) {
    document.getElementById('themeDark').classList.add('more-menu__link--active')
} else {
    document.getElementById('themeLight').classList.add('more-menu__link--active')
}

document.getElementById('themeDark').addEventListener('click', async () => {
    await window.darkMode.toggleDarkMode()
    document.getElementById('themeDark').classList.add('more-menu__link--active')
    document.getElementById('themeLight').classList.remove('more-menu__link--active')
})

document.getElementById('themeLight').addEventListener('click', async () => {
    await window.darkMode.toggleLightMode()
    document.getElementById('themeLight').classList.add('more-menu__link--active')
    document.getElementById('themeDark').classList.remove('more-menu__link--active')
})


document.getElementById('drag').ondragstart = (event) => {
    event.preventDefault()
    window.electron.startDrag('drag-and-drop.md')
}