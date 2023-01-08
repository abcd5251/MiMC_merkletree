pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/mimc.circom";

template GetMerkleRoot(k){
    
    signal input leaf;

    signal input paths2_root[k];

    signal input paths2_root_pos[k]; // 01001  0: left, 1 : right


    // the output variable
    signal output out;
    
    // hash of first two entries in Merkle proof
    component hashes[k];
    hashes[0] =  MultiMiMC7(2,91);
    hashes[0].k <== 1;

    paths2_root_pos[0] * (1 - paths2_root_pos[0]) === 0; // must be 0 or 1
    
    hashes[0].in[0] <== leaf -  paths2_root_pos[0] * (leaf - paths2_root[0]) ;
    hashes[0].in[1] <== paths2_root[0] - paths2_root_pos[0] * (paths2_root[0] - leaf);    //   do hash in MultiMiMC7 function


    // constraints depending on the value of the condition cannot be unknown , paths2_root_pos[0] is signal is unknown
    /*
    if(paths2_root_pos[0] >= 0){
        hashes[0].in[0] <== leaf;
        hashes[0].in[1] <== paths2_root[0]; 
    }
    else{
        hashes[0].in[0] <== paths2_root[0];
        hashes[0].in[1] <== leaf;  
    }
    */ 
    
    
    // Non quadratic constraints are not allowed!
    // must in form  A*B + C = 0:
    /*
    hashes[0].in[0] <== leaf * (1 - paths2_root_pos[0])  + (paths2_root_pos[0] * paths2_root[0]);
    hashes[0].in[1] <== (1 - paths2_root_pos[0]) * paths2_root[0] + paths2_root_pos[0] * leaf;  
    */

    // hash of all other node in Merkle proof
    for (var v = 1; v < k; v++){

        paths2_root_pos[v] * (1 - paths2_root_pos[v]) === 0; // must be 0 or 1

        hashes[v] =  MultiMiMC7(2,91);
        hashes[v].k <== 1;

        hashes[v].in[0] <== hashes[v-1].out -  paths2_root_pos[v] * (hashes[v-1].out - paths2_root[v]) ;
        hashes[v].in[1] <== paths2_root[v] - paths2_root_pos[v] * (paths2_root[v] - hashes[v-1].out);    //   do hash in MultiMiMC7 function
    }

    // output computed Merkle root
    out <== hashes[k-1].out;
}

