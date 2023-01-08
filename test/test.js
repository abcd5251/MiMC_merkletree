
const { expect } = require("chai")
const {buildMimc7,buildBabyjub} = require('circomlibjs')
const mimcMerkle = require('./MiMCMerkle')
const { groth16 } = require("snarkjs");
const { unstringifyBigInts } = require("../utils/circuits");


function hexToDec(hex) {
  return parseInt(hex, 16);
}

describe("MiMC_Merkletree test", () => {
  let contract, verifier, mimc7, F, pass

    beforeEach(async() => {
        const Contract = await ethers.getContractFactory("Contract")
        const Verifier = await ethers.getContractFactory("Verifier")

        verifier = await Verifier.deploy()
        contract = await Contract.deploy(verifier.address)

        mimc7 = await buildMimc7()
        const babyJub = await buildBabyjub()
        F = babyJub.F
    })

    describe("Verify pass", function () {
        it("should process 1 (leaf_1)", async () => {
            // leaf in merkletree
            const mimc7 = await buildMimc7()
            const babyJub = await buildBabyjub()
            const F = babyJub.F
            const aa = hexToDec("0xed68b9bf0cB0d6Cdb3901DF586073BD18372E5F9")

            const bb = hexToDec("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
            const cc = hexToDec("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")

            const leaf1 = mimc7.multiHash([1,aa],1)
            const leaf2 = mimc7.multiHash([2,bb],1)
            const leaf3 = mimc7.multiHash([3,cc],1)
            const leaf4 = mimc7.multiHash([4,0],1)
            const leafs = [leaf1,leaf2,leaf3,leaf4] 

            const tree = await mimcMerkle.treeFromLeafArray(leafs);
            const root = tree[0][0];  // root 
            const leaf1Proof = mimcMerkle.getProof(0,tree,leafs); // get leaf1 : leafs[0] proof 
            const leaf1Pos = mimcMerkle.idxToBinaryPos(0,2); // (idx, height )   idx: 0 - 3 

            const inputs = {
                "leaf" : BigInt(F.toObject(leaf1)).toString(),
                "root" : BigInt(F.toObject(root)).toString(),
                "paths2_root" : [BigInt(F.toObject(leaf1Proof[0])).toString(),BigInt(F.toObject(leaf1Proof[1])).toString()],
                "paths2_root_pos" :  leaf1Pos
            }

            // generate proof
            const{proof, publicSignals} = await groth16.fullProve(inputs, "./circuits/check_exist.wasm", "./circuits/circuit_001.zkey")
     
            const calldata = await groth16.exportSolidityCallData(unstringifyBigInts(proof), unstringifyBigInts(publicSignals))
            const args = JSON.parse("[" + calldata + "]")
            //console.log(args)
          
            pass = await contract.pass()
            console.log("before verify: ", pass)
           
            //await contract.verify([proof.pi_a[0],proof.pi_a[1]],[[proof.pi_b[0][0],proof.pi_b[0][1]],[proof.pi_b[1][0],proof.pi_b[1][1]]],[proof.pi_c[0],proof.pi_c[1]],publicSignals)
            await contract.verify(...args)
           
            pass = await contract.pass()
            console.log("after verify: ", pass)
            
    })

    it("should process 2 (leaf_2) ", async () => {
      // leaf in merkletree
      const mimc7 = await buildMimc7()
      const babyJub = await buildBabyjub()
      const F = babyJub.F
      const aa = hexToDec("0xed68b9bf0cB0d6Cdb3901DF586073BD18372E5F9")

      const bb = hexToDec("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      const cc = hexToDec("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")

      const leaf1 = mimc7.multiHash([1,aa],1)
      const leaf2 = mimc7.multiHash([2,bb],1)
      const leaf3 = mimc7.multiHash([3,cc],1)
      const leaf4 = mimc7.multiHash([4,0],1)
      const leafs = [leaf1,leaf2,leaf3,leaf4] 

      const tree = await mimcMerkle.treeFromLeafArray(leafs);
      const root = tree[0][0];  // root 
      const leaf2Proof = mimcMerkle.getProof(1,tree,leafs); // get leaf2 : leafs[0] proof 
      const leaf2Pos = mimcMerkle.idxToBinaryPos(1,2); // (idx, height )   idx: 0 - 3 

      const inputs = {
          "leaf" : BigInt(F.toObject(leaf2)).toString(),
          "root" : BigInt(F.toObject(root)).toString(),
          "paths2_root" : [BigInt(F.toObject(leaf2Proof[0])).toString(),BigInt(F.toObject(leaf2Proof[1])).toString()],
          "paths2_root_pos" :  leaf2Pos
      }

      // generate proof
      const{proof, publicSignals} = await groth16.fullProve(inputs, "./circuits/check_exist.wasm", "./circuits/circuit_001.zkey")

      const calldata = await groth16.exportSolidityCallData(unstringifyBigInts(proof), unstringifyBigInts(publicSignals))
      const args = JSON.parse("[" + calldata + "]")
      
      //console.log(args)

      pass = await contract.pass()
      console.log("before verify: ", pass)
     
      //await contract.verify([proof.pi_a[0],proof.pi_a[1]],[[proof.pi_b[0][0],proof.pi_b[0][1]],[proof.pi_b[1][0],proof.pi_b[1][1]]],[proof.pi_c[0],proof.pi_c[1]],publicSignals)
      await contract.verify(...args)
      
      pass = await contract.pass()
      console.log("after verify: ", pass)
      
})

    it("should process 3 (add new leaf) ", async () => {
      // leaf in merkletree
      const mimc7 = await buildMimc7()
      const babyJub = await buildBabyjub()
      const F = babyJub.F
      const aa = hexToDec("0xed68b9bf0cB0d6Cdb3901DF586073BD18372E5F9")

      const bb = hexToDec("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      const cc = hexToDec("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
      const dd = hexToDec("0x7456743730D3131BD96688267B9C0ca32464cD5C")

      const leaf1 = mimc7.multiHash([1,aa],1)
      const leaf2 = mimc7.multiHash([2,bb],1)
      const leaf3 = mimc7.multiHash([3,cc],1)
      const leaf4 = mimc7.multiHash([4,dd],1)
      const leafs = [leaf1,leaf2,leaf3,leaf4] 

      const tree = await mimcMerkle.treeFromLeafArray(leafs);
      const root = tree[0][0];  // root 
      const leaf2Proof = mimcMerkle.getProof(1,tree,leafs); // get leaf2 : leafs[0] proof 
      const leaf2Pos = mimcMerkle.idxToBinaryPos(1,2); // (idx, height )   idx: 0 - 3 

      const inputs = {
          "leaf" : BigInt(F.toObject(leaf2)).toString(),
          "root" : BigInt(F.toObject(root)).toString(),
          "paths2_root" : [BigInt(F.toObject(leaf2Proof[0])).toString(),BigInt(F.toObject(leaf2Proof[1])).toString()],
          "paths2_root_pos" :  leaf2Pos
      }

      // generate proof
      const{proof, publicSignals} = await groth16.fullProve(inputs, "./circuits/check_exist.wasm", "./circuits/circuit_001.zkey")

      const calldata = await groth16.exportSolidityCallData(unstringifyBigInts(proof), unstringifyBigInts(publicSignals))
      const args = JSON.parse("[" + calldata + "]")
      
      //console.log(args)

      pass = await contract.pass()
      console.log("before verify: ", pass)
    
      //await contract.verify([proof.pi_a[0],proof.pi_a[1]],[[proof.pi_b[0][0],proof.pi_b[0][1]],[proof.pi_b[1][0],proof.pi_b[1][1]]],[proof.pi_c[0],proof.pi_c[1]],publicSignals)
      await contract.verify(...args)
      
      pass = await contract.pass()
      console.log("after verify: ", pass)
      
})
    it("Not process 4 (wrong root) ", async () => {
      // leaf in merkletree
      const mimc7 = await buildMimc7()
      const babyJub = await buildBabyjub()
      const F = babyJub.F
      const aa = hexToDec("0xed68b9bf0cB0d6Cdb3901DF586073BD18372E5F9")

      const bb = hexToDec("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      const cc = hexToDec("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
      const dd = hexToDec("0x7456743730D3131BD96688267B9C0ca32464cD5C")

      const leaf1 = mimc7.multiHash([1,aa],1)
      const leaf2 = mimc7.multiHash([2,bb],1)
      const leaf3 = mimc7.multiHash([3,cc],1)
      const leaf4 = mimc7.multiHash([4,dd],1)
      const temp = mimc7.multiHash([0,0],1)
      const leafs = [leaf1,leaf2,leaf3,leaf4] 
      const past_leafs = [leaf1,leaf2,leaf3, temp]

      const tree_old = await mimcMerkle.treeFromLeafArray(past_leafs); // old tree
      const root = tree_old[0][0];  // root
      const tree  = await mimcMerkle.treeFromLeafArray(leafs); // new tree 

      const leaf2Proof = mimcMerkle.getProof(1,tree,leafs); // get leaf2 : leafs[0] proof 
      const leaf2Pos = mimcMerkle.idxToBinaryPos(1,2); // (idx, height )   idx: 0 - 3 

      const inputs = {
          "leaf" : BigInt(F.toObject(leaf2)).toString(),
          "root" : BigInt(F.toObject(root)).toString(),
          "paths2_root" : [BigInt(F.toObject(leaf2Proof[0])).toString(),BigInt(F.toObject(leaf2Proof[1])).toString()],
          "paths2_root_pos" :  leaf2Pos
      }

      // generate proof
      const{proof, publicSignals} = await groth16.fullProve(inputs, "./circuits/check_exist.wasm", "./circuits/circuit_001.zkey")

      const calldata = await groth16.exportSolidityCallData(unstringifyBigInts(proof), unstringifyBigInts(publicSignals))
      const args = JSON.parse("[" + calldata + "]")
      
      //console.log(args)

      pass = await contract.pass()
      console.log("before verify: ", pass)

      //await contract.verify([proof.pi_a[0],proof.pi_a[1]],[[proof.pi_b[0][0],proof.pi_b[0][1]],[proof.pi_b[1][0],proof.pi_b[1][1]]],[proof.pi_c[0],proof.pi_c[1]],publicSignals)
      await contract.verify(...args)
      
      pass = await contract.pass()
      console.log("after verify: ", pass)
      
    })
})

})