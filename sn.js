window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-9951VXX0Q7');


function RecordExternalClick(btnName, location) {
    gtag('event', "external-click - " + btnName, {
        'event_category': location,
        'event_label': btnName
    });
}
function checkPastTime(){
    var pasttime = new Date().getHours() >= 18;
    var element = document.getElementById("toolatedisplay");
    var isHidden = element.classList.contains('d-none');
    if ((pasttime && isHidden) || (!pasttime && !isHidden)) {
        element.classList.toggle('d-none');
    }
}



const productData = [
    {
        id: 'boiled',
        name: 'Cajun Boiled Peanuts',
        elementId: 'quantity',
        price: 8,
        priceLabel: '$8.00 - QUART',
        imgSrc: './assets/BoiledBagged.jpg',
        visible: true,
        unitLabel: 'Quarts'
    },
    {
        id: 'frozen',
        name: 'Cajun Boiled Peanuts (Frozen)',
        elementId: 'frozenQuantity',
        price: 6,
        priceLabel: '$6.00 - QUART',
        imgSrc: './assets/BoiledBagged.jpg',
        visible: true,
        unitLabel: 'Quarts'
    },
    {
        id: 'candiedL',
        name: 'Candied (Large)',
        elementId: 'quantityCaL',
        price: 8,
        priceLabel: '$8.00 - PINT',
        imgSrc: './assets/Candied.jpg',
        visible: false,
        unitLabel: 'Containers'
    },
    {
        id: 'candiedS',
        name: 'Candied (Small)',
        elementId: 'quantityCaS',
        price: 6,
        priceLabel: '$6.00 - CUP',
        imgSrc: './assets/Candied.jpg',
        visible: false,
        unitLabel: 'Containers'
    },
    {
        id: 'roastedL',
        name: 'Roasted (12 FL OZ)',
        elementId: 'quantityRl',
        price: 8,
        priceLabel: '$8.00 - 12 FL OZ',
        imgSrc: './assets/Roasted.jpg',
        visible: true,
        unitLabel: 'Containers'
    },
    {
        id: 'roastedS',
        name: 'Roasted (8 FL OZ)',
        elementId: 'quantityRs',
        price: 6,
        priceLabel: '$6.00 - 8 FL OZ',
        imgSrc: './assets/Roasted.jpg',
        visible: true,
        unitLabel: 'Containers'
    }
];

