from flask import Flask, redirect, url_for, render_template
import pandas as pd
from random import sample

app = Flask(__name__)
df = pd.read_excel("vocab.xlsx")

@app.route("/")
def generate_card():
    global df
    common = sample(df.query('likelihood > 2').text.tolist(),8)
    unused_terms = df[~df.text.isin(common)]
    center = 'Peter Thomas names a city, state, or country'

    likelihood_distribution = { 1: 1,
                                2: 2,
                                3: 7,
                                4: 10 }

    rare = []
    for j in unused_terms.itertuples(index=False):
        for i in range(likelihood_distribution[j.likelihood]):
            rare.append(j.text)

    row1 = [common.pop(), rare.pop(), rare.pop(), rare.pop(), common.pop()]
    row2 = [rare.pop(), common.pop(), rare.pop(), common.pop(), rare.pop()]
    row3 = [rare.pop(), rare.pop(), center, rare.pop(), rare.pop()]
    row4 = [rare.pop(), common.pop(), rare.pop(), common.pop(), rare.pop()]
    row5 = [common.pop(), rare.pop(), rare.pop(), rare.pop(), common.pop()]
    return render_template("index.html",rows=[row1, row2, row3, row4, row5])

#@app.route("/<name>")
#def user(name):
#    return f"<h1>Hello {name}!</h1>"


if __name__ == "__main__":
    df = pd.read_excel("vocab.xlsx", header=0)
    app.run(debug=True, host="0.0.0.0", port=int("8800"))
