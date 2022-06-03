import random
import time

num_decks = 5
shoe_dict = {}
discard_dict = {}

deck_hand_prefix = ["A", "B", "C", "D", "E", "F", "G", "H"]
deck_cards = ["HA", "H2" , "H3", "H4", "H5", "H6", "H7", "H8", "H9", 
    "H10", "HJ", "HQ", "HK", 
    "DA", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", 
    "D10", "DJ", "DQ", "DK",
    "SA", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", 
    "S10", "SJ", "SQ", "SK",
    "CA", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", 
    "C10", "CJ", "CQ", "CK"]

for p in range(num_decks):
    deck_prefix = random.choice(list(deck_hand_prefix))
    deck_hand_prefix.remove(deck_prefix)
    for c in range(len(deck_cards)):
        card = deck_cards[c]
        shoe_card = deck_prefix + card
        if card[1] == "A":
            shoe_dict[shoe_card] = 11
        elif card[1] in ["1", "J", "Q", "K"]:
            shoe_dict[shoe_card] = 10
        else:
            shoe_dict[shoe_card] = int(card[1])

print(len(shoe_dict))
print(len(discard_dict))

discard_dict = {}
game_count = 0
player_hand_dict = {}
must_surrender = False
must_double = False
must_split = False
must_stay = False

def shuffle(disc_dict):
    global shoe_dict
    global discard_dict
    shoe_dict.update(disc_dict)
    discard_dict = {}
    return shoe_dict, discard_dict
    
def remove_card(draw):
    global shoe_dict
    del shoe_dict[draw]
    return shoe_dict

def get_card():
    global card
    global discard_dict
    global draw
    draw = random.choice(list(shoe_dict))
    card = shoe_dict[draw]
    discard_dict[draw] = card
    remove_card(draw)
    return card, shoe_dict, discard_dict

def place_bet(hand_bet, funds, hand_number, must_double):
    global bank
    global round_bet

    bet_dict[hand_number] = hand_bet
    
    if must_double == True:
        bet_dict[hand_number] = (hand_bet*2)
        #print("Doubling down, Placing another bet of: " + str(hand_bet))
        #print("THE BOX BETS: " + str(bet_dict))
    else:
        bet_dict[hand_number] = hand_bet
        #print("Placing a bet of: " + str(hand_bet))
    bank = funds - hand_bet
    
    return bank, round_bet

def start_game(round_bet, funds):

    global player_hand_dict
    global dealer_hand
    global hand_number
    global bet_dict
    global bank
    bet_dict = {}

    if len(discard_dict)>25:
        shuffle(discard_dict)
        #print("shuffled")
    
    hand_number = 1

    player_hand_dict = {}
    place_bet(round_bet, funds, hand_number, False)

    get_card()
    player_hand_dict[hand_number] = []
    player_hand_dict[hand_number].append(card)

    dealer_hand = []
    get_card()
    dealer_hand.append(card)

    bank = funds - round_bet

    return player_hand_dict, dealer_hand, hand_number, bet_dict, bank

def split(hand_number, round_bet, funds):
    global split_dict
    global bet_dict
    global bank

    if player_hand_dict[hand_number][0] == 11:
        pass
        #print("WE SPLIT ACES")
    else:
        #print("WE SPLIT " + str(player_hand_dict[hand_number][0]) + "'s")
        pass
    
    split_dict = {}
    split_dict[hand_number] = []
    split_dict[hand_number + 1] = []
    split_dict[hand_number].append(player_hand_dict[hand_number][0])
    split_dict[hand_number + 1].append(player_hand_dict[hand_number][0])
    bet_dict[hand_number + 1] = round_bet
    place_bet(round_bet, funds, hand_number, False)
    #print("BOX BETS ARE: " + str(bet_dict))

    return split_dict, bank

def split_check(hand_number, dealer_count):
    global must_split
    hand = player_hand_dict[hand_number]
    must_split = False
    player_count = sum(hand)
    
    if dealer_count in [2,3,4,5,6,7]:
        if player_count == 14:
            if hand[0] == hand[1]:
                must_split = True
                return must_split
    if dealer_count in [4,5,6,7]:
        if player_count in [4,6]:
            if hand[0] == hand[1]:
                must_split = True
                return must_split
    if dealer_count in [3,4,5,6]:
        if player_count == 12:
            if hand[0] == hand[1]:
                must_split = True
                return must_split
    if dealer_count in [2,3,4,5,6]:
        if player_count == 18:
            if hand[0] == hand[1]:
                must_split = True
                return must_split
    if player_count in [16,22]:
        if hand[0] == hand[1]:
            must_split = True
            return must_split
    return must_split

