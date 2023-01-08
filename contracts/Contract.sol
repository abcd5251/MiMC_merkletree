// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.5;

interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[6] memory input   // publicSignals
    ) external view returns (bool r);
}

contract Contract{
    
    bool public pass;
    IVerifier public verifier;

    constructor(IVerifier _verifier){
        pass = false;
        verifier = _verifier;
    }

    function ispass() public view returns(bool){
        return pass;
    }

    function verify(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[6] memory input ) public {
        bool hasverifiy = verifier.verifyProof(a, b, c, input);
        require(hasverifiy == true,"Proof is not correct!");
        pass = true;
    }
}
