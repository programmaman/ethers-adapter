import assert from 'node:assert/strict';
import test from 'node:test';
import { Interface } from 'ethers';
import {
    createEthersAbiCodec,
    decodeEthersError,
    extractEthersRevertData,
} from '../src/index.js';
import { TEST_ABI } from './fixtures.js';

const codec = createEthersAbiCodec(TEST_ABI);
const iface = new Interface(TEST_ABI);

test('decodes custom errors', () => {
    const data = iface.encodeErrorResult('NotEnoughFee', [3n, 5n]);
    assert.deepEqual(codec.decodeError(data as `0x${string}`), {
        name: 'NotEnoughFee',
        args: [3n, 5n],
    });
});

test('decodes standard errors', () => {
    const errorData = iface.encodeErrorResult('Error', ['no']);
    const panicData = iface.encodeErrorResult('Panic', [0x11n]);

    assert.deepEqual(codec.decodeError(errorData as `0x${string}`), {
        name: 'Error',
        args: ['no'],
    });
    assert.deepEqual(codec.decodeError(panicData as `0x${string}`), {
        name: 'Panic',
        args: [0x11n],
    });
});

test('returns undefined for unknown selectors', () => {
    assert.equal(codec.decodeError('0x12345678' as `0x${string}`), undefined);
});

test('extracts nested revert data', () => {
    const data = iface.encodeErrorResult('NotOwner', []);
    const error = { code: 'CALL_EXCEPTION', data };

    assert.equal(extractEthersRevertData(error), data);
    assert.deepEqual(decodeEthersError(error, codec), {
        name: 'NotOwner',
        args: [],
    });
});

test('ignores non-Ethers errors', () => {
    assert.equal(extractEthersRevertData(new Error('0x12345678')), undefined);
});
