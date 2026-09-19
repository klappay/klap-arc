// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.23;

import { Script } from "forge-std/Script.sol";
import { stdJson } from "forge-std/StdJson.sol";

import { ICreateX } from "./ICreateX.sol";
import { SplitsWarehouse } from "../src/vendored/SplitsWarehouse.sol";
import { PullSplitFactory } from "../src/vendored/splitters/pull/PullSplitFactory.sol";
import { PushSplitFactory } from "../src/vendored/splitters/push/PushSplitFactory.sol";

contract DeployKlapArc is Script {
    using stdJson for string;

    ICreateX private constant CREATEX = ICreateX(0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed);

    bytes11 private constant WAREHOUSE_SALT = bytes11(uint88(uint256(keccak256("klap-arc.splitsWarehouse.v1"))));
    bytes11 private constant PULL_FACTORY_SALT = bytes11(uint88(uint256(keccak256("klap-arc.pullSplitFactory.v1"))));
    bytes11 private constant PUSH_FACTORY_SALT = bytes11(uint88(uint256(keccak256("klap-arc.pushSplitFactory.v1"))));

    function run() public {
        address deployer = vm.envAddress("DEPLOYER");
        string memory config = readConfig();

        // Broadcasting explicitly *as* `deployer` (not a bare vm.startBroadcast()) means forge
        // itself refuses to proceed if the signer passed via --account/--private-key doesn't
        // actually correspond to this address — CreateX's own guard silently falls back to an
        // unguarded salt on a mismatch instead of reverting, so this check has to happen here.
        vm.startBroadcast(deployer);

        address warehouse = create3(
            deployer,
            WAREHOUSE_SALT,
            abi.encodePacked(
                type(SplitsWarehouse).creationCode,
                abi.encode(config.readString(".nativeTokenName"), config.readString(".nativeTokenSymbol"))
            )
        );

        address pullFactory =
            create3(deployer, PULL_FACTORY_SALT, abi.encodePacked(type(PullSplitFactory).creationCode, abi.encode(warehouse)));

        address pushFactory =
            create3(deployer, PUSH_FACTORY_SALT, abi.encodePacked(type(PushSplitFactory).creationCode, abi.encode(warehouse)));

        vm.stopBroadcast();

        writeDeployment("SplitsWarehouse", warehouse);
        writeDeployment("PullSplitFactory", pullFactory);
        writeDeployment("PushSplitFactory", pushFactory);
    }

    function create3(address deployer, bytes11 salt, bytes memory initCode) private returns (address) {
        bytes32 guardedSalt = bytes32(abi.encodePacked(deployer, hex"00", salt));
        return CREATEX.deployCreate3(guardedSalt, initCode);
    }

    function readConfig() private view returns (string memory) {
        string memory path =
            string.concat(vm.projectRoot(), "/script/config/", vm.toString(block.chainid), ".json");
        return vm.readFile(path);
    }

    function writeDeployment(string memory name, address deployed) private {
        string memory path =
            string.concat(vm.projectRoot(), "/deployments/", vm.toString(block.chainid), ".json");

        string memory json = vm.exists(path) ? vm.readFile(path) : "{}";
        if (vm.keyExistsJson(json, string.concat(".", name))) {
            vm.writeJson(vm.toString(deployed), path, string.concat(".", name));
        } else {
            string memory root = "root";
            vm.serializeJson(root, json);
            vm.writeJson(vm.serializeAddress(root, name, deployed), path);
        }
    }
}
