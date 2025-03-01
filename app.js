//Global selections and variables
const colorDivs = document.querySelectorAll(".color")
const generateBtn = document.querySelector(".generate")
const sliders = document.querySelectorAll('input[type="range"]')
const colorTexts = document.querySelectorAll(".color h2")
const copyContainerPopup = document.querySelector('.copy-container')
const adjustButtons = document.querySelectorAll('.adjust')
const lockButtons = document.querySelectorAll('.lock')
const closeAdjustments = document.querySelectorAll('.close-adjustment')
const sliderContainers = document.querySelectorAll('.sliders')

//Array to store the initial colors so that when user changes brightness, hue or saturation, it does not change to black/white
let initialColors

//Array to store the palette saved by the users
let savedPalettes = []

//EVENT LISTENERS
sliders.forEach(slider => {
    slider.addEventListener('input', hslControls)
})

//Update the color text when the div changes
colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateColorText(index)
    })
})

//Copy the color hex code when clicked
colorTexts.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex)
    })
})

//Close the popup when the transition ends
copyContainerPopup.addEventListener('transitionend', () => {
    const popupBox = copyContainerPopup.children[0]
    popupBox.classList.remove('active')
    copyContainerPopup.classList.remove('active')
})

adjustButtons.forEach((adjustButton, index) => {
    adjustButton.addEventListener('click', () => {
        openAdjustmentPanel(index)
    })
})

lockButtons.forEach((lockButton, index) => {
    lockButton.addEventListener('click', () => {
        toggleLock(index)
    })
})

closeAdjustments.forEach((closeAdjustment, index) => {
    closeAdjustment.addEventListener('click', () => {
        closeAdjustmentPanel(index)
    })
})

generateBtn.addEventListener('click', randomColors)

//Generate a random color when clicked on refresh
function generateHex() {
    // Using custom calculations to generate the hex value
    // const possibleValues = "0123456789ABCDEF"
    // let hexValue = "#"
    // for (let i = 0; i < 6; i++) {
    //     hexValue += possibleValues[Math.floor(Math.random()*16)]
    // }
    // return hexValue

    //Using chroma library to generate the hex value
    return chroma.random()
}