def double_check(hand_number, dealer_count):
    global must_double
    must_double = False

    hand = player_hand_dict[hand_number]
    player_count = sum(hand)
    if len(hand) == 2:
        if 11 not in hand:
            if dealer_count in [3,4,5,6]:
                if player_count == 9:
                    must_double = True
            if dealer_count in [2,3,4,5,6,7,8,9]:
                if player_count == 10:
                    must_double = True
            if dealer_count in [2,3,4,5,6,7,8,9,10]:
                if player_count == 11:
                    must_double = True
            else:
                must_double = False
        elif 11 in hand:
            if dealer_count in [5,6]:
                if player_count in [13,14]:
                    must_double = True
            if dealer_count in [4,5,6]:
                if player_count in [15,16]:
                    must_double = True
            if dealer_count in [3,4,5,6]:
                if player_count in [17,18]:
                    must_double = True
    return must_double

def double_down(hand_number, funds):
    global end_game
    global bank
    global must_double

    must_double = True
    round_bet = bet_dict[hand_number]
    place_bet(round_bet, funds, hand_number, must_double)
    get_card()
    player_hand_dict[hand_number].append(card)
    if sum(player_hand_dict[hand_number]) > 21:
        if 11 in player_hand_dict[hand_number]:
            player_hand_dict[hand_number].remove(11)
            player_hand_dict[hand_number].append(1)
    end_game = True
    return bank, end_game

def surrender_check(hand_number, dealer_count):
    global must_surrender
    must_surrender = False
    hand = player_hand_dict[hand_number]
    player_count = sum(hand)
    if dealer_count == 11:
        return must_surrender
    elif player_count == 15:
        if dealer_count == 10:
            must_surrender = True
    elif player_count == 16:
        if dealer_count in [9,10,11]:
            must_surrender = True
    return must_surrender

def surrender(hand_number, bet_dict, funds, round_bet):
    global end_game
    end_game = True

    bet = bet_dict[hand_number]
    surrendered = bet/2
    bet_dict[hand_number] = surrendered
    player_hand_dict[hand_number].append(0)
    return end_game

def player_hit(hand_number):
    global player_hand_dict
    hand = player_hand_dict[hand_number]
    get_card()
    hand.append(card)
    player_hand_dict[hand_number] = hand
    return player_hand_dict

def hard_stay_check(hand_number, dealer_count):
    global must_stay
    must_stay = False
    player_count = sum(player_hand_dict[hand_number])
    if 11 in player_hand_dict[hand_number]:
        return must_stay
    elif player_count == 12:
        if dealer_count in [4,5,6]:
            must_stay = True
    elif player_count in [13,14,15,16]:
        if dealer_count in [2,3,4,5,6]:
            must_stay = True
    elif player_count == 17:
        must_stay = True 
    return must_stay

def stay(hand_number):
    global end_game
    end_game = True
    return end_game

def play_hard_blackjack(hand_number, dealer_count):
    global player_hand_dict
    global end_game
    end_game = False
    player_count = sum(player_hand_dict[hand_number])

    if player_count in [2,3,4,5,6,7,8,9,10,11]:
        player_hit(hand_number)
        return player_hand_dict, end_game

    elif player_count == 12:
        if 11 in player_hand_dict[hand_number]:
                play_soft_blackjack(hand_number, dealer_count)
        else:
            if dealer_count in [2,3,7,8,9,10,11]:
                player_hit(hand_number)
            elif dealer_count in [4,5,6]:
                stay(hand_number)
        return player_hand_dict, end_game

    elif player_count in [13,14,15,16]:
        if 11 in player_hand_dict[hand_number]:
            play_soft_blackjack(hand_number, dealer_count)
        else:
            if dealer_count in [7,8,9,10,11]:
                player_hit(hand_number)
            elif dealer_count in [2,3,4,5,6]:
                stay(hand_number)
        return player_hand_dict, end_game

    elif player_count > 16:
        if 11 in player_hand_dict[hand_number]:
             play_soft_blackjack(hand_number, dealer_count)
        else:
            stay(hand_number)
        return player_hand_dict, end_game
    return player_hand_dict, end_game
    
