import random

shoe_dict = {"1HA" :11, "1H2" : 2, "1H3" : 3, "1H4" : 4, "1H5" : 5, "1H6" : 6, "1H7" : 7, "1H8" : 8, "1H9" : 9, 
    "1H10":10, "1HJ":10, "1HQ":10, "1HK":10, 
    "1DA":11, "1D2":2, "1D3":3, "1D4":4, "1D5":5, "1D6":6, "1D7":7, "1D8":8, "1D9":9, 
    "1D10":10, "1DJ":10, "1DQ":10, "1DK":10,
    "1SA":11, "1S2":2, "1S3":3, "1S4":4, "1S5":5, "1S6":6, "1S7":7, "1S8":8, "1S9":9, 
    "1S10":10, "1SJ":10, "1SQ":10, "1SK":10,
    "1CA":11, "1C2":2, "1C3":3, "1C4":4, "1C5":5, "1C6":6, "1C7":7, "1C8":8, "1C9":9, 
    "1C10":10, "1CJ":10, "1CQ":10, "1CK":10,
    "2HA":11, "2H2":2, "2H3":3, "2H4":4, "2H5":5, "2H6":6, "2H7":7, "2H8":8, "2H9":9, 
    "2H10":10, "2HJ":10, "2HQ":10, "2HK":10, 
    "2DA":11, "2D2":2, "2D3":3, "2D4":4, "2D5":5, "2D6":6, "2D7":7, "2D8":8, "2D9":9, 
    "2D10":10, "2DJ":10, "2DQ":10, "2DK":10,
    "2SA":11, "2S2":2, "2S3":3, "2S4":4, "2S5":5, "2S6":6, "2S7":7, "2S8":8, "2S9":9, 
    "2S10":10, "2SJ":10, "2SQ":10, "2SK":10,
    "2CA":11, "2C2":2, "2C3":3, "2C4":4, "2C5":5, "2C6":6, "2C7":7, "2C8":8, "2C9":9, 
    "2C10":10, "2CJ":10, "2CQ":10, "2CK":10,
    "ZHA":11, "ZH2":2, "ZH3":3, "ZH4":4, "ZH5":5, "ZH6":6, "ZH7":7, "ZH8":8, "ZH9":9, 
    "ZH10":10, "ZHJ":10, "ZHQ":10, "ZHK":10, 
    "ZDA":11, "ZD2":2, "ZD3":3, "ZD4":4, "ZD5":5, "ZD6":6, "ZD7":7, "ZD8":8, "ZD9":9, 
    "ZD10":10, "ZDJ":10, "ZDQ":10, "ZDK":10,
    "ZSA":11, "ZS2":2, "ZS3":3, "ZS4":4, "ZS5":5, "ZS6":6, "ZS7":7, "ZS8":8, "ZS9":9, 
    "ZS10":10, "ZSJ":10, "ZSQ":10, "ZSK":10,
    "ZCA":11, "ZC2":2, "ZC3":3, "ZC4":4, "ZC5":5, "ZC6":6, "ZC7":7, "ZC8":8, "ZC9":9, 
    "ZC10":10, "ZCJ":10, "ZCQ":10, "ZCK":10,
    "YHA":11, "YH2":2, "YH3":3, "YH4":4, "YH5":5, "YH6":6, "YH7":7, "YH8":8, "YH9":9, 
    "YH10":10, "YHJ":10, "YHQ":10, "YHK":10, 
    "YDA":11, "YD2":2, "YD3":3, "YD4":4, "YD5":5, "YD6":6, "YD7":7, "YD8":8, "YD9":9, 
    "YD10":10, "YDJ":10, "YDQ":10, "YDK":10,
    "YSA":11, "YS2":2, "YS3":3, "YS4":4, "YS5":5, "YS6":6, "YS7":7, "YS8":8, "YS9":9, 
    "YS10":10, "YSJ":10, "YSQ":10, "YSK":10,
    "YCA":11, "YC2":2, "YC3":3, "YC4":4, "YC5":5, "YC6":6, "YC7":7, "YC8":8, "YC9":9, 
    "YC10":10, "YCJ":10, "YCQ":10, "YCK":10,
    "XHA":11, "XH2":2, "XH3":3, "XH4":4, "XH5":5, "XH6":6, "XH7":7, "XH8":8, "XH9":9, 
    "XH10":10, "XHJ":10, "XHQ":10, "XHK":10, 
    "XDA":11, "XD2":2, "XD3":3, "XD4":4, "XD5":5, "XD6":6, "XD7":7, "XD8":8, "XD9":9, 
    "XD10":10, "XDJ":10, "XDQ":10, "XDK":10,
    "XSA":11, "XS2":2, "XS3":3, "XS4":4, "XS5":5, "XS6":6, "XS7":7, "XS8":8, "XS9":9, 
    "XS10":10, "XSJ":10, "XSQ":10, "XSK":10,
    "XCA":11, "XC2":2, "XC3":3, "XC4":4, "XC5":5, "XC6":6, "XC7":7, "XC8":8, "XC9":9, 
    "XC10":10, "XCJ":10, "XCQ":10, "XCK":10,
    "WHA":11, "WH2":2, "WH3":3, "WH4":4, "WH5":5, "WH6":6, "WH7":7, "WH8":8, "WH9":9, 
    "WH10":10, "WHJ":10, "WHQ":10, "WHK":10, 
    "WDA":11, "WD2":2, "WD3":3, "WD4":4, "WD5":5, "WD6":6, "WD7":7, "WD8":8, "WD9":9, 
    "WD10":10, "WDJ":10, "WDQ":10, "WDK":10,
    "WSA":11, "WS2":2, "WS3":3, "WS4":4, "WS5":5, "WS6":6, "WS7":7, "WS8":8, "WS9":9, 
    "WS10":10, "WSJ":10, "WSQ":10, "WSK":10,
    "WCA":11, "WC2":2, "WC3":3, "WC4":4, "WC5":5, "WC6":6, "WC7":7, "WC8":8, "WC9":9, 
    "WC10":10, "WCJ":10, "WCQ":10, "WCK":10}

