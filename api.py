#!/usr/bir/

from fastapi import FastAPI
import uvicorn
import pandas as pd
# import numpy as np
import os, sys
from random import sample
from typing import TypeVar, Generic
import random

class ServerConfig:
    vocab_path = os.getenv('BINGO_HOME')
    vocab_path = os.path.join(vocab_path, "vocab.xlsx")
    _bingoData: pd.DataFrame = pd.read_excel(vocab_path)
    df: pd.DataFrame = _bingoData.copy()


server = FastAPI()

#@server.get("/")
#async def root():
#    return {"message": "Hello, World!"}


@server.get("/")
async def generate_card():
    df = ServerConfig.df

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

    # id=save_card(row1, row2, row3, row4, row5)
    return {
        'id': str(hex(hash(''.join([r for r in row1+row2+row3+row4+row5]))))[3:],
        'row1': row1,
        'row2': row2,
        'row3': row3,
        'row4': row4,
        'row5': row5
    }

if __name__ == "__main__":
    uvicorn.run("api:server", host="0.0.0.0", port=4200, log_level="info", reload=True)
