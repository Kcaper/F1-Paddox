import random
import os
import shutil
import smtplib, ssl

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

pickers_list = ["Calvin", "john", "Blair", "Jim", "Xana", "Kaley", "Ollie", "Carine"]

picked_list = ["Calvin", "john", "Blair", "Jim", "Xana", "Kaley", "Ollie", "Carine"]

email_dict = {
        "Calvin":"calvin@sebenza.taxi",
        "john":"john.papenfus@gmail.com",
        "Blair":"blairfras@gmail.com",
        "Jim":"jim@multispeed.co.za",
        "Xana":"zannabrownie@gmail.com",
        "Kaley":"kaleyparkinson123@gmail.com",
        "Ollie":"oliverparkinson52@gmail.com",
        "Carine":"cmlouisefraser@gmail.com",
    }

for i in range(len(pickers_list)):
    picked_gift_person = random.choice(picked_list)
    while picked_gift_person == pickers_list[i]:
        picked_gift_person = random.choice(picked_list)

    picked_list.remove(picked_gift_person)

    email = "john.papenfus@gmail.com" # the email where you sent the email
    password = "Yboks19952007e"
    send_to_email = email_dict[pickers_list[i]] # to whom
    subject = "SECRET SANTA 2021"
    message = "You are buying for " + picked_gift_person + " The budget is R1000"

    msg = MIMEMultipart()
    msg["From"] = email
    msg["To"] = send_to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(message, 'plain'))

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(email, password)
    text = msg.as_string()
    server.sendmail(email, send_to_email, text)
    server.quit()

    print("Email sent to " + email_dict[pickers_list[i]])

    




        