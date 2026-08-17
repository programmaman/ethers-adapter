# Changelog

## Unreleased

## 0.1.0

### Added

- Initial Ethers RPC, ABI, and revert-data adapter.

### Changed

- Replaced the generic RPC request adapter with explicit native Ethers provider operations.
- Map SDK calls to Ethers `call`, `getLogs`, `getNetwork`, and `getBlock` methods.
- Added ABI-aware extraction and decoding for supported Ethers revert-data shapes while preserving native errors.
- Kept event and integer normalization consistent with the SDK codecs.
