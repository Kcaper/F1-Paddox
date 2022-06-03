from time import *
import threading
from datetime import datetime
from datetime import timedelta

def manualResultTimer():

    timer = 15

    for x in range(15):
        timer = timer - 1
        sleep(1)

    print("TIME IS UP")

#countdown_thread = threading.Thread(target=manualResultTimer)
#countdown_thread.start()

