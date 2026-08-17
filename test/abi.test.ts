import assert from 'node:assert/strict';
import test from 'node:test';
import { Interface } from 'ethers';
import {
    createEthersAbiCodec,
} from '../src/index.js';
import {
    ARBITRATOR,
    GROUP_ID,
    OWNER,
    SUBMITTER,
    TEST_ABI,
} from './fixtures.js';

const codec = createEthersAbiCodec(TEST_ABI);
const iface = new Interface(TEST_ABI);

test('encodes overloaded functions', () => {
    const byNumber = codec.encode('overloaded(uint256)', [4n]);
    const byAddress = codec.encode('overloaded(address)', [OWNER]);

    assert.notEqual(byNumber.slice(0, 10), byAddress.slice(0, 10));
});

test('encodes tuple arguments', () => {
    const encoded = codec.encode(
        'createDispute((bytes32,bytes,uint256,string))',
        [['0x' + '11'.repeat(32), '0x1234', 9n, 'evidence']],
    );

    assert.match(encoded, /^0x[0-9a-f]+$/);
});

test('decodes one-output functions', () => {
    const data = iface.encodeFunctionResult('owner', [OWNER]);
    assert.deepEqual(codec.decode('owner()', data as `0x${string}`), [OWNER]);
});

test('decodes multi-output functions', () => {
    const data = iface.encodeFunctionResult('multi', [7n, OWNER, true]);
    assert.deepEqual(codec.decode('multi()', data as `0x${string}`), [7n, OWNER, true]);
});

test('decodes named indexed events', () => {
    const encoded = iface.encodeEventLog(
        iface.getEvent('Evidence')!,
        [ARBITRATOR, GROUP_ID, SUBMITTER, 'uri'],
    );

    const decoded = codec.decodeEvent(
        'Evidence(address,uint256,address,string)',
        encoded.topics as `0x${string}`[],
        encoded.data as `0x${string}`,
    );

    assert.deepEqual(decoded, {
        _arbitrator: ARBITRATOR,
        _evidenceGroupId: GROUP_ID,
        _party: SUBMITTER,
        _evidence: 'uri',
    });
    assert.equal((decoded as Record<string, unknown>).evidenceUri, undefined);
});

test('decodes zero-argument events', () => {
    const encoded = iface.encodeEventLog(iface.getEvent('Empty')!, []);
    assert.deepEqual(
        codec.decodeEvent('Empty()', encoded.topics as `0x${string}`[], encoded.data as `0x${string}`),
        {},
    );
});

test('rejects malformed data', () => {
    assert.throws(() => codec.decode('owner()', '0x'));
    assert.throws(() => codec.decodeEvent('Evidence(address,uint256,address,string)', [], '0x'));
});
