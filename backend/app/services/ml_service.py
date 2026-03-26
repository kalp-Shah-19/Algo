import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier


def train_ml_model(df: pd.DataFrame):
    df = df.copy()

    close_col = [col for col in df.columns if "Close" in col][0]

    df["Return"] = df[close_col].pct_change()
    df["Volatility"] = df["Return"].rolling(5).std()
    df["Momentum"] = df[close_col] - df[close_col].shift(5)
    df["EMA_Diff"] = df[close_col] - df["EMA20"]

    df = df.dropna()

    X = df[["RSI", "EMA20", "Volatility", "Momentum", "EMA_Diff"]]

    y = (df["Return"].shift(-3) > 0.01).astype(int)

    X = X[:-1]
    y = y[:-1]

    if len(X) < 50:
        return None

    split = int(len(X) * 0.7)

    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = XGBClassifier(n_estimators=100, max_depth=3)

    model.fit(X_train_scaled, y_train)

    model.scaler = scaler

    return model