def play_soft_blackjack(hand_number, dealer_count):
    global player_hand_dict
    global end_game
    end_game = False
    
    while 11 in player_hand_dict[hand_number]:
        hand = player_hand_dict[hand_number]
        player_count = sum(hand)
        if player_count > 21:
            hand.remove(11)
            hand.append(1)
            player_hand_dict[hand_number] = hand
            if 1 in player_hand_dict[hand_number]:
                continue
        elif player_count in [12,13,14,15,16,17]:
            player_hit(hand_number)
            continue
        elif player_count == 18:
            if dealer_count in [9,10,11]:
                player_hit(hand_number)
                continue
            else:
                end_game = True
                stay(hand_number)
                break
        elif player_count > 18:
            end_game = True
            break
    return player_hand_dict, end_game

def check_strat(dealer_count, hand_number, round_bet, bet_dict, funds):
    global end_game
    global end_round
    global bank

    bank = funds
    end_round = False
    end_game = False

    while True:
        try:
            end_game = False
            #hand = player_hand_dict[hand_number]
            if len(player_hand_dict[hand_number]) == 2:
                split_check(hand_number, dealer_count)
                if must_split == True:
                    split(hand_number, round_bet, bank)
                    del player_hand_dict[hand_number]
                    player_hand_dict.update(split_dict)
                    continue
                else:
                    double_check(hand_number, dealer_count)
                    if must_double == True:
                        double_down(hand_number, bank)
                        hand_number = hand_number + 1
                        continue
                    else:
                        if 11 not in player_hand_dict[hand_number]:
                            surrender_check(hand_number, dealer_count)
                            if must_surrender == True:
                                surrender(hand_number, bet_dict, bank, round_bet)
                                hand_number = hand_number + 1
                                continue
                            else:
                                hard_stay_check(hand_number, dealer_count)
                                if must_stay == True:
                                    stay(hand_number)
                                    hand_number = hand_number + 1
                                    continue
                                else:
                                    while end_game == False:
                                        if 11 in player_hand_dict[hand_number]:
                                            play_soft_blackjack(hand_number, dealer_count)
                                        else:
                                            play_hard_blackjack(hand_number, dealer_count)
                                    hand_number = hand_number + 1
                                    continue
                                    
                        else:
                            while end_game == False:
                                if 11 in player_hand_dict[hand_number]:
                                    play_soft_blackjack(hand_number, dealer_count)
                                else:
                                    play_hard_blackjack(hand_number, dealer_count)
                            hand_number = hand_number + 1
                            continue

                
            elif len(player_hand_dict[hand_number]) == 1:
                get_card()
                player_hand_dict[hand_number].append(card)
                continue

            elif len(player_hand_dict[hand_number]) > 2:
                while end_game == False:
                    if 11 in player_hand_dict[hand_number]:
                        play_soft_blackjack(hand_number, dealer_count)
                    else:
                        play_hard_blackjack(hand_number, dealer_count)
                hand_number = hand_number + 1
                continue
                
        except:
            end_round = True
            break

def run_dealer(dealer_count):
    global dealer_hand
    dealer_hand = []
    dealer_hand.append(dealer_count)
    while sum(dealer_hand) < 17:
        get_card()
        dealer_hand.append(card)
        if sum(dealer_hand) > 21:
            if 11 in dealer_hand:
                dealer_hand.remove(11)
                dealer_hand.append(1)
    return dealer_hand

def choose_bet_strat(bet, bet_strat, round_winnings, round_losses, funds, min_bet, push):
    global bank
    global round_bet

    bank = funds

    if bet_strat == "hoenselaar":
        round_profit = round_winnings - round_losses
        if push == True:
            bank = bank + round_winnings - round_losses
            pass     
        elif round_profit < 0:
            bank = bank + round_winnings
            round_bet = min_bet 
        else:
            if round_profit > 0:
                #print("BANK WAS " + str(bank) + " AFTER PLACING BETS")
                round_bet = bet + min_bet
                bank = bank + round_winnings
                #print("WE WIN: " + str(round_winnings))
                #print("BANK IS " + str(bank) + " AFTER WINNINGS")
    
            elif round_profit == 0:
                bank = bank + round_winnings

    elif bet_strat == "papenfus":
        round_profit = round_winnings - round_losses
        if push == True:
            bank = bank + round_winnings - round_losses
        elif round_profit == 0:
            bank = bank + round_winnings
        elif round_profit > 0:
            round_bet = min_bet
            bank = bank + round_winnings
        elif round_profit < 0:
            if len(player_hand_dict) == 1:
                round_bet = round_bet * 2
            else:
                for hand in range(len(player_hand_dict)):
                    round_bet = round_bet + round_bet
                    round_bet = round_bet*2
            bank = bank + round_winnings
      
    return bank, round_bet

