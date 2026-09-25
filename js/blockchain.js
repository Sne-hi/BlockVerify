let provider;
let signer;
let contract;

const CONTRACT_ADDRESS = "0x561c423D3c6aCb08974632edA3f542Bd5A006530";

const CONTRACT_ABI = [
    "function productCount() view returns (uint256)",

    "function registerProduct(string,string,string,string)",

    "function transferOwnership(uint256,address)",

    "function markAsSold(uint256)",

    "function flagProduct(uint256)",

    "function getProduct(uint256) view returns (tuple(uint256 id, string name, string serialNumber, string batchNumber, string category, address manufacturer, address currentOwner, bool registered, uint8 status))",

    "function getOwnershipHistory(uint256) view returns (tuple(address owner, uint256 timestamp)[])",

    "function products(uint256) view returns (uint256 id, string name, string serialNumber, string batchNumber, string category, address manufacturer, address currentOwner, bool registered, uint8 status)"
];


async function connectWallet() {

    console.log("Connect Wallet clicked");

    // Check MetaMask
    if (!window.ethereum) {
        alert("MetaMask was not detected. Please check that the MetaMask extension is enabled for this site.");
        console.error("window.ethereum is not available");
        return;
    }

    // Check ethers.js
    if (typeof ethers === "undefined") {
        alert("ethers.js did not load.");
        console.error("ethers.js is undefined");
        return;
    }

    try {

        console.log("MetaMask detected:", window.ethereum);

        provider = new ethers.BrowserProvider(window.ethereum);

        console.log("Requesting wallet connection...");

        await provider.send("eth_requestAccounts", []);

        signer = await provider.getSigner();

        const address = await signer.getAddress();

        console.log("Wallet connected:", address);

        contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
        );

        document.getElementById("connectWallet").innerText =
            address.substring(0, 6) +
            "..." +
            address.substring(address.length - 4);

    } catch (error) {

        console.error("Wallet connection error:", error);

        alert(
            "Wallet connection failed:\n\n" +
            (error.message || error)
        );
    }
}


document
    .getElementById("connectWallet")
    .addEventListener("click", connectWallet);

async function getProductCount() {

    try {

        if (!contract) {
            alert("Please connect your wallet first.");
            return;
        }

        const count = await contract.productCount();

        console.log("Total products:", count.toString());

        alert("Total products registered: " + count.toString());

    } catch (error) {

        console.error("Error reading product count:", error);

        alert("Could not read product count.");

    }
}