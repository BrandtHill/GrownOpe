window.addEventListener("load", () => {
    let sendData = (form) => {
        var XHR = new XMLHttpRequest()
        let formName = form.id.replace('Form', '')

        XHR.addEventListener("load", (event) => {
            console.log(event.target.responseText)
        })

        XHR.addEventListener("error", (event) => {
            console.log("Something went awry!" + event.target.responseText)
        })

        XHR.open("POST", "http://localhost/" + formName)

        XHR.send(new FormData(form))

        button = document.getElementById(formName + 'Button')
        button.innerText = 'Submitted'
        button.disabled = true
    }

    var forms = document.getElementsByTagName('form')

    for (let f of forms) {
        f.addEventListener('submit', e => {
            e.preventDefault()
            sendData(f)
        })
    }

    document.getElementById('audiofile').addEventListener('change', (e) => document.getElementById('player').srcObject = e.target.files[0])
})

var onloadCallback = () => {
    contactRecap = grecaptcha.render('contactRecap', {'callback': () => document.getElementById('contactForm').dispatchEvent(new Event('submit'))}, true)
    voicemailRecap = grecaptcha.render('voicemailRecap', {'callback': () => document.getElementById('voicemailForm').dispatchEvent(new Event('submit'))}, true)
}