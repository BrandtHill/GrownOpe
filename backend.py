from flask import Flask, request, abort
import smtplib

app = Flask(__name__, static_folder='../public/', root_path='../')

EMAIL = 'example@example.com'
PASSWORD = 'examplepass'

@app.route('/contact', methods=['POST'])
def contact():
    message_format = 'From: {}\nTo: {}\nSubject: {}\n\n{}'
    message_body = 'Name: {}\nEmail: {}\n\nMessage: {}'.format(request.form.get('name'), request.form.get('email'), request.form.get('message'))
    message = message_format.format(EMAIL, EMAIL, 'Message from ' + request.form.get('name'), message_body)
    print(message)

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.sendmail(EMAIL, [EMAIL], message)
        server.close()
    except:
        print('Email not sent successfully')
    return 'Contact Made'


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)