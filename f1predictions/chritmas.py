import random

pickers_list = ["Calvin", "john", "Blair", "Jim", "Xana", "Kaley", "Ollie", "Carine"]

picked_list = ["Calvin", "john", "Blair", "Jim", "Xana", "Kaley", "Ollie", "Carine"]

secret_santa_objext = []

for i in range(len(pickers_list)):
    picked_gift_person = random.choice(picked_list)
    if picked_gift_person == pickers_list[[i]]:
        while picked_gift_person == pickers_list[[i]]:
            picked_gift_person = random.choice(picked_list)

    secret_santa_objext.append(str(pickers_list[i]):str(picked_gift_person))
    picked_list.remove(picked_gift_person)

print(secret_santa_objext)
        
