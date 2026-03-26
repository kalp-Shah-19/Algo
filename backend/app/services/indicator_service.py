import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import EMAIndicator

def add_indicators(df: pd.DataFrame):
    df = df.copy()

    close_col = [col for col in df.columns if "Close" in col][0]

    rsi = RSIIndicator(close=df[close_col], window=14)
    df["RSI"] = rsi.rsi()
    
    ema = EMAIndicator(close=df[close_col], window=20)
    df["EMA20"] = ema.ema_indicator()

    return df