discard_dict = {}

player_hands = 1
dealer_on_ace = False
loosing_streak = 0
global dealer_ace_count
global player_ace_count
player_ace_count = 0
dealer_ace_count = 0
new_shoe = True
dealer_win = False
player_win = False
starting_bet = 2
global bet
bet = 2
global bank
bank = 1000
player_stay_limit = 15
game_no = 0
dealer_has_ace = False
player_has_ace = False
player_has_double_ace = False
player_count = 0
dealer_count = 0
dealer_stay_limit = 17

def shuffle():
    global shoe_size
    global r
    shoe_size = 6*52
    r = shoe_dict
    r.update(discard_dict)
    return r, shoe_size

def remove_card(draw):
    del r[draw]
    return r

def get_card():
    global card
    global discard_dict
    global draw
    draw = random.choice(list(r))
    card = r[draw]
    discard_dict[draw] = card
    remove_card(draw)
    return card, r, discard_dict

def split(card_value, dc):
    global player_count
    global double_card
    global player_ace_count
    global split_dict
    global pc_dict
    global bet
    global player_win
    global push
    global hand_no

    try:
        if len(pc_dict) > 0:
            pass
        else:
            hand_no = 0
            pc_dict = {}
    except:
        hand_no = 0
        pc_dict = {}

    try:
        if len(split_dict) > 0:
            pass
        else:
            split_dict = {}
    except:
        split_dict = {}

    print("splitting!!!")
    print(card_value)
    double_card = False
    split_dict[hand_no] = card_value
    split_dict[hand_no] = card_value
    for i in split_dict:
        hand_no = hand_no + 1
        if i == 1:
            player_ace_count = 1
        else:
            player_ace_count = 0
        get_card()
        player_count = i + card
        if card == 1:
            player_ace_count = player_ace_count + 1
        run_game(player_count, dc)
        pc_dict[hand_no] = player_count
    
    run_dealer(dc)
    for i in pc_dict:
        player_count = i
        end_game()
    
    print("BET: " + str(bet))
    if len(shoe_dict) < 110:
        shuffle()
    if player_win == False:
        bet = bet * 2
    if push == True:
        bet = bet
        push = False
    if player_win == True:
        bet = starting_bet
        player_win = False
    print(pc_dict)
    print(split_dict)    
    return bet

