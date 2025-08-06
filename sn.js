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

var shippingOptionSelected = false;

const productData = [
    {
        id: 'boiled',
        name: 'Cajun Boiled Peanuts',
        elementId: 'quantity',
        price: 8,
        priceLabel: '$8.00 - QUART',
        imgSrc: './assets/BoiledBagged.jpg',
        visible: true,
        unitLabel: 'Quarts',
        localOnly: true
    },
    {
        id: 'frozen',
        name: 'Cajun Boiled Peanuts (Frozen)',
        elementId: 'frozenQuantity',
        price: 6,
        priceLabel: '$6.00 - QUART',
        imgSrc: './assets/BoiledBagged.jpg',
        visible: true,
        unitLabel: 'Quarts',
        localOnly: true
    },
    {
        id: 'roastedL',
        name: 'Roasted (12 FL OZ)',
        elementId: 'quantityRl',
        price: 8,
        priceLabel: '$8.00 - 12 FL OZ',
        imgSrc: './assets/Roasted.jpg',
        visible: true,
        unitLabel: 'Containers',
        localOnly: false
    },
    {
        id: 'roastedS',
        name: 'Roasted (8 FL OZ)',
        elementId: 'quantityRs',
        price: 6,
        priceLabel: '$6.00 - 8 FL OZ',
        imgSrc: './assets/Roasted.jpg',
        visible: true,
        unitLabel: 'Containers',
        localOnly: false
    }
];

function renderPayPalButton(order) {

    // Clear previous button to avoid duplicate rendering
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';
    if(!order || order === null) return;
    paypal.Buttons({
        createOrder: function(data, actions) {

            let orderUnits = {
                purchase_units: [{
                    amount: {
                        currency_code: "USD",
                        value: order.total,
                        breakdown: {
                            item_total: { value: order.subtotal, currency_code: "USD" },
                            tax_total: { value: order.taxes, currency_code: "USD" },
                            shipping: { value: order.shippingCost, currency_code: "USD" },
                        }
                    },
                    items: order.cartItems.map(function(lineItem) {
                        return {
                            name: lineItem.product.name,
                            unit_amount: { value: lineItem.product.price.toFixed(2), currency_code: "USD" },
                            quantity: lineItem.qty,
                            description: lineItem.product.unitLabel,
                            category: "PHYSICAL_GOODS"
                        };
                    })
                }]
            };
            return actions.order.create(orderUnits);
        },
        onApprove: function(data, actions) {
            console.log(data);
            actions.order.get().then(function(orderData) {
                submitOrder(orderData, function(success){
                    if(success){
                        return actions.order.capture().then(function(details) {
                            resetForm(["phone", "notes"], updateTotalsSection);
                            console.log("details", details);
                        });
                    }
                })

            });


        }
    }).render('#paypal-button-container');
}


