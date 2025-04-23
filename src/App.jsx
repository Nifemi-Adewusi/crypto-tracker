import { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default function CryptoPriceTracker() {
  const [coins, setCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);

  // Your CoinMarketCap API key
  // const API_KEY = '114e7b2b-3917-4091-9a77-eec0ef405279';

  const fetchCryptoData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&price_change_percentage=7d,30d"
      );

      const data = await response.json();

      const formattedData = data.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        total_volume: coin.total_volume,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_percentage_7d: coin.price_change_percentage_7d_in_currency,
        price_change_percentage_30d:
          coin.price_change_percentage_30d_in_currency,
        circulating_supply: coin.circulating_supply,
        max_supply: coin.max_supply,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
      }));
      setCoins(formattedData);

      if (selectedCoin) {
        const updatedCoin = formattedData.find(
          (coin) => coin.id === selectedCoin.id
        );
        if (updatedCoin) setSelectedCoin(updatedCoin);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch crypto data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();

    // Set up interval to refresh data every 3 minutes (respecting CMC rate limits)
    const interval = setInterval(fetchCryptoData, 180000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
  };

  const handleRetry = () => {
    fetchCryptoData();
  };

  // Function to format large numbers with appropriate suffixes (K, M, B, T)
  const formatLargeNumber = (num) => {
    if (num >= 1000000000000) {
      return `$${(num / 1000000000000).toFixed(2)}T`;
    } else if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  // Function to format price based on its value
  const formatPrice = (price) => {
    if (price >= 1000) {
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (price >= 1) {
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
    } else if (price >= 0.01) {
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      });
    } else {
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 8,
      });
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="text-blue-500 mr-2" size={24} />
            <h1 className="text-2xl font-bold">CryptoTracker Pro</h1>
          </div>
          <div className="flex items-center relative w-64">
            <input
              type="text"
              placeholder="Search coins..."
              className="bg-gray-100 dark:bg-gray-700 w-full p-2 pl-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-2 text-gray-400" size={16} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 flex-1 flex flex-col md:flex-row gap-4">
        {/* Left Panel - Coin List */}
        <div className="w-full md:w-1/2 lg:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Crypto Assets</h2>
            <div className="flex items-center text-sm">
              {error ? (
                <div className="flex items-center text-yellow-500">
                  <AlertTriangle className="mr-1" size={16} />
                  <span>{error}</span>
                  <button
                    onClick={handleRetry}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <TrendingUp className="mr-1" size={16} />
                  <span>Updated every 3 minutes</span>
                </div>
              )}
            </div>
          </div>

          {isLoading && coins.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left">Asset</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">24h</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">
                      7d
                    </th>
                    <th className="px-4 py-3 text-right">Market Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoins.length > 0 ? (
                    filteredCoins.map((coin) => (
                      <tr
                        key={coin.id}
                        className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          selectedCoin?.id === coin.id
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                        onClick={() => handleCoinSelect(coin)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 mr-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {coin.symbol.substring(0, 3).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{coin.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {coin.symbol.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          ${formatPrice(coin.current_price)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right ${
                            (coin.price_change_percentage_24h || 0) > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {(coin.price_change_percentage_24h || 0) > 0
                            ? "+"
                            : ""}
                          {(coin.price_change_percentage_24h || 0).toFixed(2)}%
                        </td>
                        <td
                          className={`px-4 py-3 text-right hidden sm:table-cell ${
                            (coin.price_change_percentage_7d || 0) > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {(coin.price_change_percentage_7d || 0) > 0
                            ? "+"
                            : ""}
                          {(coin.price_change_percentage_7d || 0).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatLargeNumber(coin.market_cap)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No coins found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel - Coin Details */}
        <div className="w-full md:w-1/2 lg:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          {selectedCoin ? (
            <div>
              <div className="flex items-center mb-4">
                <img
                  src={selectedCoin.image}
                  alt={selectedCoin.name}
                  className="w-12 h-12 mr-3 rounded-full"
                />

                <div>
                  <h2 className="text-xl font-bold">{selectedCoin.name}</h2>
                  <p className="text-gray-500">
                    {selectedCoin.symbol.toUpperCase()}
                  </p>
                </div>
                <div className="ml-auto">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCoin.price_change_percentage_24h > 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {selectedCoin.price_change_percentage_24h > 0 ? "+" : ""}
                    {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500 mb-1">Current Price</p>
                <p className="text-3xl font-bold">
                  ${formatPrice(selectedCoin.current_price)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">24h</p>
                  <p
                    className={`text-sm font-bold ${
                      selectedCoin.price_change_percentage_24h > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {selectedCoin.price_change_percentage_24h > 0 ? "+" : ""}
                    {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">7d</p>
                  <p
                    className={`text-sm font-bold ${
                      selectedCoin.price_change_percentage_7d > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {selectedCoin.price_change_percentage_7d > 0 ? "+" : ""}
                    {selectedCoin.price_change_percentage_7d.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">30d</p>
                  <p
                    className={`text-sm font-bold ${
                      selectedCoin.price_change_percentage_30d > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {selectedCoin.price_change_percentage_30d > 0 ? "+" : ""}
                    {selectedCoin.price_change_percentage_30d.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Market Cap</p>
                  <p className="text-lg font-bold">
                    {formatLargeNumber(selectedCoin.market_cap)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">24h Volume</p>
                  <p className="text-lg font-bold">
                    {formatLargeNumber(selectedCoin.total_volume)}
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-500">24h Low (est.)</p>
                  <p className="text-sm text-gray-500">24h High (est.)</p>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div
                    className="absolute h-4 w-4 bg-blue-500 rounded-full -mt-1"
                    style={{
                      left: `${
                        ((selectedCoin.current_price - selectedCoin.low_24h) /
                          (selectedCoin.high_24h - selectedCoin.low_24h)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs">
                    ${formatPrice(selectedCoin.low_24h)}
                  </p>
                  <p className="text-xs">
                    ${formatPrice(selectedCoin.high_24h)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Market Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500">Market Cap Rank</p>
                    <p className="font-medium">
                      #{selectedCoin.market_cap_rank}
                    </p>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500">Circulating Supply</p>
                    <p className="font-medium">
                      {parseInt(
                        selectedCoin.circulating_supply
                      ).toLocaleString()}{" "}
                      {selectedCoin.symbol.toUpperCase()}
                    </p>
                  </div>
                  {selectedCoin.max_supply && (
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500">Max Supply</p>
                      <p className="font-medium">
                        {parseInt(selectedCoin.max_supply).toLocaleString()}{" "}
                        {selectedCoin.symbol.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
              <DollarSign size={48} className="mb-4 opacity-30" />
              <p className="text-lg">Select a coin to view details</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
        <div className="container mx-auto p-4 text-center text-sm text-gray-500">
          <p>Data provided by CoinMarketCap API • Updates every 3 minutes</p>
        </div>
      </footer>
    </div>
  );
}
