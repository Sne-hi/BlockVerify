// ==========================================
// Read-only blockchain connection
// ==========================================

const readProvider =
    new ethers.JsonRpcProvider(
        "https://ethereum-sepolia-rpc.publicnode.com"
    );

const readContract =
    new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        readProvider
    );


// ==========================================
// Product Status
// ==========================================

function getStatusText(status) {

    const statusNumber = Number(status);

    switch (statusNumber) {

        case 0:
            return "REGISTERED";

        case 1:
            return "IN TRANSIT";

        case 2:
            return "SOLD";

        case 3:
            return "FLAGGED";

        default:
            return "UNKNOWN";
    }
}


// ==========================================
// Verify Product
// ==========================================

async function verifyProduct(productIdFromScanner = null) {

    let productId =
        productIdFromScanner;

    if (!productId) {

        productId =
            document
                .getElementById("productId")
                .value
                .trim();
    }

    const result =
        document.getElementById(
            "verificationResult"
        );


    if (!productId) {

        result.innerHTML = `
            <div class="verification-card">
                <h2>Product ID Required</h2>
                <p>
                    Please scan a QR code or enter
                    a Product ID.
                </p>
            </div>
        `;

        return;
    }


    try {

        result.innerHTML = `
            <div class="verification-card">
                <h2>Checking Blockchain...</h2>
                <p>
                    Please wait while we verify
                    the product.
                </p>
            </div>
        `;


        // Get product from blockchain
        const product =
            await readContract.getProduct(
                productId
            );


        const statusClass =
           Number(product.status) === 0
                ? "status-registered"
                : Number(product.status) === 1
                ? "status-transit"
                : Number(product.status) === 2
                ? "status-sold"
                : "status-flagged";


        // ======================================
        // Determine verification result
        // ======================================

        let verificationTitle;
        let verificationMessage;


        if (Number(product.status) === 3) {

            verificationTitle =
                "⚠ PRODUCT FLAGGED";

            verificationMessage =
                "This product has been flagged in the BlockVerify system.";

        } else {

            verificationTitle =
                "✓ PRODUCT VERIFIED";

            verificationMessage =
                "This product is registered on the BlockVerify blockchain.";
        }


        // ======================================
        // Display Product Information
        // ======================================

        result.innerHTML = `

            <div class="verification-card">

                <div class="verification-status">

                    <h2>
                        ${verificationTitle}
                    </h2>

                    <p>
                        ${verificationMessage}
                    </p>

                </div>


                <h3>Product Details</h3>

                <p>
                    <strong>Product ID:</strong>
                    ${product.id}
                </p>

                <p>
                    <strong>Product Name:</strong>
                    ${product.name}
                </p>

                <p>
                    <strong>Serial Number:</strong>
                    ${product.serialNumber}
                </p>

                <p>
                    <strong>Batch Number:</strong>
                    ${product.batchNumber}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${product.category}
                </p>

                <p>
                    <strong>Manufacturer:</strong>
                    ${product.manufacturer}
                </p>

                <p>
                    <strong>Current Owner:</strong>
                    ${product.currentOwner}
                </p>

                <p>
                    <strong>Blockchain Registered:</strong>
                    ${product.registered ? "Yes" : "No"}
                </p>

                <p>
                    <strong>Product Status:</strong>

                    <span class="product-status">
                        ${status}
                    </span>

                </p>

            </div>
        `;


        // Load ownership history
        await loadCustomerOwnershipHistory(
            productId
        );


    } catch (error) {

        console.error(error);


        result.innerHTML = `

            <div class="verification-card fake-product">

                <h2>
                    ✕ PRODUCT NOT VERIFIED
                </h2>

                <p>
                    This Product ID is not registered
                    on the BlockVerify blockchain.
                </p>

                <p>
                    <strong>Product ID:</strong>
                    ${productId}
                </p>

                <p>
                    The product could not be verified
                    against the blockchain record.
                </p>

            </div>

        `;
    }
}


// ==========================================
// Ownership History
// ==========================================

