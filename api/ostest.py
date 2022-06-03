import os
from datetime import datetime

cwd = os.getcwd()
print(cwd)

if not os.path.exists(os.path.join(cwd, 'json-files')):
    os.makedirs(os.path.join(cwd, 'json-files'))
    os.chdir(os.path.join(cwd, 'json-files'))
    cwd = os.getcwd()
    print(cwd)

else:
    os.chdir(os.path.join(cwd, 'json-files'))
    cwd = os.getcwd()
    print(cwd)

if not os.path.exists(os.path.join(cwd, 'leaderboards')):
    os.makedirs(os.path.join(cwd, 'leaderboards'))
    os.chdir(os.path.join(cwd, 'leaderboards'))
    cwd = os.getcwd()
    print(cwd)

else:
    os.chdir(os.path.join(cwd, 'leaderboards'))
    cwd = os.getcwd()
    print(cwd)

if not os.path.exists(os.path.join(cwd, 'paddocks')):
    os.makedirs(os.path.join(cwd, 'paddocks'))
    os.chdir(os.path.join(cwd, 'paddocks'))
    cwd = os.getcwd()
    print(cwd)

else:
    os.chdir(os.path.join(cwd, 'paddocks'))
    cwd = os.getcwd()
    print(cwd)

if not os.path.exists(os.path.join(cwd, '1')):
    os.makedirs(os.path.join(cwd, '1'))
    os.chdir(os.path.join(cwd, '1'))
    cwd = os.getcwd()
    print(cwd)

else:
    os.chdir(os.path.join(cwd, '1'))
    cwd = os.getcwd()
    print(cwd)



