import config from "./config.json" with {type: "json"};


const orderNumber = document.getElementById("order-number");
const orderButton = document.getElementById("order-button");
const orderContainer = document.getElementById("order-container");

const regex = /^\d+$/;

let orderNumberValue;

orderNumber.addEventListener("change", (event) => {
    orderNumber.textContent = event.target.value;
});

orderButton.addEventListener("click", () => {
    orderNumberValue = orderNumber.value;

    if (isValid(orderNumberValue)) {
        const url = createUrl(orderNumberValue);
        fetchOrderTrackingData(url);

    } else {
        orderContainer.innerHTML = "<span>No tracking data available.</span>";
    }
});

const isValid = (orderNumberValue) => regex.test(orderNumberValue);

const createUrl = (orderNumberValue) => {
    return config.evaApiBaseAddress
            + `/api/checkout-service/order-tracking-data?orderNumber=${orderNumberValue}&storeCode=ua`;
}

const isOrderFound = (data) => {
    return data.result.status !== 'error';
}

const insertData = (data) => {
    const trackingData = data.result?.tracking_data;
    let htmlContent = `<p>№${orderNumberValue}</p>`;

    if (data.result.tracking_step === 'parcel_received') {
        htmlContent += '<p>Отримано</p>';
    } else {
        htmlContent += '<p>Скасовано</p>';
    }

    htmlContent += '<ul>';
    trackingData.forEach(element => {
        htmlContent += `<li>${element.name}</li><p>${element.date}</p>`;
    });
    htmlContent += '</ul>';

    return htmlContent;
}

const fetchOrderTrackingData = (url) => {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            orderContainer.innerHTML = `<div id="order-result">${(isOrderFound(data))? insertData(data): "<p>Замовлення не знайдено</p>"}</div>`
        })
        .catch(console.error);
}

