import pandas as pd

def add_ml_features(df: pd.DataFrame):
    df = df.copy()

    close_col = [col for col in df.columns if "Close" in col][0]

    df["Return"] = df[close_col].pct_change()
    df["Volatility"] = df["Return"].rolling(5).std()
    df["Momentum"] = df[close_col] - df[close_col].shift(5)
    df["EMA_Diff"] = df[close_col] - df["EMA20"]

    return df