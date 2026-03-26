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
  ReferenceDot
} from "recharts";

function App() {
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [data, setData] = useState(null);
  const [strategy, setStrategy] = useState("rsi");
  const [useML, setUseML] = useState(false);
  const [loading, setLoading] = useState(false);

  const runBacktest = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://127.0.0.1:8000/backtest/${symbol}?strategy=${strategy}&use_ml=${useML}`,
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data
    ? data.equity_curve.map((value, index) => ({
        //object mapping for (x,y)
        index,
        equity: Number(value),
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <div className="flex-1 p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Algo Trading Dashboard</h1>

        {/* Input Section */}
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

          {/* ML Toggle Switch */}
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

        {data && (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-2xl shadow">
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

              <div className="bg-gray-800 p-4 rounded-2xl shadow">
                <h3 className="text-gray-400">Trades</h3>
                <p className="text-2xl font-bold">{data.metrics.num_trades}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-2xl shadow">
                <h3 className="text-gray-400">Win Rate</h3>
                <p className="text-2xl font-bold text-blue-400">
                  {data.metrics.win_rate.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Advanced Metrics */}
            {data?.advanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-2xl shadow">
                  <h3 className="text-gray-400">Sharpe Ratio</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {data.advanced.sharpe_ratio.toFixed(2)}
                  </p>
                </div>

                <div className="bg-gray-800 p-4 rounded-2xl shadow">
                  <h3 className="text-gray-400">Max Drawdown</h3>
                  <p className="text-2xl font-bold text-red-400">
                    {(data.advanced.max_drawdown * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="bg-gray-800 p-4 rounded-2xl shadow mb-6">
              <h2 className="mb-4 font-semibold">Equity Curve</h2>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#444" />
                  <XAxis dataKey="index" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  {data?.all_trades?.map((t, i) => (
                    <ReferenceDot
                      key={i}
                      x={t.index}
                      y={chartData[t.index]?.equity}
                      r={5}
                      fill={t.type === "BUY" ? "green" : "red"}
                      stroke="none"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trades Table */}
            <div className="bg-gray-800 p-4 rounded-2xl shadow">
              <h2 className="mb-4 font-semibold">Recent Trades</h2>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="py-2">Type</th>
                    <th>Price</th>
                    <th>PnL</th>
                  </tr>
                </thead>

                <tbody>
                  {data.all_trades.map((t, i) => (
                    <tr key={i}>
                      <td>{t.type}</td>
                      <td>{Number(t.price).toFixed(2)}</td>
                      <td
                        className={
                          t.type === "SELL"
                            ? t.pnl > 0
                              ? "text-green-400"
                              : "text-red-400"
                            : "text-gray-400"
                        }
                      >
                        {t.type === "SELL" ? t.pnl.toFixed(2) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
