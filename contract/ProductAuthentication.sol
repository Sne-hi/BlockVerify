// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProductAuthentication {

    // Product status
    enum Status {
        REGISTERED,
        IN_TRANSIT,
        SOLD,
        FLAGGED
    }

    struct Product {
        uint256 id;
        string name;
        string serialNumber;
        string batchNumber;
        string category;
        address manufacturer;
        address currentOwner;
        bool registered;
        Status status;
    }

    struct OwnershipRecord {
        address owner;
        uint256 timestamp;
    }

    uint256 public productCount;

    mapping(uint256 => Product) public products;

    mapping(uint256 => OwnershipRecord[]) private ownershipHistory;

    event ProductRegistered(
        uint256 indexed productId,
        string name,
        address indexed manufacturer
    );

    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed previousOwner,
        address indexed newOwner
    );

    event StatusUpdated(
        uint256 indexed productId,
        Status status
    );

    // Register a new product
    function registerProduct(
        string memory _name,
        string memory _serialNumber,
        string memory _batchNumber,
        string memory _category
    ) public {

        productCount++;

        products[productCount] = Product({
            id: productCount,
            name: _name,
            serialNumber: _serialNumber,
            batchNumber: _batchNumber,
            category: _category,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            registered: true,
            status: Status.REGISTERED
        });

        ownershipHistory[productCount].push(
            OwnershipRecord({
                owner: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit ProductRegistered(
            productCount,
            _name,
            msg.sender
        );
    }

    // Transfer product ownership
    function transferOwnership(
        uint256 _productId,
        address _newOwner
    ) public {

        require(
            products[_productId].registered,
            "Product does not exist"
        );

        require(
            products[_productId].currentOwner == msg.sender,
            "Only current owner can transfer"
        );

        require(
            _newOwner != address(0),
            "Invalid new owner"
        );

        require(
            products[_productId].status != Status.SOLD,
            "Sold product cannot be transferred"
        );

        require(
            products[_productId].status != Status.FLAGGED,
            "Flagged product cannot be transferred"
        );

        address previousOwner =
            products[_productId].currentOwner;

        products[_productId].currentOwner = _newOwner;

        // Product is now in transit
        products[_productId].status = Status.IN_TRANSIT;

        ownershipHistory[_productId].push(
            OwnershipRecord({
                owner: _newOwner,
                timestamp: block.timestamp
            })
        );

        emit OwnershipTransferred(
            _productId,
            previousOwner,
            _newOwner
        );

        emit StatusUpdated(
            _productId,
            Status.IN_TRANSIT
        );
    }

    // Mark product as sold
    function markAsSold(
        uint256 _productId
    ) public {

        require(
            products[_productId].registered,
            "Product does not exist"
        );

        require(
            products[_productId].currentOwner == msg.sender,
            "Only current owner can update status"
        );

        require(
            products[_productId].status != Status.FLAGGED,
            "Flagged product cannot be sold"
        );

        products[_productId].status = Status.SOLD;

        emit StatusUpdated(
            _productId,
            Status.SOLD
        );
    }

    // Flag a product
    function flagProduct(
        uint256 _productId
    ) public {

        require(
            products[_productId].registered,
            "Product does not exist"
        );

        products[_productId].status = Status.FLAGGED;

        emit StatusUpdated(
            _productId,
            Status.FLAGGED
        );
    }

    // Get product details
    function getProduct(
        uint256 _productId
    )
        public
        view
        returns (Product memory)
    {
        require(
            products[_productId].registered,
            "Product not found"
        );

        return products[_productId];
    }

    // Get ownership history
    function getOwnershipHistory(
        uint256 _productId
    )
        public
        view
        returns (OwnershipRecord[] memory)
    {
        require(
            products[_productId].registered,
            "Product not found"
        );

        return ownershipHistory[_productId];
    }
}