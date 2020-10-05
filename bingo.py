from flask import Flask, redirect, url_for, render_template, request, redirect
import pandas as pd
import numpy as np
import os, sys
from random import sample

app = Flask(__name__)

vocab_path = os.getenv('BINGO_HOME')
vocab_path = os.path.join(vocab_path, "vocab.xlsx")

df = pd.read_excel(vocab_path)

@app.route("/load/<board>")
def load(board):
    card_path = os.getenv('BINGO_HOME')
    card_path = os.path.join(card_path, 'saved_cards.xlsx')

    cards = pd.read_excel(card_path)
    board = int(board)

    try:
        card = cards.iloc[board]
    except IndexError:
        return redirect(url_for('load', board=(len(cards)-1) ))

    rows = []
    for i in card.values[1:]:
        this_row = str(i).split(sep='|',maxsplit=4)
        this_row = [ x.replace('|','') for x in this_row ]
        rows.append(this_row)

    return render_template("index.html", rows=[rows[0], rows[1], rows[2], rows[3], rows[4]], id=board)


@app.route("/", methods=['GET','POST'])
def generate_card():
    global df
    if request.method == 'GET':
        form = request.args
        if form.get('board'):
            val = form.get('board')

            board_idx = int(val)
            return redirect(url_for('load', board=board_idx))


    common = sample(df.query('likelihood > 3').text.tolist(),8)
    unused_terms = df[~df.text.isin(common)]
    center = 'Peter Thomas names a city, state, or country'

    likelihood_distribution = { 1: 1,
                                2: 2,
                                3: 7,
                                4: 10 }

    weighted_term_pool = []
    for j in unused_terms.itertuples(index=False):
        for i in range(likelihood_distribution[j.likelihood]):
            weighted_term_pool.append(j.text)

    # Grab term from the list randomly without duplication
    rare = []
    while len(rare) < 16:
        terms_to_choose = 16 - len(rare) # find out how many more non-duplicate terms are needed for the card
        rare += sample(weighted_term_pool, terms_to_choose) # grab that number of terms for the card
        rare_set = set(rare) # remove duplicates in case the same term is chosen twice
        rare = [ r for r in rare_set ]


    row1 = [common.pop(), rare.pop(),   rare.pop(), rare.pop(),   common.pop()]
    row2 = [rare.pop(),   common.pop(), rare.pop(), common.pop(), rare.pop()]
    row3 = [rare.pop(),   rare.pop(),   center,     rare.pop(),   rare.pop()]
    row4 = [rare.pop(),   common.pop(), rare.pop(), common.pop(), rare.pop()]
    row5 = [common.pop(), rare.pop(),   rare.pop(), rare.pop(),   common.pop()]

    id=save_card(row1, row2, row3, row4, row5)
    return render_template("index.html", rows=[row1, row2, row3, row4, row5], id=id)


def save_card(*rows):
    card_path = os.getenv('BINGO_HOME')
    card_path = os.path.join(card_path, 'saved_cards.xlsx')

    try:
        cards = pd.read_excel(card_path, header=0, index_col=0)
        start_new_file = False
    except:
        start_new_file = True

    record = []
    for row in rows:
        rowdata = '|'.join([d for d in row])
        record.append(rowdata)

    row = pd.DataFrame(data={0: [record[0]],
                             1: [record[1]],
                             2: [record[2]],
                             3: [record[3]],
                             4: [record[4]]})
    if start_new_file:
        cards = row
    else:
        cards = pd.concat([cards, row], axis=0)
        cards.reset_index(drop=True,inplace=True)

    cards.to_excel(card_path)
    idx = get_board_number(cards,record)
    # idx = cards[cards[0] == record[0]].index.values
    return idx


def get_board_number(cards, record):
    """
    Finds the board index that is equal to the one generated
    :param pandas.DataFrame cards: Contains saved bingo board data
    :param list(list()) record: Nested list with row by row content of the current card
    """

    idx = cards[cards[0] == record[0]].index
    i=0
    while len(idx) > 1 and i < 5:
        i += 1
        idx = cards[cards[i] == record[i]].index
    if i == 5:
        return min(idx)
    else:
        return idx[0]

#@app.route("/<name>")
#def user(name):
#    return f"<h1>Hello {name}!</h1>"


if __name__ == "__main__":
    df = pd.read_excel(vocab_path, header=0)
    app.run(debug=True, host="0.0.0.0", port=int("8801"))