function renderProductSection(containerId, subtotalContainerId) {
    const container = document.getElementById(containerId);
    const subtotalContainer = document.getElementById(subtotalContainerId);
    container.innerHTML = ''; // Clear any existing content
    subtotalContainer.innerHTML = ''; // Clear any existing subtotal rows

    productData.forEach(product => {
        if (!product.visible) return; // Skip rendering if not visible

        // Product Input Card HTML
        const productCard = `
            <div class="mb-4 col-lg-3 col-md-6 col-sm-6 p-3 border border-light-subtle">
                <label for="${product.elementId}" class="form-label fs-5 fw-bolder mb-0 product-card-label">${product.name}</label>
                <br/>
                <div class="pb-2">
                    <img src="${product.imgSrc}" alt="${product.name} image" class="img-fluid uniform-image"/>
                </div>
                <div class="form form-control">
                    <div>
                        <span class="fw-bold text-success">${product.priceLabel}</span>
                    </div>
                    <strong># of ${product.unitLabel}</strong>
                    <input onchange="updateTotalsSection()" id="${product.elementId}" type="number" class="form-control"/>
                </div>
            </div>

        `;

        // Subtotal Row HTML
        const subtotalRow = `
            <tr id="${product.id}SubTotalRow" class="d-none">
                <td class="fw-bold" id="${product.id}SubTotalQty">0</td>
                <td class="pe-2">${product.name}</td>
                <td class="fw-bold text-end">$<span class="p-0 text-end" id="${product.id}SubTotalPrice">0.00</span></td>
            </tr>
        `;

        // Append to the containers
        container.innerHTML += productCard;
        subtotalContainer.innerHTML += subtotalRow;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderProductSection('productContainer', 'subtotalBody');
    checkPastTime();
    setInterval(function(){
        checkPastTime();
    }, 30000)
});

// Shared Utility Functions
function toggleVisibility(element, isVisible) {
    element.classList.toggle('d-none', !isVisible);
}

function updateElementText(element, value) {
    element.innerText = value;
}

function calculatePrice(quantity, pricePerUnit) {
    return (parseFloat(quantity || 0) * pricePerUnit).toFixed(2);
}

function validateField(value, minLength = 1) {
    return value && value.length >= minLength;
}

function updateValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element with id ${elementId} not found`);
        return; // Skip if the element is not found
    }
    element.value = value;
}

function calculateSubtotal(qtys, prices) {
    return Object.keys(qtys).reduce((sum, key) => sum + parseFloat(calculatePrice(qtys[key], prices[key])), 0).toFixed(2);
}

function calculateTaxes(subTotal, taxRate = 0.0945) {
    return (taxRate * parseFloat(subTotal)).toFixed(2);
}

function calculateTotal(subTotal, taxes) {
    return (parseFloat(subTotal) + parseFloat(taxes)).toFixed(2);
}

function displayErrorMessages(errors, errorBox, errorList) {
    toggleVisibility(errorBox, errors.length > 0);
    if (errors.length > 0) {
        errorList.innerHTML = errors.map(error => `<li>${error}</li>`).join('');
    } else {
        errorList.innerHTML = '';
    }
}

function handleSubtotalRow(qty, price, qtyElement, priceElement, rowElement) {
    if (!rowElement) {
        console.error('handleSubtotalRow error: rowElement is null or undefined');
        return;
    }
    const subtotal = calculatePrice(qty, price);
    toggleVisibility(rowElement, qty > 0);
    if (qty > 0) {
        if (qtyElement) qtyElement.innerText = qty;
        if (priceElement) priceElement.innerText = subtotal;
    }
}

function fetchData(url, data) {
    const queryString = new URLSearchParams(data).toString();
    return fetch(`${url}?${queryString}`, { method: 'GET' });
}

function resetForm(fixedElements, updateTotalsFunction) {
    // Collect dynamic IDs from productData where visible is true
    const productIds = productData
        .filter(product => product.visible) // Filter only visible products
        .map(product => product.elementId) // Get element IDs from productData
        .filter(id => !!id); // Ensure only valid (non-null) IDs are included

    // Combine with fixed elements
    const allElements = [...fixedElements, ...productIds];

    // Reset all elements
    allElements.forEach(id => {
        if (document.getElementById(id)) {
            updateValue(id, '');
        } else {
            console.warn(`Element with id ${id} not found. Skipping reset.`);
        }
    });

    updateTotalsFunction();
}


// Main Function to Update Totals
function updateTotalsSection() {
    let subTotal = 0;

    productData.forEach(product => {
        const qtyElement = document.getElementById(product.elementId);
        if (!qtyElement) {
            console.warn(`Skipping ${product.id} - element not found`);
            return; // Skip if the element is not found
        }

        const qty = parseInt(qtyElement.value || 0);
        const rowElement = document.getElementById(`${product.id}SubTotalRow`);
        const qtyDisplayElement = document.getElementById(`${product.id}SubTotalQty`);
        const priceDisplayElement = document.getElementById(`${product.id}SubTotalPrice`);

        const subtotal = calculatePrice(qty, product.price);
        subTotal += parseFloat(subtotal);

        if (rowElement) {
            toggleVisibility(rowElement, qty > 0);
            if (qty > 0) {
                if (qtyDisplayElement) qtyDisplayElement.innerText = qty;
                if (priceDisplayElement) priceDisplayElement.innerText = subtotal;
            }
        } else {
            console.warn(`Subtotal row for ${product.id} not found`);
        }
    });

    // Update subtotal, taxes, and total
    const subTotalElement = document.getElementById("SubTotalPrice");
    const taxesElement = document.getElementById("TaxesPrice");
    const totalPriceElement = document.getElementById("TotalPrice");

    const taxes = calculateTaxes(subTotal);
    const total = calculateTotal(subTotal, taxes);

    if (subTotalElement) subTotalElement.innerText = subTotal.toFixed(2);
    if (taxesElement) taxesElement.innerText = taxes;
    if (totalPriceElement) totalPriceElement.innerText = total;
}


// Main Function to Handle Order Submission
function submitOrder() {
    const elements = {
        name: document.getElementById("name"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
        address: document.getElementById("address"),
        note: document.getElementById("notes")
    };

    const errors = [];
    if (!validateField(elements.name.value)) errors.push("Name field is blank");
    if (!validateField(elements.phone.value, 7) || !elements.phone.value.match(/^\+?[0-9\s\-().]{7,20}$/)) {
        errors.push("Phone number invalid");
    }

    let orderQtys = {};
    let hasItems = false;
    productData.forEach(product => {
        if (!product.visible) {
            console.log(`Skipping ${product.id} - product is not visible`);
            return; // Skip this iteration if the product is not visible
        }

        const qtyElement = document.getElementById(product.elementId);
        if (!qtyElement) {
            console.warn(`Element with id ${product.elementId} not found. Skipping.`);
            return; // Skip this iteration if the element is not found
        }

        console.log(`Element with id ${product.elementId} found:`, qtyElement);
        const qty = parseInt(qtyElement.value || 0);
        if (qty > 0) hasItems = true;
        orderQtys[product.id] = qty;
    });


    if (!hasItems) {
        errors.push("Please add at least one item to the cart to place an order");
    }

    const errorBox = document.getElementById("FormErrorBox");
    const errorList = document.getElementById("FormErrorList");
    displayErrorMessages(errors, errorBox, errorList);
    if (errors.length > 0) return;

    document.getElementById("submitbutton").setAttribute("disabled", "");
    document.getElementById("submitbutton").innerHTML = "Processing Order";

    const prices = productData.reduce((acc, product) => ({ ...acc, [product.id]: product.price }), {});
    const subTotal = calculateSubtotal(orderQtys, prices);
    const taxes = calculateTaxes(subTotal);
    const total = calculateTotal(subTotal, taxes);

    const requestData = {
        name: elements.name.value + " - " + elements.email.value,
        phone: elements.phone.value,
        qty: productData.map(product => `${product.id}: ${orderQtys[product.id]}`).join(' - '),
        address: elements.address.value,
        note: `Subtotal: ${subTotal} - Taxes: ${taxes} - Total: ${total} - Notes: ${elements.note.value}`
    };
    console.log("ORDER SUBMITTED ", JSON.stringify(requestData))
    fetchData("https://passwordsecurity.herokuapp.com/api/swampnuts/order", requestData)
        .then(response => {
            document.getElementById("submitbutton").innerHTML = "Place Order";
            response.text().then(res => {
                if (res) {
                    gtag("event", "purchase", {
                        value: subTotal,
                        currency: "USD",
                        items: productData
                            .filter(product => product.visible) // Filter out non-visible products
                            .map(product => ({
                                product_id: product.id,
                                product_name: product.id,
                                price: calculatePrice(orderQtys[product.id], product.price),
                                quantity: orderQtys[product.id]
                            }))
                    });

                    // Display order summary in a modal instead of redirecting
                    let orderSummary = `<h5 class="text-success mb-4">Your Order Has Been Placed!</h5>`;
                    orderSummary += `<p><b>Name:</b> ${elements.name.value}</p>`;
                    orderSummary += `<p><b>Phone:</b> ${elements.phone.value}</p>`;
                    orderSummary += `<p><b>Address:</b> ${elements.address.value}</p>`;
                    orderSummary += `<p><b>Notes:</b> ${elements.note.value}</p>`;
                    orderSummary += `<p><b>Items Ordered:</b></p>`;
                    orderSummary += `<ul>`;
                    productData
                        .filter(product => product.visible) // Filter out non-visible products
                        .forEach(product => {
                            const qty = orderQtys[product.id];
                            if (qty > 0) {
                                orderSummary += `
                                                    <li>
                                                        ${product.name}: ${qty} @ $${product.price.toFixed(2)} each = $${(qty * product.price).toFixed(2)}
                                                    </li>
                                                `;
                            }
                        });
                    orderSummary += `</ul>`;
                    orderSummary += `<table><tbody>
                                        <tr class="text-success">
                                            <td><b>Subtotal:</b></td>
                                            <td><b>$${subTotal}</b></td>
                                        </tr>
                                        <tr>
                                            <td><b>Taxes (9.45%):</b></td>
                                            <td><b>$${taxes}</b></td>
                                        </tr>
                                        <tr class="text-danger">
                                            <td><b>Total:</b></td>
                                            <td><b>$${total}</b></td>
                                        </tr>
                                    </tbody></table>`;
                    resetForm(["name", "phone", "address", "notes"], updateTotalsSection);
                    const modalContent = document.getElementById('OrderSummaryModalContent');
                    modalContent.innerHTML = orderSummary;
                    new bootstrap.Modal(document.getElementById('OrderSummaryModal')).show();

                    document.getElementById("submitbutton").removeAttribute("disabled");
                } else {
                    new bootstrap.Modal(document.getElementById('OrderErrorModal')).show();
                }
            });
        })
        .catch(() => {
            document.getElementById("submitbutton").innerHTML = "Place Order";
            document.getElementById("submitbutton").removeAttribute("disabled");
            new bootstrap.Modal(document.getElementById('OrderErrorModal')).show();
        });

    return false;
}
