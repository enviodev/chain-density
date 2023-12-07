import pandas as pd

df = pd.read_parquet('data_eth_0x5bf9dfb1b27c28e5a1d8e5c5385a1a353ec9d118/log.parquet')

print(len(df))
print(df.head(50))