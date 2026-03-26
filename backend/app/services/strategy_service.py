import pandas as pd

def apply_strategy(df: pd.DataFrame, strategy="rsi", use_ml=False, model=None):
    df = df.copy()
    close_col = [col for col in df.columns if "Close" in col][0]

    signals = []

    for i in range(len(df)):
        if i < 20:
            signals.append("HOLD")
            continue

        rsi = df.iloc[i]["RSI"]
        price = df.iloc[i][close_col]
        ema = df.iloc[i]["EMA20"]
        volatility = df.iloc[i]["Volatility"]
        momentum = df.iloc[i]["Momentum"]
        ema_diff = df.iloc[i]["EMA_Diff"]

        if strategy == "rsi":

            if rsi < 40:

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
                    #[0]->first row,[1] → probability of class "1" (UP)
                    
                    threshold = 0.5 + volatility * 0.5
                    if prob < threshold:
                    #     HOLD
                    # if prob < 0.52 :
                        signals.append("HOLD")
                        continue

                signals.append("BUY")

            elif rsi > 60:
                signals.append("SELL")

            else:
                signals.append("HOLD")

        elif strategy == "ema":

            prev_price = df.iloc[i-1][close_col]
            prev_ema = df.iloc[i-1]["EMA20"]

            if prev_price < prev_ema and price > ema:
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
                    #[0]->first row,[1] → probability of class "1" (UP)

                    threshold = 0.5 + volatility * 0.5
                    if prob < threshold:
                    #     HOLD
                    # if prob < 0.52 :
                        signals.append("HOLD")
                        continue                
                signals.append("BUY")

            elif prev_price > prev_ema and price < ema:
                signals.append("SELL")

            else:
                signals.append("HOLD")

        else:
            signals.append("HOLD")

    df["Signal"] = signals
    return df