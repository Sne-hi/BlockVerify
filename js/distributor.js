// Load product details
async function loadProduct() {

    if (!contract) {
        alert("Please connect your wallet first.");
        return;
    }

    const productId =
        document.getElementById("productId").value.trim();

    const result =
        document.getElementById("productDetails");

    if (!productId) {
        result.innerHTML =
            "<p>Please enter a Product ID.</p>";
        return;
    }

    try {

        result.innerHTML =
            "<p>Loading product from blockchain...</p>";

        const product =
            await contract.getProduct(productId);

        const status =
            getStatusText(product.status);

        result.innerHTML = `
            <div class="verification-card">

                <h2>Product Details</h2>

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
                    <strong>Status:</strong>
                    <span class="product-status">
                        ${status}
                    </span>
                </p>

            </div>
        `;

        await loadOwnershipHistory(productId);

    } catch (error) {

        console.error(error);

        result.innerHTML = `
            <div class="verification-card">
                <h2>Product Not Found</h2>
                <p>
                    Could not find Product ID ${productId}.
                </p>
            </div>
        `;
    }
}


// Convert status number to readable text
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


// Transfer product ownership
async function transferProduct() {

    if (!contract) {
        alert("Please connect your wallet first.");
        return;
    }

    const productId =
        document.getElementById("productId").value.trim();

    const newOwner =
        document.getElementById("newOwner").value.trim();

    const result =
        document.getElementById("transferResult");

    if (!productId) {
        result.innerText =
            "Please enter a Product ID.";
        return;
    }

    if (!ethers.isAddress(newOwner)) {
        result.innerText =
            "Please enter a valid wallet address.";
        return;
    }

    try {

        result.innerText =
            "Transferring ownership...";

        const tx =
            await contract.transferOwnership(
                productId,
                newOwner
            );

        await tx.wait();

        result.innerHTML = `
            <strong>Ownership transferred successfully.</strong><br>
            Product Status: <strong>IN TRANSIT</strong>
        `;

        document.getElementById("newOwner").value = "";

        // Refresh product details
        await loadProduct();

    } catch (error) {

        console.error(error);

        result.innerText =
            "Transfer failed: " +
            (error.reason || error.message);
    }
}


// Mark product as sold
async function markProductAsSold() {

    if (!contract) {
        alert("Please connect your wallet first.");
        return;
    }

    const productId =
        document.getElementById("productId").value.trim();

    const result =
        document.getElementById("transferResult");

    if (!productId) {
        result.innerText =
            "Please enter a Product ID.";
        return;
    }

    try {

        result.innerText =
            "Marking product as SOLD...";

        const tx =
            await contract.markAsSold(productId);

        await tx.wait();

        result.innerHTML = `
            <strong>Product marked as SOLD.</strong><br>
            Product Status: <strong>SOLD</strong>
        `;

        await loadProduct();

    } catch (error) {

        console.error(error);

        result.innerText =
            "Could not mark product as sold: " +
            (error.reason || error.message);
    }
}


// Flag product
async function flagProductFromDashboard() {

    if (!contract) {
        alert("Please connect your wallet first.");
        return;
    }

    const productId =
        document.getElementById("productId").value.trim();

    const result =
        document.getElementById("transferResult");

    if (!productId) {
        result.innerText =
            "Please enter a Product ID.";
        return;
    }

    try {

        result.innerText =
            "Flagging product...";

        const tx =
            await contract.flagProduct(productId);

        await tx.wait();

        result.innerHTML = `
            <strong>Product flagged successfully.</strong><br>
            Product Status: <strong>FLAGGED</strong>
        `;

        await loadProduct();

    } catch (error) {

        console.error(error);

        result.innerText =
            "Could not flag product: " +
            (error.reason || error.message);
    }
}


