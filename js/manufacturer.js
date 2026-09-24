async function registerProduct() {

    try {

        // Check wallet connection
        if (!contract || !signer) {

            alert("Please connect your MetaMask wallet first.");

            return;
        }


        // Get values from the form
        const name =
            document.getElementById("productName").value.trim();

        const serialNumber =
            document.getElementById("serialNumber").value.trim();

        const batchNumber =
            document.getElementById("batchNumber").value.trim();

        const category =
            document.getElementById("category").value.trim();


        // Validate fields
        if (!name || !serialNumber || !batchNumber || !category) {

            alert("Please fill in all product details.");

            return;
        }


        // Show message
        document.getElementById("result").innerHTML =
            "Waiting for MetaMask confirmation...";


        // Call smart contract
        const transaction =
            await contract.registerProduct(
                name,
                serialNumber,
                batchNumber,
                category
            );


        console.log("Transaction sent:", transaction.hash);


        document.getElementById("result").innerHTML =
            "Transaction submitted. Waiting for blockchain confirmation...";


        // Wait for transaction confirmation
        await transaction.wait();


        console.log("Product registered successfully.");


        // Get the latest product ID
        const productId =
            await contract.productCount();


        console.log(
            "New Product ID:",
            productId.toString()
        );


        // Display result
        document.getElementById("result").innerHTML =

            "<h3>Product Registered Successfully!</h3>" +

            "<p><strong>Product ID:</strong> " +
            productId.toString() +
            "</p>" +

            "<p><strong>Product Name:</strong> " +
            name +
            "</p>" +

            "<p><strong>Serial Number:</strong> " +
            serialNumber +
            "</p>" +

            "<p><strong>Batch Number:</strong> " +
            batchNumber +
            "</p>" +

            "<p><strong>Category:</strong> " +
            category +
            "</p>";


        // Clear form
        document.getElementById("productName").value = "";
        document.getElementById("serialNumber").value = "";
        document.getElementById("batchNumber").value = "";
        document.getElementById("category").value = "";


    } catch (error) {

        console.error(
            "Product registration error:",
            error
        );


        document.getElementById("result").innerHTML =
            "Product registration failed.";


        alert(
            "Product registration failed:\n\n" +
            (error.reason ||
             error.shortMessage ||
             error.message ||
             error)
        );
    }
}