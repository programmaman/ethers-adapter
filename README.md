# @rakelabs/ethers-adapter

Ethers v6 transport, ABI, and revert-data integration for the Rakelabs SDKs.
The SDK packages remain provider-agnostic; this package adapts an Ethers
provider to their `RpcClient` and `AbiCodec` interfaces.

## Install

```bash
npm install @rakelabs/ethers-adapter ethers
```

## Create SDK dependencies

```ts
import { BrowserProvider } from 'ethers';
import { ABI, Disputes } from '@rakelabs/disputes-sdk';
import {
  createEthersAbiCodec,
  createEthersRpcClient,
} from '@rakelabs/ethers-adapter';

const provider = new BrowserProvider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = await provider.getSigner();
const walletAddress = await signer.getAddress();

const rpcClient = createEthersRpcClient(provider);
const codec = createEthersAbiCodec(ABI);
const disputes = await Disputes.fromRpc(rpcClient, { codec, walletAddress });
```

`createEthersRpcClient` maps the provider's read operations to `call`,
`getLogs`, `getChainId`, and `getBlock`. `createEthersAbiCodec` handles ABI
encoding, decoding, events, and custom errors.

## Error handling

Use `codec.decodeError(rawData)` when your application already has raw revert
bytes. Use `extractEthersRevertData(error)` or
`decodeEthersError(error, codec)` for Ethers- or wallet-wrapped exceptions.

## Signing boundary

The adapter does not own a signer and does not broadcast transactions. SDK
methods return unsigned `PreparedTx` values; pass their `to`, `data`, and
`value` fields to the Ethers signer owned by your application.

This package contains no protocol ABIs. Import each ABI from the SDK that owns
the contract you are using.