// Load ownership history
async function loadOwnershipHistory(productId) {

    const container =
        document.getElementById("ownershipHistory");

    if (!container) {
        return;
    }

    try {

        const history =
            await contract.getOwnershipHistory(productId);

        let html =
            "<h3>Ownership History</h3>";

        if (history.length === 0) {

            html +=
                "<p>No ownership history available.</p>";

        } else {

            html += "<ul>";

            history.forEach((record, index) => {

                const timestamp =
                    new Date(
                        Number(record.timestamp) * 1000
                    ).toLocaleString();

                html += `
                    <li>
                        <strong>Owner ${index + 1}:</strong>
                        ${record.owner}
                        <br>
                        <small>${timestamp}</small>
                    </li>
                `;
            });

            html += "</ul>";
        }

        container.innerHTML = html;

    } catch (error) {

        console.error(
            "Could not load ownership history:",
            error
        );
    }
}


// Button events
document.addEventListener(
    "DOMContentLoaded",
    function () {

        const viewButton =
            document.getElementById("viewProduct");

        const transferButton =
            document.getElementById("transferOwnership");

        const soldButton =
            document.getElementById("markAsSold");

        const flagButton =
            document.getElementById("flagProduct");

        if (viewButton) {
            viewButton.addEventListener(
                "click",
                loadProduct
            );
        }

        if (transferButton) {
            transferButton.addEventListener(
                "click",
                transferProduct
            );
        }

        if (soldButton) {
            soldButton.addEventListener(
                "click",
                markProductAsSold
            );
        }

        if (flagButton) {
            flagButton.addEventListener(
                "click",
                flagProductFromDashboard
            );
        }
    }
);

async function loadProduct() {

    const productId =
        document.getElementById("productId")
            .value
            .trim();

    if (!productId) {
        alert("Please enter a Product ID.");
        return;
    }

    if (!contract) {
        alert("Please connect your wallet first.");
        return;
    }

    try {

        const product =
            await contract.getProduct(productId);


        const status =
            getStatusText(product.status);


        const details =
            document.getElementById(
                "productDetails"
            );


        details.innerHTML = `

            <div class="product-field">
                <strong>Product ID</strong>
                <span>${product.id}</span>
            </div>

            <div class="product-field">
                <strong>Product Name</strong>
                <span>${product.name}</span>
            </div>

            <div class="product-field">
                <strong>Serial Number</strong>
                <span>${product.serialNumber}</span>
            </div>

            <div class="product-field">
                <strong>Batch Number</strong>
                <span>${product.batchNumber}</span>
            </div>

            <div class="product-field">
                <strong>Category</strong>
                <span>${product.category}</span>
            </div>

            <div class="product-field">
                <strong>Manufacturer</strong>
                <span>${product.manufacturer}</span>
            </div>

            <div class="product-field">
                <strong>Current Owner</strong>
                <span>${product.currentOwner}</span>
            </div>

            <div class="product-field">
                <strong>Status</strong>
                <span>
                    <span class="status-badge status-${status.toLowerCase().replace(" ", "-")}">
                        ${status}
                    </span>
                </span>
            </div>

        `;


        document.getElementById(
            "productDetailsContainer"
        ).style.display = "block";


        // Generate QR
        generateDistributorQR(
            productId
        );


        // Load ownership history
        await loadOwnershipHistory(
            productId
        );


    } catch (error) {

        console.error(error);

        document.getElementById(
            "productDetails"
        ).innerHTML = `
            <div class="fake-product verification-card">
                <h2>Product Not Found</h2>
                <p>
                    No registered product was found
                    for Product ID ${productId}.
                </p>
            </div>
        `;
    }
}

function generateDistributorQR(productId) {

    const qrSection =
        document.getElementById(
            "productQRSection"
        );

    const qrContainer =
        document.getElementById(
            "productQR"
        );

    const qrLink =
        document.getElementById(
            "productQRLink"
        );


    if (
        !qrSection ||
        !qrContainer ||
        !qrLink
    ) {
        return;
    }


    const qrUrl =
        window.location.origin +
        "/verify.html?id=" +
        productId;


    qrSection.style.display = "flex";


    qrContainer.innerHTML = "";
    qrLink.innerHTML = "";


    const link =
        document.createElement("a");

    link.href = qrUrl;
    link.target = "_blank";

    link.title =
        "Click to verify this product";


    qrContainer.appendChild(link);


    new QRCode(link, {

        text: qrUrl,

        width: 200,

        height: 200

    });


    qrLink.innerHTML = `
        <a
            href="${qrUrl}"
            target="_blank"
            class="qr-link">

            Verify Product ↗

        </a>
    `;
}