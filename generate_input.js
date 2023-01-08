const fs = require('fs')
const {buildMimc7,buildBabyjub} = require('circomlibjs')
const mimcMerkle = require('./test/MiMCMerkle')

function hexToDec(hex) {
    return parseInt(hex, 16);
  }

async function main(){
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

    fs.writeFileSync("./input.json",JSON.stringify(inputs),"utf-8")
}
main()
