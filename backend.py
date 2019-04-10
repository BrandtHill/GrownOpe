from flask import Flask, request, abort
import smtplib
import json
import requests
import configparser

app = Flask(__name__, static_folder='../public/', root_path='../')
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 25

config = configparser.ConfigParser()
config.read('conf/backend.conf')
EMAIL = config['DEFAULT']['EMAIL']
PASSWORD = config['DEFAULT']['PASSWORD']
SECRET_KEY = config['DEFAULT']['SECRET_KEY']

@app.route('/contact', methods=['POST'])
def contact():
    print(request.form)
    ver_res = verify_recaptcha(request.form.get('g-recaptcha-response'), request.remote_addr)
    if (not ver_res['success']): return 'You are a robot. Contact not made.'
    
    message_format = 'From: {}\nTo: {}\nSubject: {}\n\n{}'
    message_body = 'Name: {}\nEmail: {}\n\nMessage: {}'.format(request.form.get('name'), request.form.get('email'), request.form.get('message'))
    message = message_format.format(EMAIL, EMAIL, 'Message from ' + request.form.get('name'), message_body)
    print(message)

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.ehlo()
        server.login(EMAIL, PASSWORD)
        server.sendmail(EMAIL, [EMAIL], message)
        server.close()
    except:
        print('Email not sent successfully')
    return 'Contact Made'

@app.route('/voicemail', methods=['POST'])
def voicemail_upload():
    print(request.files.get('audiofile'))
    ver_res = verify_recaptcha(request.form.get('g-recaptcha-response'), request.remote_addr)
    if (not ver_res['success']): return 'You are a robot. Contact not made.'
    return 'File sent'

def verify_recaptcha(response_token, ip_addr):
    return json.loads(requests.post('https://www.google.com/recaptcha/api/siteverify?secret={}&response={}&remoteip={}'.format(SECRET_KEY, response_token, ip_addr)).text)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)