import random
import math
import time

bank = 32000
multiplier = 1.05
min_bet = 2
wheel_numbers = []
bet_amount_list = [min_bet, min_bet]
money_to_recoupe = 0
previous_bet = 0
wallet = 0
gamblings = 1600

small_number_misses = 0
medium_number_misses = 0
large_number_misses = 0
odd_misses = 0
even_misses = 0
col_1_misses = 0
col_2_misses = 0
col_3_misses = 0
zero_hits = 0

bet_strat = "Fibonacci"

game_number = 0
logins = 0
pocket = 0
bet_index = 0

wallet = gamblings

if bet_strat == "Papenfus":
    while sum(bet_amount_list) < gamblings:
        money_to_recoupe = sum(bet_amount_list)
        bet = math.ceil((money_to_recoupe + min_bet)/2)
        if sum(bet_amount_list) + bet > wallet:
            break
        else:
            bet_amount_list.append(bet)

elif bet_strat == "Fibonacci":
    fib_bet_index = 2
    while sum(bet_amount_list) < gamblings:
        next_bet = bet_amount_list[fib_bet_index - 1] + bet_amount_list[fib_bet_index - 2]
        bet_amount_list.append(next_bet)
        fib_bet_index = fib_bet_index + 1

for number in range(0,37,1):
    wheel_numbers.append(number)

odd = True
odd_numbers = []
even_numbers = []
for number in range(1,37,1):
    if number == 0:
        pass
    elif odd == True:
        odd_numbers.append(number)
        odd = False
    elif odd == False:
        even_numbers.append(number)
        odd = True
    
small_numbers = []
for number in range(1,13,1):
    small_numbers.append(number)

medium_numbers = []
for number in range(13,25,1):
    medium_numbers.append(number)

large_numbers = []
for number in range(25,37,1):
    large_numbers.append(number)

column_1 = []
start_number = 1
for i in range(1,13,1):
    number = start_number
    column_1.append(number)
    start_number = start_number + 3

column_2 = []
start_number = 2
for i in range(1,13,1):
    number = start_number
    column_1.append(number)
    start_number = start_number + 3

column_3 = []
start_number = 3
for i in range(1,13,1):
    number = start_number
    column_1.append(number)
    start_number = start_number + 3

def run_game():
    global winning_number
    global small_number_misses
    global medium_number_misses
    global large_number_misses
    global odd_misses
    global even_misses
    global col_1_misses
    global col_2_misses
    global col_3_misses
    global game_number

    winning_number = random.choice(list(wheel_numbers))
    if winning_number in odd_numbers:
        even_misses = even_misses + 1
    elif winning_number in even_numbers:
        odd_misses = odd_misses + 1

    if winning_number in small_numbers:
        medium_number_misses = medium_number_misses + 1
        large_number_misses = large_number_misses + 1
    elif winning_number in medium_numbers:
        small_number_misses = small_number_misses + 1
        large_number_misses = large_number_misses + 1
    elif winning_number in large_numbers:
        small_number_misses = small_number_misses + 1
        medium_number_misses = medium_number_misses + 1

    if winning_number in column_1:
        col_2_misses = col_2_misses + 1
        col_3_misses = col_3_misses + 1
    elif winning_number in column_2:
        col_1_misses = col_1_misses + 1
        col_3_misses = col_3_misses + 1
    elif winning_number in column_3:
        col_1_misses = col_1_misses + 1
        col_2_misses = col_2_misses + 1

    game_number = game_number + 1

    return winning_number, small_number_misses, medium_number_misses,
     large_number_misses, game_number, odd_misses, even_misses, col_1_misses, col_2_misses,
     col_3_misses

def place_holding_bet():
    global wallet
    wallet = wallet - min_bet - min_bet - min_bet
    run_game()
    if winning_number != 0:
        wallet = wallet + min_bet + min_bet
    else:
        wallet = wallet + min_bet*36
    return wallet