def check_wins(dealer_hand, funds):
    global player_wins
    global dealer_wins
    global dealer_blackjacks
    global player_blackjacks
    global pushes
    global round_profit
    global bank
    global round_bet
    global push

    round_losses = 0
    dealer_blackjacks = 0
    player_blackjacks = 0
    pushes = 0
    hand_number = 0
    round_winnings = 0
    push = False
    round_profit = 0
    
    for i in player_hand_dict:
        p_hand = player_hand_dict[i]
        d_hand = dealer_hand
        hand_number = hand_number + 1
        if 0 in p_hand:
            #print("player hand: " + str(p_hand[0] + p_hand[0]) + " => [" + str(p_hand[0]) + ", " + str(p_hand[1]) + "] => SURRENDERED")
            round_winnings = bet_dict[hand_number]
            round_losses = bet_dict[hand_number]
            dealer_wins = dealer_wins + 0.5
            continue
        #print("player hand: " + str(sum(p_hand)) + " => " + str(p_hand))
        if sum(player_hand_dict[i]) == 21:
            if len(player_hand_dict[i]) == 2:
                if sum(dealer_hand) == 21:
                    if len(dealer_hand) == 2:
                        pushes = pushes + 1
                        round_winnings = round_winnings + bet_dict[hand_number]
                        push = True
                        player_wins = player_wins + 0.5
                        dealer_wins = dealer_wins + 0.5
                    else:
                        player_blackjacks = player_blackjacks + 1
                        round_winnings = (bet_dict[hand_number]*1.5) + bet_dict[hand_number]
                        player_wins = player_wins + 1
                else:
                    player_blackjacks = player_blackjacks + 1
                    round_winnings = (bet_dict[hand_number]*1.5) + bet_dict[hand_number]
                    player_wins = player_wins + 1
            else:
                if sum(dealer_hand) == 21:
                    if len(dealer_hand) == 2:
                        dealer_blackjacks = dealer_blackjacks + 1
                        round_losses = round_losses + bet_dict[hand_number]
                        dealer_wins = dealer_wins + 1
                    else:
                        pushes = pushes + 1
                        round_winnings = round_winnings + bet_dict[hand_number]
                        push = True
                        player_wins = player_wins + 0.5
                        dealer_wins = dealer_wins + 0.5
                else:
                    player_wins = player_wins + 1
                    round_winnings = round_winnings + (2*bet_dict[hand_number])
        else:
            if sum(player_hand_dict[i]) > 21:
                dealer_wins = dealer_wins + 1
                round_losses = round_losses + bet_dict[hand_number]

            else:
                if sum(dealer_hand) > 21:
                    player_wins = player_wins + 1
                    round_winnings = round_winnings + (2*bet_dict[hand_number])
                elif sum(player_hand_dict[i]) > sum(dealer_hand):
                    player_wins = player_wins + 1
                    round_winnings = round_winnings + (2*bet_dict[hand_number])
                elif sum(player_hand_dict[i]) < sum(dealer_hand):
                    dealer_wins = dealer_wins + 1
                    round_losses = round_losses + bet_dict[hand_number]
                elif sum(player_hand_dict[i]) == sum(dealer_hand):
                    pushes = pushes + 1
                    round_winnings = round_winnings + bet_dict[hand_number]
                    push = True
                    player_wins = player_wins + 0.5
                    dealer_wins = dealer_wins + 0.5

    bet_strat = "papenfus"               
    choose_bet_strat(round_bet, bet_strat, round_winnings, round_losses, bank, min_bet, push)

    #print("dealer hand: " + str(sum(d_hand)) + " => " + str(d_hand))
    #print("the bank is now: " + str(bank))
    
    return pushes, player_wins, dealer_wins, dealer_blackjacks, player_blackjacks, round_profit, bank, round_winnings, round_bet, push
    
hand_number = 1
bank = 0
min_bet = 2
game_number = 1
too_many = 0
win_count = 0
loss_count = 0
bet_dict = {}
round_bet = min_bet
round_winnings = 0
round_profit = 0
big_bank = 2200000
highest_bank = 10192
highest_bank_game_number = 1
dealer_wins = 0
player_wins = 0
casino_trips = 0
highest_big_bank = big_bank
highest_casino_trips = 0
total_games = 0
pocket = 0

