interface WalletBalance {
  currency: string;
  blockchain: string;
  amount: number;
}
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const DEFAULT_PRIORITY = -99;

const getPriority = (blockchain: string): number => {
  return PRIORITY_MAP[blockchain] || DEFAULT_PRIORITY;
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return balances
      .filter((balance) => getPriority(balance.blockchain) > DEFAULT_PRIORITY && balance.amount > 0)
      .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))
      .map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
      }));
  }, [balances]);

  const rows = useMemo(() => {
    return formattedBalances.map((balance) => {
      const usdValue = (prices[balance.currency] || 0) * balance.amount;
      return (
        <WalletRow
          className="wallet-row"
          key={`${balance.currency}-${balance.blockchain}`}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [formattedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};
