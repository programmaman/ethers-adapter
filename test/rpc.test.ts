import assert from 'node:assert/strict';
import test from 'node:test';
import { createEthersRpcClient, type EthersProvider } from '../src/index.js';

test('uses native provider methods for calls, logs, network, and blocks', async () => {
    const calls: unknown[] = [];
    const provider = {
        call(request: unknown) {
            calls.push(['call', request]);
            return Promise.resolve('0xresult');
        },
        getLogs(filter: unknown) {
            calls.push(['logs', filter]);
            return Promise.resolve([{
                address: '0x1',
                topics: ['0x2'],
                data: '0x3',
                transactionHash: '0x4',
                blockNumber: 7,
            }]);
        },
        getNetwork() {
            calls.push(['network']);
            return Promise.resolve({ chainId: 1n });
        },
        getBlock(reference: unknown) {
            calls.push(['block', reference]);
            return Promise.resolve({ number: 8, timestamp: 9 });
        },
    } as unknown as EthersProvider;

    const rpc = createEthersRpcClient(provider);
    assert.equal(await rpc.call({ to: '0x1', data: '0x2', block: 'latest' }), '0xresult');
    assert.deepEqual(await rpc.getLogs({ address: '0x1' }), [{
        address: '0x1', topics: ['0x2'], data: '0x3', transactionHash: '0x4', blockNumber: 7,
    }]);
    assert.equal(await rpc.getChainId(), 1);
    assert.deepEqual(await rpc.getBlock('latest'), { number: 8, timestamp: 9 });
    assert.deepEqual(calls, [
        ['call', { to: '0x1', data: '0x2', blockTag: 'latest' }],
        ['logs', { address: '0x1' }],
        ['network'],
        ['block', 'latest'],
    ]);
});

test('preserves native provider rejection', async () => {
    const error = new Error('provider failed');
    const rpc = createEthersRpcClient({
        call() { return Promise.reject(error); },
        getLogs() { return Promise.resolve([]); },
        getNetwork() { return Promise.resolve({ chainId: 1n }); },
        getBlock() { return Promise.resolve({ number: 1, timestamp: 1 }); },
    } as unknown as EthersProvider);

    await assert.rejects(rpc.call({ to: '0x1', data: '0x2' }), received => received === error);
});