def start_game():
    global shoe_size
    global player_count
    global dealer_count
    global dealer_aces
    global player_aces
    global dealer_on_ace
    global player_ace_count
    global dealer_ace_count
    global player_blackjack
    global dealer_blackjack
    global double_cards

    player_blackjack = False
    dealer_blackjack = False
    dealer_ace_count = 0
    player_ace_count = 0
    player_count = 0
    dealer_count = 0
    player_has_ace=False
    dealer_has_ace=False
    player_has_double_ace=False

    get_card()
    card1 = card
    if card == 1:
        player_ace_count = 1
        player_count = 11
    else: player_count = card
    
    get_card()
    if card == 1:
        dealer_on_ace = True
        dealer_ace_count = 1
        dealer_count = 11
    else:
        dealer_count = card
    
    get_card()
    card2 = card
    if card == 1:
        player_ace_count = 2
        if player_count == 11:
            player_count = 12
    else:
        player_count = player_count + card
    
    turn = "player"

    if card1 == card2:
        double_cards = True

    else:
        double_cards = False

    print("player started with: " + str(player_count))
    print("dealer started with: " + str(dealer_count))
    return player_count, dealer_count, player_has_ace, player_has_double_ace, 
    dealer_on_ace, turn, shoe_size, dealer_ace_count, player_ace_count, player_blackjack, dealer_blackjack, double_cards

def player_hit(pc):
    global player_count
    global player_ace_count

    get_card()
    if card == 1:
        if pc < 21:
            player_count = pc + 11
            player_ace_count = player_ace_count + 1
            print("looking for bug pc is: " + str(pc))
          
        else:
            player_count = pc + 11
            print("looking for bug pc is: " + str(pc))
        return player_count, player_ace_count

    if pc + card > 21:
        if player_ace_count > 0:
            player_count = pc - 10
            player_ace_count = player_ace_count - 1

    print("looking for bug pc is: " + str(pc))
    print("looking for bug player_count is: " + str(player_count))
    player_count = pc + card
    print ("player hit and got:" + str(card))
    print ("player now has: " + str(player_count))
    return player_count, player_ace_count

def dealer_hit(dc):
    global dealer_count
    global dealer_ace_count

    get_card()
    if card == 1:
        if dc + 11 in [17,18,19,20,21]:
            dealer_count = dc + 11
            return dealer_count, dealer_ace_count
            
        elif dc + 11 > 21:
            dealer_count = dc + 1
            return dealer_count, dealer_ace_count

        else:
            dealer_count = dc + 11
            dealer_ace_count == dealer_ace_count + 1
            return dealer_count, dealer_ace_count
        
    if dc + card > 21:
        if dealer_ace_count > 0:
            dc = dc - 10
            dealer_ace_count = dealer_ace_count - 1
            return dealer_count, dealer_ace_count
    else:
        dealer_count = dealer_count + card
        return dealer_count, dealer_ace_count
        
    dealer_count= dc + card
    print ("dealer hit and got:" + str(card))
    print ("dealer now has: " + str(dealer_count))
    return dealer_count, dealer_ace_count

def house_win():
    global bank
    global loosing_streak
    global player_win
    loosing_streak = loosing_streak + 1
    bank=bank-bet
    player_win = False
    return bank, player_win, loosing_streak

def win():
    global bank
    global loosing_streak
    global player_win

    loosing_streak = 0
    player_win = True

    if player_blackjack == True:
        bank = bank + (bet*1.5)
        print("player WINS:" + str(bet*1.5))
        print("bank is now: " + str(bank))
        return bank, player_win, loosing_streak

    else:
        bank=bank+bet
        print("player WINS:" + str(bet))
        print("bank is now: " + str(bank))
        return bank, player_win, loosing_streak
   
def push():
    push = True
    print("push!")
    return push

