// let's generate private key first
const { randomBytes } = require('crypto');
const secran = require('secure-random');
const sha256 = require('js-sha256');
const bs58 = require('bs58')
// using secp256k1
const secp256k1 = require('secp256k1')
const ripemd160 = require('ripemd160');
var QRCode = require('qrcode')
var opt;
var wallet_list = [];
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var pkey = '';
var addr = '';
menu();
function menu(){
    rl.question('0) Exit 1) Generate Wallet 2) Generate QR for BTC 3) Add XRP Wallet 4) Export Private Key 5) My BTC Wallet Lookup 6) My XRP Wallet Lookup 7) View My wallets  Option: ', opt => {
        console.log(opt);
            switch(parseFloat(opt)){
                case 1:
                    console.log('selected 1');
                    btcx =  generateBTCWallet()
                    pkey = btcx[0];
                    wallet_list.push({'btc': btcx[1]});
                    menu();
                    break;
                case 2:
                    console.log(wallet_list[wallet_list.length-1]['btc'] )
                    if(wallet_list !== null){
                        QRCode.toString(wallet_list[wallet_list.length-1]['btc'],{type: 'terminal'}, function(err, url){
                            console.log(url);
                        })
                        console.log('Generated QR');
                    }else{
                        console.log('Add Wallet first')
                    }
                    menu();
                    break;
                case 3:
                    rl.question('Please input the XRP Wallet: ', xrpw => {
                        wallet_list.push({'xrp': xrpw});
                        console.log('Success');
                        menu();
                    });
                    menu();
                    break;
                case 4:
                    if(pkey===null){
                        console.log('Generate Wallet First');
                        menu();
                        break;
                    }
                    else{
                        console.log(pkey.toString('hex'));
                        menu();
                        break;
                    }
                case 5:
                    if(addr===null){
                        console.log('Generate Wallet First');
                        menu();
                        break;
                    }else{
                        console.log('https://www.blockchain.com/btc/address/'+wallet_list[wallet_list.length-1]['btc']);
                        menu();
                        break;
                    }
                case 6:
                    console.log('https://xrpscan.com/account/'+wallet_list[wallet_list.length-1]['xrp']);
                    menu();
                case 7:
                    console.log(wallet_list);
                    menu();
                default:
                    break;
            }
    });
    
}

function generateBTCWallet(){
    const msg = randomBytes(32);
    //ecc signature

    let privatek;
    do{
        privatek = randomBytes(32);
    }while(!secp256k1.privateKeyVerify(privatek))
    const pkey = privkey(privatek);

    const pubkey = secp256k1.publicKeyCreate(pkey);
    const keys = secp256k1.ecdsaSign(msg, privatek);
    // to verify
    console.log(secp256k1.ecdsaVerify(keys.signature, msg, pubkey));
    console.log("keys: "+ pkey.toString('hex'));
    console.log("pubkey: " + pubkey);
    //public key hashing
    let hash = sha256(Buffer.from(pubkey, 'hex'));
    console.log("pubkeyhash256: "+hash);
    let pubkeyhash = new ripemd160().update(Buffer.from(hash, 'hex')).digest();
    console.log("Pubkeyhash: "+pubkeyhash.toString('hex'))
    // creation of public address
    pubkeyhash = "00" + pubkeyhash.toString('hex');
    const prefix = Buffer.from(pubkeyhash, 'hex');
    console.log("Prefix: "+prefix.toString('hex')) // network bytes to 3
    const resha256 = sha256(prefix);
    console.log("Resha256: " + resha256) // sha256 hash of prefix netowrk bytes
    const resha256buff = sha256(Buffer.from(resha256, 'hex'));
    console.log("Resha256buff: " +resha256buff); // sha256 hash of resha256buff 
    // checking for first byte of buffer of resha256 
    const checksum = resha256buff.substring(0,8);
    //adding prefix to checksum
    console.log("Checksum: " +checksum); // first byte
    var addchk = prefix.toString('hex') + checksum;
    console.log(addchk) // additional
    // getting the address which is base 58 encoding
    const address = bs58.encode(Buffer.from(addchk, 'hex'));
    console.log(address) // base58
    return [pkey, address];
}

function privkey(privatek){
    while(true){
        if(secp256k1.privateKeyVerify(privatek)) return privatek
    }
}

// // creating WIF to introduce to XRP support
// function support(pkey){
//     const prefix = Buffer.from("80"+pkey, 'hex');
//     const resha = sha256(prefix);
//     const resha256buff = sha256(Buffer.from(resha, 'hex'));
//     const checksum = resha256buff.substring(0, 8);
//     const addchk = prefix.toString('hex')+checksum;
//     const supportKey = base58.encode(Buffer.from(addchk, 'hex'));
//     return supportKey
// }


