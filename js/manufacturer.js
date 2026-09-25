async function registerProduct() {

    if (!contract) {
        alert("Please connect your wallet first.");
        return;
    }

    const name =
        document.getElementById("productName").value.trim();

    const serialNumber =
        document.getElementById("serialNumber").value.trim();

    const batchNumber =
        document.getElementById("batchNumber").value.trim();

    const category =
        document.getElementById("category").value.trim();

    if (!name || !serialNumber || !batchNumber || !category) {
        alert("Please fill all product details.");
        return;
    }

    try {

        const result =
            document.getElementById("registrationResult");

        result.innerText =
            "Registering product on blockchain...";

        const tx = await contract.registerProduct(
            name,
            serialNumber,
            batchNumber,
            category
        );

        await tx.wait();

        // Get the newly created product ID
        const productCount =
            await contract.productCount();

        const productId =
            Number(productCount);

        result.innerHTML = `
            <strong>Product registered successfully!</strong><br><br>
            Product ID: ${productId}<br>
            Status: <strong>REGISTERED</strong>
        `;

        // Generate QR code
        generateProductQR(productId);

        // Clear form
        document.getElementById("productName").value = "";
        document.getElementById("serialNumber").value = "";
        document.getElementById("batchNumber").value = "";
        document.getElementById("category").value = "";

    } catch (error) {

        console.error(error);

        document.getElementById("registrationResult").innerText =
            "Registration failed: " +
            (error.reason || error.message);
    }
}


// ==========================================
// Generate QR Code
// ==========================================

function generateProductQR(productId) {

    const qrSection =
        document.getElementById("qrSection");

    const qrContainer =
        document.getElementById("qrcode");

    // Create verification URL
    const qrUrl =
        window.location.origin +
        "/verify.html?id=" +
        productId;

    // Show QR section
    qrSection.style.display = "block";

    // Clear previous QR code
    qrContainer.innerHTML = "";

    // Create clickable link around QR code
    const qrLink =
        document.createElement("a");

    qrLink.href = qrUrl;

    qrLink.target = "_blank";

    qrLink.title =
        "Click to verify this product";

    qrContainer.appendChild(qrLink);

    // Generate QR code
    new QRCode(qrLink, {
        text: qrUrl,
        width: 200,
        height: 200
    });

    // Display clickable verification URL
    document.getElementById("qrUrl").innerHTML = `
        <a
            href="${qrUrl}"
            target="_blank"
            class="qr-link"
        >
            ${qrUrl}
        </a>
    `;

    // Store Product ID for download
    document.getElementById("downloadQR").dataset.productId =
        productId;
}


// ==========================================
// Download QR Code
// ==========================================

function downloadQRCode() {

    const productId =
        document.getElementById("downloadQR").dataset.productId;

    const qrImage =
        document.querySelector("#qrcode img");

    if (!qrImage) {
        alert("QR code not available.");
        return;
    }

    const link =
        document.createElement("a");

    link.href =
        qrImage.src;

    link.download =
        `BlockVerify_Product_${productId}_QR.png`;

    link.click();
}