def end_game():

    print("ending the game. DEALER has: " + str(dealer_count))
    print("PLAYER has: " + str(player_count)) 

    if player_blackjack == True:
        if dealer_blackjack == True:
            push()
    elif dealer_blackjack == True:
        house_win()
    elif player_count > 21:
        house_win()
    elif dealer_count > 21:
        win()
    elif dealer_count == player_count:
        push()
    elif dealer_count > player_count:
        house_win()
    elif dealer_count < player_count:
        win()

def stay(t):
    global turn
    if t == "player":
        turn="dealer"
        print("player stays on: " + str(player_count))
    elif t == "dealer":
        turn=t
        print("dealer stays on: " + str(dealer_count))
        end_game()
    return turn

def double_down(pc):
    global player_count
    global bet

    print("player doubles")

    bet = bet*2
    player_hit(pc)
    stay("player")
    player_count = pc + player_count
    return player_count, bet

def run_game(pc,dc):

    global player_count
    global player_blackjack
    
    player_count = pc
    turn = "player"

    while turn == "player":
        if double_cards == True:
            print("double cards!!!!")
            if pc in [4,6]:
                if dc in [4,5,6,7]:
                    split_card = int(pc/2)
                    split(split_card, dc)
                    return player_count
                else:
                    player_hit(player_count)
        
            elif pc == 12:
                if dc in [3,4,5,6]:
                    split_card = int(pc/2)
                    split(split_card,dc)
                    return player_count
                else:
                    player_hit(player_count)
        
            elif pc == 14:
                if dc in [2,3,4,5,6,7]:
                    split_card = int(pc/2)
                    split(split_card,dc)
                    return player_count
                else:
                    player_hit(player_count)
            
            elif pc == 16:
                split_card = int(pc/2)
                split(split_card, dc)
                return player_count

            elif pc == 18:
                if dc in [1,7,10,11]:
                    stay("player")
                    return player_count
                else:
                    split_card = int(pc/2)
                    split(split_card, dc)
                    return player_count

        if pc < 9:
            player_hit(player_count)
            pc=22
        if pc == 9:
            if dc in [1,2,7,8,9,10,11]:
                while player_count < 16:
                    player_hit(player_count)
                pc=22
                stay("player")
                return player_count
            elif dc in [3,4,5,6]:
                double_down(player_count)
                pc=22
                stay("player")
                return player_count


        if player_count == 9:
            if dc in [1,2,7,8,9,10,11]:
                while player_count < 16:
                    player_hit(player_count)
                stay("player")
                return player_count
            elif dc in [3,4,5,6]:
                player_hit(player_count)
            
        if pc == 10:
            if dc in [2,3,4,5,6,7,8,9]:
                double_down(player_count)
                stay("player")
                pc=22
                return player_count
            elif dc in [1,10,11]:
                while player_count < 16:
                    player_hit(player_count)
                stay("player")
                pc=22
                return player_count

        if player_count == 10:
            player_hit(player_count)
    
        if pc == 11:
            if dc in [1,11]:
                player_hit(player_count)
                pc=22
            else:
                double_down(player_count)
                stay("player")
                pc=22
                return player_count
    
        if player_count == 11:
            player_hit(player_count)
    
        if pc == 12:
            if dc in [1,2,3,7,8,9,10,11]:
                player_hit(player_count)
                pc=22
            elif dc in [4,5,6]:
                stay("player")
                pc=22
                return player_count

        if player_count == 12:
            if dc in [1,2,3,7,8,9,10,11]:
                while player_count < 16:
                    player_hit(player_count)
                stay("player")
                return player_count
            elif dc in [4,5,6]:
                stay("player")
                return player_count

        if pc in [13,14]:
            player_ace_count == 1
            if dc in [5,6]:
                double_down(player_count)
                pc=22
                stay("player")
                return player_count
            else:
                player_hit(player_count)
                pc=22

        if player_count == 13:
            if dc in [2,3,4,5,6]:
                stay("player")
            elif dc in [1,7,8,9,10,11]:
                while player_count < 16:
                    player_hit(player_count)
                stay("player")
            return player_count
    
        if player_count in [13,14]:
            if dc in [2,3,4,5,6]:
                stay("player")
                return player_count
            elif dc in [1,7,8,9,10,11]:
                while player_count < 16:
                    player_hit(player_count)
                stay("player")
                return player_count

        if player_count in [15,16]:
            if player_ace_count == 1:
                if dc in [4,5,6]:
                    double_down(player_count)
                    stay("player")
                    return player_count
                else:
                    player_hit(player_count)

        if pc == 15:
            if dc in [2,3,4,5,6]:
                stay("player")
                pc=22
                return player_count
            elif dc in [1,7,8,9,11]:
                player_hit(player_count)
                pc=22
            elif dc == 10:
                surrender()
                pc=22
                stay("player")
                return player_count

        if player_count == 15:
            if dc in [2,3,4,5,6]:
                stay("player")
                pc=22
                return player_count
            elif dc in [1,7,8,9,10,11]:
                while player_count < 16:
                    player_hit(player_count)
                stay("player")
                pc=22
                return player_count

        if pc == 16:
            if dc in [7,8]:
                player_hit(player_count)
                pc=22
            if dc in [1,9,10,11]:
                surrender()
                stay("player")
                pc=22
                return player_count
            if dc in [2,3,4,5,6]:
                stay("player")
                pc=22
                return player_count

        if player_count == 16:
            if dc in [1,7,8,9,10,11]:
                player_hit(player_count)
            if dc in [2,3,4,5,6]:
                stay("player")
                return player_count

        if pc in [17,18]:
            if player_ace_count == 1:
                if dc in [3,4,5,6]:
                    double_down(player_count)
                    stay("player")
                    pc=22
                    return player_count
                else:
                    if pc == 17:
                        player_hit(player_count)
                        pc=22
                    elif pc == 18:
                        if dc in [2,7,8]:
                            stay("player")
                            pc=22
                            return player_count
                        else:
                            player_hit(player_count)
                            pc=22
            elif dc in [2,7,8]:
                stay("player")
                pc=22
                return player_count
            elif dc in [3,4,5,6]:
                stay("player")
                pc=22
                return player_count
            else:
                player_hit(player_count)
                pc=22

        if pc == 21:
            player_blackjack = True
            stay("player")
            pc=22
            return player_count

        if pc in [19,20,21]:
            stay("player")
            pc=22
            return player_count

        if player_count in [17,18,19,20,21]:
            stay("player")
            pc=22
            return player_count

        if player_count == 21:
            stay("player")
            pc=22
            return player_count
        if player_count > 21:
            stay("player")
            return player_count
        continue
    