while big_bank > 10:
    print(big_bank)
    hand_number = 1
    bank = 0    
    min_bet = 2
    game_number = 1
    too_many = 0
    win_count = 0
    loss_count = 0
    bet_dict = {}
    round_bet = min_bet
    round_winnings = 0
    round_profit = 0
    highest_bank = 10192
    highest_bank_game_number = 1
    dealer_wins = 0
    player_wins = 0

    if big_bank > 0:
        pocket = pocket + 100
        big_bank = big_bank - 100

    if big_bank < 10192:
        bank = big_bank
        big_bank = 0
    else:
        big_bank = big_bank - 10192
        bank = 10192

    casino_trips = casino_trips + 1
    
    while bank < min_bet * 5172:
        if bank < 0:
            break
        if round_bet > 5096:
            break
        """print("")
        print("Started with bank of: " + str(big_bank/4))
        print("Min bet = " + str(min_bet))
        print("Strategy = HOENSELAAR!")
        print("GAME NUMBER: " + str(game_number))
        print("BANK: " + str(bank))"""
        start_game(round_bet, bank)
        dealer_count = sum(dealer_hand)
        check_strat(dealer_count, hand_number, round_bet, bet_dict, bank)
        run_dealer(dealer_count)
        check_wins(dealer_hand, bank)
        funds = bank
        if bank > highest_bank:
            highest_bank = bank
            highest_bank_game_number = game_number

        table_bet = 0
        
        for bet in bet_dict:
            table_bet = table_bet + bet_dict[bet]

        if table_bet > bank:
            withdrawl = (bank - table_bet)
            big_bank = big_bank + withdrawl
            bank = bank + (-1*withdrawl)
        
        game_number = game_number + 1

        """print("bank_roll " + str(round(big_bank, 2)))
        print("you have been to the casino " + str(casino_trips) + "times")
        print("you have played for a total of " + str((total_games + game_number)/3/60) + "hours")
        print("your highest bankroll was " + str(highest_big_bank) + " after " + str(highest_casino_trips) + " trips to the casino")"""

    """print("")
    print("YOUR TRIP TO THE CASINO HAS ENDED")"""
    total_games = total_games + game_number
    #trip stats
    player_win_perc = str(round(player_wins/game_number, 3)*100)
    dealer_win_prec = str(round(dealer_wins/game_number, 3)*100)

    """print("Your bank was higest when at " + str(highest_bank) + " on game number " + str(highest_bank_game_number))
    print("playing 3 hands a minute, " + str(game_number) + " games would take: " + str(round(game_number/3/60, 2)) + " hours")
    print("The dealer won " + dealer_win_prec + "%" + " of the time")
    print("The player won " + player_win_perc + "%" + " of the time")
    print("POKETED: " + str(pocket))"""
    
    if bank == 0:
        """print("you ran out of money on hand no: " + str(game_number))"""
        big_bank = big_bank + bank
        #time.sleep(5)
    elif bank < 0:
        """print("you ran out of money on hand no: " + str(game_number))"""
        big_bank = big_bank + bank
        #time.sleep(5)
    else:
        """print("Doubled you money and will be added to your bankroll")"""
        big_bank = big_bank + bank
        if big_bank > highest_big_bank:
            highest_big_bank = big_bank
            highest_casino_trips = casino_trips
        #time.sleep(5)
    if big_bank < 5096:
        pocket = pocket + big_bank
        big_bank = 0
        break
    else:
        continue

print("you are completely broke after " + str(casino_trips) + " trips to the casino")
print("youe bankroll is now " + str(big_bank))
print("you played a total of " + str(total_games) + " in " + str(round(total_games/3/60, 2)) + " hours")
print("your highest bankroll was " + str(highest_big_bank) + " after " + str(highest_casino_trips) + " trips to the casino")
print("you pocketed " + str(pocket))

#single hand check
"""discard_dict = {}
game_count = 0
player_hand_dict = {}
must_surrender = False
must_double = False
must_split = False
must_stay = False

hand_number = 1
bank = 1000
min_bet = 2
game_number = 1
too_many = 0
win_count = 0
loss_count = 0
bet_dict = {}
round_bet = min_bet
round_winnings = 0
round_profit = 0

hand_number = 1
print("starting bank: " + str(bank))
place_bet(round_bet, bank, hand_number, must_double)
print(bet_dict)
player_hand_dict = {}
player_hand_dict[hand_number] = [2,7]
print(player_hand_dict[hand_number])
dealer_hand = [5]
dealer_count = sum(dealer_hand)
check_strat(dealer_count, hand_number, round_bet, bet_dict, bank)
run_dealer(dealer_count)
check_wins(dealer_hand, bank)
check_previous_results(round_profit, round_bet)
print(player_hand_dict)
print(dealer_hand)"""