function renderProductSection(containerId, subtotalContainerId, localDelivery) {
    const container = document.getElementById(containerId);
    const subtotalContainer = document.getElementById(subtotalContainerId);
    container.innerHTML = ''; // Clear any existing content
    subtotalContainer.innerHTML = ''; // Clear any existing subtotal rows

    productData.forEach(product => {
        if (!product.visible) return; // Skip rendering if not visible
        if(!localDelivery && product.localOnly) return; // Skip rendering if not available for shipping
        // Product Input Card HTML
        const productCard = `
            <div class="mb-4 col-lg-3 col-md-6 col-sm-6">
                <div class="card h-100 shadow-sm border border-light">
                      <img src="${product.imgSrc}" alt="${product.name} image" class="card-img-top uniform-image" />
                
                      <div class="card-body p-3 d-flex flex-column justify-content-between">
                            <div>
                                  <h5 class="card-title fs-6 fw-bold mb-2">${product.name}</h5>
                                  <p class="text-success fw-bold mb-1">${product.priceLabel}</p>
                                  <div class="mb-2">
                                      <label for="${product.elementId}" class="form-label small"># of ${product.unitLabel}</label>
                                      <input 
                                        onchange="updateTotalsSection()" 
                                        placeholder="ex: 2" 
                                        id="${product.elementId}" 
                                        type="number" 
                                        min="0"
                                        class="form-control form-control-sm" />
                                  </div>                                
                            </div>
                      </div>
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

function deliverySelected() {
    toggleVisibility(document.getElementById("OrderFormDetails"), true);
    toggleVisibility(document.getElementById("OrderTypeSelection"), false);
    renderProductSection('productContainer', 'subtotalBody', true);
    renderPayPalButton(null);
}
function shippingSelected() {
    toggleVisibility(document.getElementById("OrderFormDetails"), true);
    toggleVisibility(document.getElementById("OrderTypeSelection"), false);
    renderProductSection('productContainer', 'subtotalBody', false);
    renderPayPalButton(null);
    shippingOptionSelected = true;
}

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
    if(shippingOptionSelected) return 0;
    return (taxRate * parseFloat(subTotal)).toFixed(2);
}

function calculateTotal(subTotal, taxes, shipping) {
    return (parseFloat(subTotal) + parseFloat(taxes) + shipping).toFixed(2);
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
    let cartItems = [];

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
        if( qty > 0 ){
            cartItems.push({
                qty: qty,
                subtotal: subtotal,
                product: product
            })
        }


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
    const shippingElement  = document.getElementById("ShippingPrice");
    const totalPriceElement = document.getElementById("TotalPrice");
    var shippingCost = 0;
    if(shippingOptionSelected){
        if(subTotal < 20) {
            shippingCost = 3;
        } else {
            shippingCost = 0;
        }
    }

    const taxes = calculateTaxes(subTotal);
    const total = calculateTotal(subTotal, taxes, shippingCost);

    if (subTotalElement) subTotalElement.innerText = subTotal.toFixed(2);
    if (taxesElement) taxesElement.innerText = taxes;
    if (totalPriceElement) totalPriceElement.innerText = total;
    if (shippingElement) shippingElement.innerText = shippingCost;

    if(cartItems && cartItems.length > 0){
        renderPayPalButton({
            taxes: taxes,
            total: total,
            subtotal: subTotal.toFixed(2),
            cartItems: cartItems,
            shippingCost: shippingCost
        });
    } else {
        renderPayPalButton(null);
    }





}


// Main Function to Handle Order Submission
function submitOrder(paypalDetails, callback) {
    const elements = {
        name: paypalDetails.purchase_units[0].shipping.name.full_name,
        email: paypalDetails.payer.email_address,
        phone: document.getElementById("phone"),
        address: `${paypalDetails.purchase_units[0].shipping.address.address_line_1} ${paypalDetails.purchase_units[0].shipping.address.address_line_2}, ${paypalDetails.purchase_units[0].shipping.address.admin_area_2}, ${paypalDetails.purchase_units[0].shipping.address.admin_area_1}, ${paypalDetails.purchase_units[0].shipping.address.postal_code}`,
        note: document.getElementById("notes")
    };

    const errors = [];

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

    const prices = productData.reduce((acc, product) => ({ ...acc, [product.id]: product.price }), {});
    const subTotal = calculateSubtotal(orderQtys, prices);
    var shippingCost = 0;
    if(shippingOptionSelected){
        if(subTotal < 20) {
            shippingCost = (3).toFixed(2);
        } else {
            shippingCost = (0).toFixed(2);
        }
    }

    const taxes = calculateTaxes(subTotal);
    const total = calculateTotal(subTotal, taxes, shippingCost);

    const requestData = {
        name: elements.name + " - " + elements.email,
        qty: productData.map(product => `${product.id}: ${orderQtys[product.id]}`).join(' - '),
        address: elements.address,
        phone: elements.phone.value,
        note: `Subtotal: ${subTotal} - Taxes: ${taxes} - Shipping: ${shippingCost} - Total: ${total} - Notes: ${elements.note.value}`
    };
    console.log("ORDER SUBMITTED ", JSON.stringify(requestData))
    fetchData("https://passwordsecurity.herokuapp.com/api/swampnuts/order", requestData)
        .then(response => {
            response.text().then(res => {
                if (res) {
                    gtag("event", "purchase", {
                        value: subTotal,
                        tax: taxes,
                        currency: "USD",
                        items: productData
                            .filter(product => product.visible && orderQtys[product.id] > 0)
                            .map(product => ({
                                item_id: product.id, // Use item_id instead of product_id if required
                                item_name: product.name, // item_name should map correctly to product.name
                                price: product.price, // Ensure this is the per-item price
                                quantity: orderQtys[product.id]
                            }))
                    });

                    // Display order summary in a modal instead of redirecting
                    let orderSummary = `<h5 class="text-success mb-4">Your Order Has Been Placed!</h5>`;
                    orderSummary += `<p><b>Name:</b> ${elements.name}</p>`;
                    orderSummary += `<p><b>Phone:</b> ${elements.phone.value}</p>`;
                    orderSummary += `<p><b>Address:</b> ${elements.address}</p>`;
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
                                        <tr>
                                            <td><b>Shipping:</b></td>
                                            <td><b>$${shippingCost}</b></td>
                                        </tr>
                                        
                                        <tr class="text-danger">
                                            <td><b>Total:</b></td>
                                            <td><b>$${total}</b></td>
                                        </tr>
                                    </tbody></table>`;
                    const modalContent = document.getElementById('OrderSummaryModalContent');
                    modalContent.innerHTML = orderSummary;
                    new bootstrap.Modal(document.getElementById('OrderSummaryModal')).show();
                    callback(true)
                }
            });
        })
        .catch(() => {
            new bootstrap.Modal(document.getElementById('OrderErrorModal')).show();
            callback(false);
        });
}
