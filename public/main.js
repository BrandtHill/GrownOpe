window.addEventListener("load", () => {
    let sendData = (form) => {
        var XHR = new XMLHttpRequest()

        XHR.addEventListener("load", (event) => {
            alert(event.target.responseText)
        })

        XHR.addEventListener("error", (event) => {
            alert("Something went awry!")
        })

        XHR.open("POST", "http://localhost/" + form.id.replace('Form', ''))

        XHR.send(new FormData(form))

        document.getElementById(form.id.replace('Form', '') + 'Button').remove()
        let buttonText = document.createElement("h3")
        buttonText.innerText = "Thanks for contacting us."
        form.appendChild(buttonText)
    }

    var contactForm = document.getElementById("contactForm")
    var voicemailForm = document.getElementById("voicemailForm")

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault()
        sendData(contactForm)
    })

    voicemailForm.addEventListener("submit", (event) => {
        event.preventDefault()
        sendData(voicemailForm)
    })
})

var enableButton = () => {
    console.log("You are not robot")
}