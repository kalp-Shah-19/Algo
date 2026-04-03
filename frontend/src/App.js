import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

function App() {
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [data, setData] = useState(null);
  const [strategy, setStrategy] = useState("rsi");
  const [useML, setUseML] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [emaSlow, setEmaSlow] = useState(20);
  const [emaFast, setEmaFast] = useState(9);
  const [rsiBuyBelow, setRsiBuyBelow] = useState(40);
  const [rsiSellAbove, setRsiSellAbove] = useState(60);

  const runBacktest = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        strategy,
        use_ml: useML,
        rsi_buy_below: rsiBuyBelow,
        rsi_sell_above: rsiSellAbove,
        ema_fast: emaFast,
        ema_slow: emaSlow,
      });
      const res = await axios.get(
        `http://127.0.0.1:8000/backtest/${symbol}?${params.toString()}`,
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    data?.equity_curve?.map((value, index) => ({
      index,
      equity: Number(value),
    })) || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6">Algo Dashboard</h2>
        <ul className="space-y-4 text-gray-300">
          <li
            onClick={() => setPage("dashboard")}
            className="cursor-pointer hover:text-white"
          >
            Dashboard
          </li>
          <li
            onClick={() => setPage("backtest")}
            className="cursor-pointer hover:text-white"
          >
            Backtest
          </li>
          <li
            onClick={() => setPage("strategy")}
            className="cursor-pointer hover:text-white"
          >
            Strategies
          </li>
          <li
            onClick={() => setPage("settings")}
            className="cursor-pointer hover:text-white"
          >
            Settings
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* DASHBOARD */}
        {page === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold mb-6"> Dashboard</h1>

            {data ? (
              <>
                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-4 rounded-2xl">
                    <h3 className="text-gray-400">Profit</h3>
                    <p
                      className={`text-2xl font-bold ${data.metrics.total_profit >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      ₹ {data.metrics.total_profit.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-2xl">
                    <h3 className="text-gray-400">Trades</h3>
                    <p className="text-2xl font-bold">
                      {data.metrics.num_trades}
                    </p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-2xl">
                    <h3 className="text-gray-400">Win Rate</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {data.metrics.win_rate.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Advanced */}
                {data?.advanced && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800 p-4 rounded-2xl">
                      <h3>Sharpe</h3>
                      <p className="text-green-400 text-xl">
                        {data.advanced.sharpe_ratio.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-2xl">
                      <h3>Drawdown</h3>
                      <p className="text-red-400 text-xl">
                        {(data.advanced.max_drawdown * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Chart */}
                <div className="bg-gray-800 p-4 rounded-2xl mb-6">
                  <h2 className="mb-4">Equity Curve</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#444" />
                      <XAxis dataKey="index" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip />
                      <Line type="monotone" dataKey="equity" stroke="#3b82f6" />

                      {data?.all_trades?.map((t, i) => (
                        <ReferenceDot
                          key={i}
                          x={t.index}
                          y={chartData[t.index]?.equity}
                          r={5}
                          fill={t.type === "BUY" ? "green" : "red"}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Trades */}
                <div className="bg-gray-800 rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Trades</h3>

                  {/* Header */}
                  <div className="grid grid-cols-3 text-gray-400 font-semibold border-b border-gray-700 pb-2 mb-2">
                    <div>Type</div>
                    <div>Price</div>
                    <div>PnL</div>
                  </div>

                  {/* Rows */}
                  {data?.all_trades?.map((t, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 py-2 border-b border-gray-700 text-sm"
                    >
                      <div
                        className={
                          t.type === "BUY" ? "text-green-400" : "text-red-400"
                        }
                      >
                        {t.type}
                      </div>

                      <div>{t.price.toFixed(2)}</div>

                      <div
                        className={
                          t.type === "SELL"
                            ? t.pnl > 0
                              ? "text-green-400"
                              : "text-red-400"
                            : ""
                        }
                      >
                        {t.pnl ? t.pnl.toFixed(2) : "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-400">Run a backtest to see results</p>
            )}
          </>
        )}

        {/*  BACKTEST */}
        {page === "backtest" && (
          <>
            <h1 className="text-3xl font-bold mb-6"> Backtest</h1>

            {}
            <div className="bg-gray-800 p-4 rounded-2xl shadow mb-6 flex flex-wrap gap-4 items-center">
              <input
                className="bg-gray-900 border border-gray-700 p-2 rounded w-full md:w-1/3 text-white"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter stock (e.g., RELIANCE.NS)"
              />

              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="bg-gray-900 border border-gray-700 p-2 rounded text-white"
              >
                <option value="rsi">RSI Strategy</option>
                <option value="ema">EMA Crossover</option>
              </select>

              {}
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm text-gray-300">ML Filter</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={useML}
                    onChange={() => setUseML(!useML)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full transition ${
                      useML ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  ></div>
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition ${
                      useML ? "translate-x-5" : ""
                    }`}
                  ></div>
                </div>
              </label>

              <button
                onClick={runBacktest}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                {loading ? "Running..." : "Run"}
              </button>
            </div>

            {}
            {data && (
              <>
                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-4 rounded-2xl">
                    <h3 className="text-gray-400">Profit</h3>
                    <p
                      className={`text-2xl font-bold ${
                        data.metrics.total_profit >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ₹ {data.metrics.total_profit.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-2xl">
                    <h3 className="text-gray-400">Trades</h3>
                    <p className="text-2xl font-bold">
                      {data.metrics.num_trades}
                    </p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-2xl">
                    <h3 className="text-gray-400">Win Rate</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {data.metrics.win_rate.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-gray-800 p-4 rounded-2xl mb-6">
                  <h2 className="mb-4">Equity Curve</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#444" />
                      <XAxis dataKey="index" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip />
                      <Line type="monotone" dataKey="equity" stroke="#3b82f6" />

                      {data?.all_trades?.map((t, i) => (
                        <ReferenceDot
                          key={i}
                          x={t.index}
                          y={chartData[t.index]?.equity}
                          r={5}
                          fill={t.type === "BUY" ? "green" : "red"}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </>
        )}

        {/* STRATEGIES */}
        {page === "strategy" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Strategies</h1>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4">RSI Strategy</h3>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-gray-400">Buy below RSI</span>
                    <input
                      type="number"
                      value={rsiBuyBelow}
                      onChange={(e) => setRsiBuyBelow(Number(e.target.value))}
                      className="bg-gray-900 border border-gray-700 p-2 rounded text-white"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-gray-400">
                      Sell above RSI
                    </span>
                    <input
                      type="number"
                      value={rsiSellAbove}
                      onChange={(e) => setRsiSellAbove(Number(e.target.value))}
                      className="bg-gray-900 border border-gray-700 p-2 rounded text-white"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4">EMA Crossover</h3>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-gray-400">Fast EMA</span>
                    <input
                      type="number"
                      value={emaFast}
                      onChange={(e) => setEmaFast(Number(e.target.value))}
                      className="bg-gray-900 border border-gray-700 p-2 rounded text-white"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-gray-400">Slow EMA</span>
                    <input
                      type="number"
                      value={emaSlow}
                      onChange={(e) => setEmaSlow(Number(e.target.value))}
                      className="bg-gray-900 border border-gray-700 p-2 rounded text-white"
                    />
                  </label>
                </div>
              </div>
            </div>

            <p className="text-gray-400 mt-6">
              These values will be used when you run a backtest from the
              Backtest page.
            </p>
          </div>
        )}

        {/* SETTINGS */}
        {page === "settings" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <p>Configure risk management parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