def run_dealer(dc):

    global dealer_blackjack
    global dealer_count
    global dealer_ace_count

    dealer_blackjack = False
    dealer_count = dc

    if dc in [1,10,11]:
        get_card()
        if card in [1,11]:
            dealer_ace_count = dealer_ace_count + 1
            if dc == 10:
                dealer_blackjack = True
                dealer_count = 21
                print("dealer has blackjack!!!")
            else:
                dealer_count = dealer_count + card
        elif card == 10:
            if dc in [1,11]:
                dealer_blackjack = True
                dealer_count = 21
            print("dealer has blackjack!!!")
            return dealer_count, dealer_blackjack
    
    while dealer_count < 17:
        dealer_hit(dealer_count)
        print("dealer now has: " + str(dealer_count))
    return dealer_count, dealer_blackjack
    
def surrender():
    global bet
    print("surrender")
    bet = bet/2
    house_win()

shuffle()

highest_bank = 1000

while bank>bet:
    print("BET: " + str(bet))
    if len(shoe_dict) < 110:
        shuffle()
    if player_win == False:
        bet = bet * 2
    if push == True:
        bet = bet
        push = False
    if player_win == True:
        bet = starting_bet
        player_win = False

    if bank>highest_bank:
        highest_bank = bank
    
    game_no = game_no + 1

    print(bank)
    start_game()
    run_game(player_count, dealer_count)
    run_dealer(dealer_count)
    end_game()
    

print("you ran out of money on hand number" + str(game_no))
print("you had a loosing streak of " + str(loosing_streak) + " hands")
print("the final amount of backroll you had was " + str(bank))
print("your bank was highest at " + str(highest_bank))

