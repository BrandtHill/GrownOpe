window.addEventListener("load", () => {

    let sendData = () => {
        var XHR = new XMLHttpRequest()

        XHR.addEventListener("load", (event) => {
            alert(event.target.responseText)
        })

        XHR.addEventListener("error", (event) => {
            alert("Something went awry!")
        })

        XHR.open("POST", "http://localhost/contact")

        XHR.send(new FormData(form))
    }

    var form = document.getElementById("contactForm")

    form.addEventListener("submit", (event) => {
        event.preventDefault()
        sendData()
    })
})