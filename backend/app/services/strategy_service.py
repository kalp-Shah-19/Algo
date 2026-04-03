import pandas as pd

def apply_strategy(
    df: pd.DataFrame,
    strategy="rsi",
    use_ml=False,
    model=None,
    rsi_buy_below=40,
    rsi_sell_above=60,
    ema_fast=9,
    ema_slow=20
    ):
    df = df.copy()
    close_col = [col for col in df.columns if "Close" in col][0]

    df[f"EMA_{ema_fast}"] = df[close_col].ewm(span=ema_fast).mean()
    df[f"EMA_{ema_slow}"] = df[close_col].ewm(span=ema_slow).mean()

    signals = []

    for i in range(len(df)):
        if i < 20:
            signals.append("HOLD")
            continue

        rsi = df.iloc[i]["RSI"]
        ema = df.iloc[i]["EMA20"]
        price = df.iloc[i][close_col]
        fast_ema = df.iloc[i][f"EMA_{ema_fast}"]
        slow_ema = df.iloc[i][f"EMA_{ema_slow}"]

        prev_fast = df.iloc[i-1][f"EMA_{ema_fast}"]
        prev_slow = df.iloc[i-1][f"EMA_{ema_slow}"]
        volatility = df.iloc[i]["Volatility"]
        momentum = df.iloc[i]["Momentum"]
        ema_diff = df.iloc[i]["EMA_Diff"]

        if strategy == "rsi":

            if rsi < rsi_buy_below:

                if use_ml and model is not None:
                    features = pd.DataFrame([{
                        "RSI": rsi,
                        "EMA20": ema,
                        "Volatility": volatility,
                        "Momentum": momentum,
                        "EMA_Diff": ema_diff
                    }])

                    features_scaled = model.scaler.transform(features)
                    prob = model.predict_proba(features_scaled)[0][1]

                    threshold = 0.5 + volatility * 0.5
                    if prob < threshold:
                        signals.append("HOLD")
                        continue

                signals.append("BUY")

            elif rsi > rsi_sell_above:
                signals.append("SELL")

            else:
                signals.append("HOLD")

        elif strategy == "ema":

            fast_ema = df.iloc[i][f"EMA_{ema_fast}"]
            slow_ema = df.iloc[i][f"EMA_{ema_slow}"]

            prev_fast = df.iloc[i-1][f"EMA_{ema_fast}"]
            prev_slow = df.iloc[i-1][f"EMA_{ema_slow}"]

            if prev_fast < prev_slow and fast_ema > slow_ema:

                if use_ml and model is not None:
                    features = pd.DataFrame([{
                        "RSI": rsi,
                        "EMA20": slow_ema,
                        "Volatility": volatility,
                        "Momentum": momentum,
                        "EMA_Diff": ema_diff
                    }])

                    features_scaled = model.scaler.transform(features)
                    prob = model.predict_proba(features_scaled)[0][1]

                    threshold = 0.5 + volatility * 0.5
                    if prob < threshold:
                        signals.append("HOLD")
                        continue

                signals.append("BUY")

            elif prev_fast > prev_slow and fast_ema < slow_ema:
                signals.append("SELL")

            else:
                signals.append("HOLD")

        else:
            signals.append("HOLD")

    df["Signal"] = signals
    return df
