//Global selections and variables
const colorDivs = document.querySelectorAll(".color")

//Color Generator
function generateHexes() {
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

function randomColors() {
    colorDivs.forEach(colorDiv => {
        const randomColor = generateHexes()

        //Change the text and background to the randomColor generated by chroma
        colorDiv.children[0].innerText = randomColor
        colorDiv.style.backgroundColor = randomColor
    })
}

randomColors()