//Change the background of each sliders
function colorizeSliders(color, hueDiv, brightnessDiv, saturationDiv) {
    //Change Brightness
    const midBrightness = color.set('hsl.l', 0.5)
    const brightnessScale = chroma.scale(['black', midBrightness, 'white'])
    brightnessDiv.style.backgroundImage = `linear-gradient( to right, ${brightnessScale(0)}, ${brightnessScale(0.5)}, ${brightnessScale(1)})`

    //Change  Hue
    hueDiv.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204,204 ,75),rgb(75, 204, 75),rgb(75, 204, 204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`

    //Change Saturation
    const noSaturation = color.set('hsl.s', 0)
    const fullSaturation = color.set('hsl.s', 1)
    const saturationScale = chroma.scale([noSaturation, color, fullSaturation])
    saturationDiv.style.backgroundImage = `linear-gradient(to right, ${saturationScale(0)}, ${saturationScale(1)})`
}

//Called in the beginning to initialize the colors
function randomColors() {
    initialColors = []
    colorDivs.forEach(colorDiv => {
        const randomColor = generateHex()
        const hexText = colorDiv.children[0]

        if (colorDiv.classList.contains('locked')) {
            initialColors.push(hexText.innerText)
            return
        }
        initialColors.push(chroma(randomColor).hex())

        //Change the text and background to the randomColor generated by chroma
        hexText.innerText = randomColor
        colorDiv.style.backgroundColor = randomColor

        //Check the contrast of the hexText
        checkTextContrast(hexText, randomColor)

        //Initialise Colorize Sliders
        const sliders = colorDiv.querySelectorAll('.sliders input')
        const hue = sliders[0]
        const brightness = sliders[1]
        const saturation = sliders[2]
        colorizeSliders(chroma(randomColor), hue, brightness, saturation)

        initializeSliderDots(colorDiv)
    })

    //Reset the inputs
    resetInputs()

    //Check the contrast of adjust and lock icons
    adjustButtons.forEach((button, index) => {
        checkTextContrast(button, initialColors[index])
        checkTextContrast(lockButtons[index], initialColors[index])
    })
}

//Set the dots according to the color
function initializeSliderDots(colorDiv) {
    const sliders = colorDiv.querySelectorAll('.sliders input')
    sliders.forEach(slider => {
        const index = slider.getAttribute('data-hue') ||
            slider.getAttribute('data-sat') ||
            slider.getAttribute('data-bright')
        const color = initialColors[index]

        if (slider.name === 'hue') {
            const hue = chroma(color).get('hsl.h')
            slider.value = Math.floor(hue)
        } else if (slider.name === 'saturation') {
            const saturation = chroma(color).get('hsl.s')
            slider.value = Math.floor(saturation * 100) / 100
        } else if (slider.name === 'brightness') {
            const light = chroma(color).get('hsl.l')
            slider.value = Math.floor(light * 100) / 100
        }
    })
}

//Check the brightness of the element and change contrast accordingly
function checkTextContrast(element, color) {
    if (chroma(color).luminance() > 0.5) {
        element.style.color = 'black'
    } else {
        element.style.color = 'white'
    }
}

//HUE, SATURATION and BRIGHTNESS controls
function hslControls(event) {

    //Get the index based on the data-variable set in HTML
    const index = event.target.getAttribute('data-hue') ||
        event.target.getAttribute('data-bright') ||
        event.target.getAttribute('data-sat')

    const color = initialColors[index]
    const sliders = event.target.parentElement.querySelectorAll("input[type='range']")
    const hue = sliders[0]
    const brightness = sliders[1]
    const saturation = sliders[2]

    let newColor = chroma(color)
        .set('hsl.h', hue.value)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
    colorDivs[index].style.backgroundColor = newColor

    //Colorize the sliders
    colorizeSliders(newColor, hue, brightness, saturation)
}

//Update the color text
function updateColorText(index) {
    const currentDiv = colorDivs[index]
    const bgColor = chroma(currentDiv.style.backgroundColor)
    const icons = currentDiv.querySelectorAll('.controls button')
    const textHex = currentDiv.querySelector('h2')
    textHex.innerText = bgColor.hex()
    checkTextContrast(textHex, bgColor)
    for (icon of icons) {
        checkTextContrast(icon, bgColor)
    }
}

//Copy the color when user clicks on it
function copyToClipboard(hex) {

    //Create a temporary textarea and add the text to it
    const element = document.createElement('textarea')
    element.value = hex.innerText
    document.body.appendChild(element)
    element.select()

    //Copy the text and then remove the temporary textarea
    document.execCommand('copy')
    document.body.removeChild(element)

    //Popup animation
    const popupBox = copyContainerPopup.children[0]
    copyContainerPopup.classList.toggle('active')
    popupBox.classList.toggle('active')
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle('active')
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove('active')
}

function toggleLock(index) {
    colorDivs[index].classList.toggle('locked')
    lockButtons[index].children[0].classList.toggle('fa-lock-open')
    lockButtons[index].children[0].classList.toggle('fa-lock')
}

//Save to palette and local storage
const saveBtn = document.querySelector('.save')
const submitSave = document.querySelector('.submit-save')
const closeSave = document.querySelector('.close-save')
const saveContainer = document.querySelector('.save-container')
const saveInput = document.querySelector('.save-container input')
const libraryContainer = document.querySelector(".library-container")
const libraryBtn = document.querySelector(".library")
const closeLibraryBtn = document.querySelector(".close-library")

//Event listener
saveBtn.addEventListener('click', openPalette)
closeSave.addEventListener('click', closePalette)
submitSave.addEventListener('click', savePalette)
libraryBtn.addEventListener('click', openLibrary)
closeLibraryBtn.addEventListener('click', closeLibrary)

function openPalette() {
    const popup = saveContainer.children[0]
    saveContainer.classList.add('active')
    popup.classList.add('active')
}

function closePalette() {
    const popup = saveContainer.children[0]
    saveContainer.classList.remove('active')
    popup.classList.add('remove')
}

function savePalette() {
    closePalette()
    const name = saveInput.value
    const colors = []
    colorTexts.forEach(hex => {
        colors.push(hex.innerText)
    })

    //Create an object of the palette
    let paletteNr
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"))
    if (paletteObjects) {
        paletteNr = paletteObjects.length
    } else {
        paletteNr = savedPalettes.length
    }

    const paletteObject = {name, colors, nr: paletteNr}
    savedPalettes.push(paletteObject)

    //Store the palette to local storage
    saveToLocal(paletteObject)
    saveInput.value = ''

    //Generate the palette for Library
    generatePalette(paletteObject)
}

//Create a dynamic view for the saved palettes
function generatePalette(paletteObject) {
    const palette = document.createElement("div")
    palette.classList.add("custom-palette")
    const title = document.createElement("h4")
    title.innerText = paletteObject.name
    const preview = document.createElement("div")
    preview.classList.add("small-preview")
    paletteObject.colors.forEach(smallColor => {
        const smallDiv = document.createElement("div")
        smallDiv.style.backgroundColor = smallColor
        preview.appendChild(smallDiv)
    })

    const paletteBtn = document.createElement("button")
    paletteBtn.classList.add("pick-palette-btn")
    paletteBtn.classList.add(paletteObject.nr)
    paletteBtn.innerText = "Select"

    //Attach event to the button
    paletteBtn.addEventListener('click', e => {
        closeLibrary()
        const paletteIndex = e.target.classList[1]
        initialColors = []
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color)
            colorDivs[index].style.backgroundColor = color
            const text = colorDivs[index].children[0]
            checkTextContrast(text, color)
            updateColorText(index)
        })
        resetInputs()
    })

    //Append to library
    palette.appendChild(title)
    palette.appendChild(preview)
    palette.appendChild(paletteBtn)
    libraryContainer.children[0].appendChild(palette)
}

function openLibrary() {
    const popup = libraryContainer.children[0]
    libraryContainer.classList.add('active')
    popup.classList.add('active')
}

function closeLibrary() {
    const popup = libraryContainer.children[0]
    libraryContainer.classList.remove('active')
    // popup.classList.add('remove')
    popup.classList.remove('active')
}

function saveToLocal(paletteObject) {
    let localPalettes
    if (localStorage.getItem('palettes') === null)
        localPalettes = []
    else
        localPalettes = JSON.parse(localStorage.getItem('palettes'))

    localPalettes.push(paletteObject)
    localStorage.setItem('palettes', JSON.stringify(localPalettes))
}

function getLocal() {
    if (localStorage.getItem("palettes") === null) {
        localPalettes = []
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem("palettes"))
        savedPalettes = [...paletteObjects]
        paletteObjects.forEach(paletteObj => {
            //Generate the palette for Library
            generatePalette(paletteObj)
        })
    }
}

function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input")
    sliders.forEach(slider => {
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")]
            const hueValue = chroma(hueColor).hsl()[0]
            slider.value = Math.floor(hueValue)
        }
        if (slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute("data-bright")]
            const brightValue = chroma(brightColor).hsl()[2]
            slider.value = Math.floor(brightValue * 100) / 100
        }
        if (slider.name === "saturation") {
            const satColor = initialColors[slider.getAttribute("data-sat")]
            const satValue = chroma(satColor).hsl()[1]
            slider.value = Math.floor(satValue * 100) / 100
        }
    })
}

getLocal()
randomColors()