async function loadCustomerOwnershipHistory(
    productId
) {

    try {

        const history =
            await readContract
                .getOwnershipHistory(
                    productId
                );


        let html =
            `<div class="ownership-history">
                <h3>Ownership History</h3>`;


        if (history.length === 0) {

            html += `
                <p>
                    No ownership history available.
                </p>
            `;

        } else {

            html += "<ul>";


            history.forEach(
                (record, index) => {

                    const timestamp =
                        new Date(
                            Number(
                                record.timestamp
                            ) * 1000
                        ).toLocaleString();


                    html += `

                        <li>

                            <strong>
                                Owner ${index + 1}:
                            </strong>

                            ${record.owner}

                            <br>

                            <small>
                                ${timestamp}
                            </small>

                        </li>

                    `;
                }
            );


            html += "</ul>";
        }


        html += "</div>";


        const result =
            document.getElementById(
                "verificationResult"
            );


        result.innerHTML += html;


    } catch (error) {

        console.error(
            "Could not load ownership history:",
            error
        );
    }
}


// ==========================================
// QR CAMERA SCANNER
// ==========================================

let qrScanner = null;


function startQRScanner() {

    const reader =
        document.getElementById(
            "qr-reader"
        );

    const message =
        document.getElementById(
            "scannerMessage"
        );


    reader.style.display = "block";


    message.innerText =
        "Requesting camera access...";


    qrScanner =
        new Html5Qrcode(
            "qr-reader"
        );


    const config = {

        fps: 10,

        qrbox: {
            width: 250,
            height: 250
        }

    };


    qrScanner.start(

        {
            facingMode: "environment"
        },

        config,


        (decodedText) => {

            console.log(
                "QR Code detected:",
                decodedText
            );


            message.innerText =
                "QR code detected. Verifying product...";


            stopQRScanner();


            // Extract Product ID
            const productId =
                extractProductId(
                    decodedText
                );


            if (!productId) {

                document.getElementById(
                    "verificationResult"
                ).innerHTML = `

                    <div class="verification-card fake-product">

                        <h2>
                            ✕ INVALID QR CODE
                        </h2>

                        <p>
                            This QR code does not
                            contain a valid BlockVerify
                            product ID.
                        </p>

                    </div>

                `;

                return;
            }


            // Put ID into input
            document.getElementById(
                "productId"
            ).value = productId;


            // Verify automatically
            verifyProduct(
                productId
            );

        },


        (errorMessage) => {

            // Scanner continuously produces
            // scan errors while searching.
            // We don't need to display them.
        }

    ).catch((error) => {

        console.error(
            "Camera error:",
            error
        );


        message.innerText =
            "Unable to access camera. Please allow camera permission.";

    });
}


// ==========================================
// Stop QR Scanner
// ==========================================

function stopQRScanner() {

    if (qrScanner) {

        qrScanner.stop()
            .then(() => {

                qrScanner.clear();

                document.getElementById(
                    "qr-reader"
                ).style.display = "none";

            })
            .catch((error) => {

                console.error(
                    "Unable to stop scanner:",
                    error
                );

            });

        qrScanner = null;
    }
}


// ==========================================
// Extract Product ID from QR
// ==========================================

function extractProductId(
    decodedText
) {

    try {

        // Example:
        // http://127.0.0.1:5500/verify.html?id=5

        const url =
            new URL(
                decodedText
            );


        const productId =
            url.searchParams.get(
                "id"
            );


        if (productId) {

            return productId;
        }


    } catch (error) {

        console.log(
            "QR is not a URL."
        );


        // If QR contains only a number
        if (
            /^\d+$/.test(
                decodedText.trim()
            )
        ) {

            return decodedText.trim();
        }

    }


    return null;
}


// ==========================================
// Button Events
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const scanButton =
            document.getElementById(
                "startScanner"
            );


        const verifyButton =
            document.getElementById(
                "verifyButton"
            );


        if (scanButton) {

            scanButton.addEventListener(
                "click",
                startQRScanner
            );
        }


        if (verifyButton) {

            verifyButton.addEventListener(
                "click",
                () => {

                    verifyProduct();

                }
            );
        }


        // ==================================
        // Automatically verify QR URL
        // ==================================

        const urlParams =
            new URLSearchParams(
                window.location.search
            );


        const productId =
            urlParams.get(
                "id"
            );


        if (productId) {

            document.getElementById(
                "productId"
            ).value =
                productId;


            const qrMessage =
                document.getElementById(
                    "qrMessage"
                );


            if (qrMessage) {

                qrMessage.innerText =
                    "Product ID detected from QR code.";

            }


            verifyProduct(
                productId
            );
        }

    }
);