window.addEventListener("load", () => {

    var forms = document.getElementsByTagName('form')

    for (let f of forms) {
        f.addEventListener('submit', e => {
            e.preventDefault()
            grecaptcha.execute(recaps[f.id.replace('Form', '')])
            //sendData(f)
        })
    }

    //document.getElementById('audiofile').addEventListener('change', (e) => document.getElementById('player').srcObject = e.target.files[0])
})

var sendData = (form) => {
    var XHR = new XMLHttpRequest()
    let formName = form.id.replace('Form', '')

    XHR.addEventListener('load', (event) => {
        console.log(event.target.responseText)
    })

    XHR.addEventListener('error', (event) => {
        console.log("Something went awry!" + event.target.responseText)
    })

    XHR.open('POST', 'http://localhost/' + formName)

    XHR.send(new FormData(form))

    button = document.getElementById(formName + 'Button')
    button.innerText = 'Submitted'
    button.disabled = true
}

let recaps = {}

var onloadCallback = () => {
    recaps.contact = grecaptcha.render('contactRecap', {'callback': () => sendData(document.getElementById('contactForm'))}, true)
    recaps.voicemail = grecaptcha.render('voicemailRecap', {'callback': () => sendData(document.getElementById('voicemailForm'))}, true)
}