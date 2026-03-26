import yfinance as yf
import pandas as pd

def get_historical_data(symbol: str, interval="1d", period="1y"):
    data = yf.download(symbol, interval=interval, period=period)
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = ['_'.join(col).strip() for col in data.columns.values]

    data.reset_index(inplace=True)

    return data