def run_bet_system(box, bet_amount_list, sessions, system, odd_even, bet_ind):
    global wallet
    global small_number_misses
    global medium_number_misses
    global large_number_misses
    global even_misses
    global odd_misses
    global bank
    global pocket
    global logins
    global bet_index

    if bet_strat == "Fibonacci":
        try:
            bet_index = bet_ind
            if bet_index > 0:
                if bet_index < 2:
                    bet_index = 0
                else:
                    bet_index = bet_index - 2
            elif bet_index < 0:
                bet_index = 0

            if odd_even == "odd":
                while wallet > 0:
                    wallet = wallet - bet_amount_list[bet_index]
                    run_game()
                    if winning_number in odd_numbers:
                        #print("odd bet index: " + str(bet_index))
                        #print("GAME NUMBER:" + str(game_number))
                        #print(winning_number)
                        #print("betting on the ODD numbers with: " + str(bet_amount_list[bet_index]))
                        #print("wallet before bet = " + str(wallet))
                        time.sleep(0.1)
                        wallet = wallet + (bet_amount_list[bet_index] * 2)
                        #print("wallet after bet = " + str(wallet))
                        #print(bet_amount_list)
                        odd_misses = 0
                        return wallet, odd_misses, bet_index
                    else: 
                        bet_index = bet_index + 1
                print("Ran out of money")
                return wallet, logins, odd_misses, even_misses

            elif odd_even == "even":
                while wallet > 0:
                    wallet = wallet - bet_amount_list[bet_index]
                    run_game()
                    if winning_number in even_numbers:
                        #print("even bet index: " + str(bet_index))
                        #print(bet_index)
                        #print("GAME NUMBER:" + str(game_number))
                        #print(winning_number)
                        #print("betting on the EVEN numbers with: " + str(bet_amount_list[bet_index]))
                        #print("wallet before bet = " + str(wallet))
                        #time.sleep(0.1)
                        wallet = wallet + (bet_amount_list[bet_index] * 2)
                        #print("wallet after bet = " + str(wallet))
                        even_misses = 0
                        return wallet, even_misses, bet_index
                    else: 
                        bet_index = bet_index + 1
                print("Ran out of money")
                return wallet, logins, odd_misses, even_misses

        except:
            print("took a knock but took home: " + str(wallet))
            time.sleep(1)
            bank = bank + wallet
            wallet = gamblings
            bank = bank - gamblings
            logins = sessions + 1
            return wallet, logins, odd_misses, even_misses

    elif bet_strat == "Papenfus":
        bet_index = 0
        try:
            if box == "small":
                while wallet > 0:
                    #print("GAME NUMBER:" + str(game_number))
                    #print(winning_number)
                    #print("betting on the SMALL numbers with: " + str(bet_amount_list[bet_index]))
                    #print("wallet before bet = " + str(wallet))
                    #time.sleep(1)
                    wallet = wallet - bet_amount_list[bet_index]
                    #print("wallet AFTER bet = " + str(wallet))
                    run_game()
                    if winning_number in small_numbers:
                        wallet = wallet + bet_amount_list[bet_index] * 3
                        small_number_misses = 0
                        return small_number_misses, medium_number_misses, large_number_misses, wallet
                    else:
                        bet_index = bet_index + 1

            elif box == "medium":
                while wallet > 0:
                    #print("GAME NUMBER:" + str(game_number))
                    #print(winning_number)
                    #print("betting on the MEDIUM numbers with: " + str(bet_amount_list[bet_index]))
                    #print("wallet before bet = " + str(wallet))
                    #time.sleep(1)
                    wallet = wallet - bet_amount_list[bet_index]
                    #print("wallet AFTER bet = " + str(wallet))
                    run_game()
                    if winning_number in medium_numbers:
                        wallet = wallet + bet_amount_list[bet_index] * 3
                        medium_number_misses = 0
                        return small_number_misses, medium_number_misses, large_number_misses, wallet, logins
                    else:
                        bet_index = bet_index + 1

            elif box == "large":
                while wallet > 0:
                    #print("GAME NUMBER:" + str(game_number))
                    #print(winning_number)
                    #print("betting on the LARGE numbers with: " + str(bet_amount_list[bet_index]))
                    #print("wallet before bet = " + str(wallet))
                    #time.sleep(1)
                    wallet = wallet - bet_amount_list[bet_index]
                    #print("wallet AFTER bet = " + str(wallet))
                    run_game()
                    if winning_number in large_numbers:
                        wallet = wallet + bet_amount_list[bet_index] * 3
                        large_number_misses = 0
                        return small_number_misses, medium_number_misses, large_number_misses, wallet
                    else:
                        bet_index = bet_index + 1

        except:
            print("took a knock but took home: " + str(wallet))
            bank = bank + wallet
            wallet = gamblings
            bank = bank - gamblings
            logins = sessions + 1
            return wallet, small_number_misses, medium_number_misses, large_number_misses

    elif bet_strat == "Columns":
        bet_index = 0
        try:
            if box == "Column1":
                while wallet > 0:
                    #print("GAME NUMBER:" + str(game_number))
                    #print(winning_number)
                    #print("betting on the SMALL numbers with: " + str(bet_amount_list[bet_index]))
                    #print("wallet before bet = " + str(wallet))
                    #time.sleep(1)
                    wallet = wallet - bet_amount_list[bet_index]
                    #print("wallet AFTER bet = " + str(wallet))
                    run_game()
                    if winning_number in column_1:
                        wallet = wallet + bet_amount_list[bet_index] * 3
                        col_1_misses = 0
                        return small_number_misses, medium_number_misses, large_number_misses, wallet
                    else:
                        bet_index = bet_index + 1

            elif box == "Column2":
                while wallet > 0:
                    #print("GAME NUMBER:" + str(game_number))
                    #print(winning_number)
                    #print("betting on the MEDIUM numbers with: " + str(bet_amount_list[bet_index]))
                    #print("wallet before bet = " + str(wallet))
                    #time.sleep(1)
                    wallet = wallet - bet_amount_list[bet_index]
                    #print("wallet AFTER bet = " + str(wallet))
                    run_game()
                    if winning_number in medium_numbers:
                        wallet = wallet + bet_amount_list[bet_index] * 3
                        medium_number_misses = 0
                        return small_number_misses, medium_number_misses, large_number_misses, wallet, logins
                    else:
                        bet_index = bet_index + 1

            elif box == "Column3":
                while wallet > 0:
                    #print("GAME NUMBER:" + str(game_number))
                    #print(winning_number)
                    #print("betting on the LARGE numbers with: " + str(bet_amount_list[bet_index]))
                    #print("wallet before bet = " + str(wallet))
                    #time.sleep(1)
                    wallet = wallet - bet_amount_list[bet_index]
                    #print("wallet AFTER bet = " + str(wallet))
                    run_game()
                    if winning_number in large_numbers:
                        wallet = wallet + bet_amount_list[bet_index] * 3
                        large_number_misses = 0
                        return small_number_misses, medium_number_misses, large_number_misses, wallet
                    else:
                        bet_index = bet_index + 1

        except:
            print("took a knock but took home: " + str(wallet))
            bank = bank + wallet
            wallet = gamblings
            bank = bank - gamblings
            logins = sessions + 1
            return wallet, small_number_misses, medium_number_misses, large_number_misses


    return wallet, small_number_misses, medium_number_misses, large_number_misses, logins

