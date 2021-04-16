import pandas as pd
import numpy as np
import os.path as op
import matplotlib.pyplot as plt
from sklearn.datasets import make_circles


def init():
    X, y = make_circles(noise=0.05, factor=0.4)  # NOQA: N806
    out = op.join(op.dirname(__file__), 'circles.csv')
    pd.DataFrame(np.c_[X, y], columns=['X1', 'X2', 'y']).to_csv(out, encoding='utf-8', index=False)
    plt.scatter(*X.T, c=y)
    out = op.join(op.dirname(__file__), 'circles.png')
    plt.savefig(out)
    plt.close('all')
    X = np.exp(-X ** 2)  # NOQA: N806
    plt.scatter(*X.T, c=y)
    out = op.join(op.dirname(__file__), 'circles-transformed.png')
    plt.savefig(out)


def transform(df, *args, **kwargs):
    df[['X1', 'X2']] = np.exp(-df[['X1', 'X2']].values ** 2)
    return df
