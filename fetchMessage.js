let Mam = require('./lib/mam.node.js');
let IOTA = require('iota.lib.js');
let iota = new IOTA({ provider: `https://testnet140.tangle.works` });

// Init State
// INSERT THE ROOT IN HERE!
let root = 'JKUNLBVAQWQFONQEGP9KMCLSQYFDJWWHRVOIFJCKAFAJVHTVOGDJEFIDTAXNJXUISLGFETXARWSVFIFXT';

// Initialise MAM State
let mamState = Mam.init(iota);

// Publish to tangle
const publish = async packet =>
{
    let trytes = iota.utils.toTrytes(JSON.stringify(packet));
    let message = Mam.create(mamState, trytes);
    mamState = message.state;
    await Mam.attach(message.payload, message.address);
    return message.root
};

// Callback used to pass data out of the fetch
const logData = data => console.log(JSON.parse(iota.utils.fromTrytes(data)));

const execute = async () =>
{
    let resp = await Mam.fetch(root, 'public', null, logData);
    console.log(resp)
};

execute();