while bank > 0:
    while wallet < (multiplier * gamblings):
        if wallet < 1:
            break
        if bet_strat == "Fibonacci":
            if odd_misses > 0:
                run_bet_system("N/A",bet_amount_list, logins, "Fibonacci", "odd", bet_index)
            elif even_misses > 0:
                run_bet_system("N/A",bet_amount_list, logins, "Fibonacci", "even", bet_index)
            else:
                place_holding_bet()

        elif bet_strat == "Papenfus":
            if small_number_misses > 6:
                run_bet_system("small", bet_amount_list, logins, "Papenfus", "N/A", 0)

            elif medium_number_misses > 6:
                run_bet_system("medium", bet_amount_list, logins, "Papenfus", "N/A", 0)

            elif large_number_misses > 6:
                run_bet_system("large", bet_amount_list, logins, "Papenfus", "N/A", 0)

            else:
                place_holding_bet()

        elif bet_strat == "Columns":
            if col_1_misses > 6:
                run_bet_system("Columns1", bet_amount_list, logins, "Columns", "N/A", 0)

            elif col_2_misses > 6:
                run_bet_system("Columns2", bet_amount_list, logins, "Columns", "N/A", 0)

            elif col_3_misses > 6:
                run_bet_system("Columns3", bet_amount_list, logins, "Columns", "N/A", 0)

            else:
                place_holding_bet()

    if wallet > (gamblings*multiplier) - 1:
        print("we won: " + str(wallet - gamblings))
        print("After " + str(game_number) + "games, at 5 games a minute this would take " + str(game_number/6/60) + " hours")
        game_number = 0
        print("the bank is " + str(bank))
        bet_index = 0
    else:
        print("")
        print("WE LOST")
        print("")
        bet_index = 0
    bank = bank + wallet
    logins = logins + 1
    wallet = gamblings
    bank = bank - gamblings
    #print("bank " + str(bank))

print(wallet)
print("we played: " + str(game_number) + " games. at 5 games a minute, this would take: " + str(game_number/5/60) + "hours")
print(bank)
print("Logins " + str(logins))
print("pocket: " + str(pocket))
print(bet_amount_list)


    







