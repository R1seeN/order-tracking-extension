import config from "./config.json" with {type: "json"};


const orderNumber = document.getElementById("order-number");
const orderButton = document.getElementById("order-button");
let orderContainer = document.getElementById("order-container");

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
    let htmlContent = `<p class="result__number">№${orderNumberValue}</p>`;

    if (data.result.tracking_step === 'parcel_received') {
        htmlContent += '<div class="result__success">' +
            '<p class="result__success__description">Отримано</p>' +
            '</div>';

    } else {
        htmlContent += '<div class="result__cancelled">' +
            '<p class="result__cancelled__description">Скасоване</p>' +
            '</div>';
    }

    htmlContent += '<ul class="result__list">';
    trackingData.forEach(element => {
        htmlContent += `<li class=${(element.is_active)? "result__list__active" : "result__list__disabled"}>${element.name}</li><p class="list__date">${element.date}</p>`;
    });
    htmlContent += '</ul>';

    return htmlContent;
}

const fetchOrderTrackingData = (url) => {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            orderContainer.innerHTML = `<div id="order-result">${(isOrderFound(data))? insertData(data): "<p class='result__notfound'>Замовлення не знайдено</p>"}</div>`

        })
        .catch(console.error);
}

const setToLocalStorage = () => {
    localStorage.setItem(orderNumberValue, 'first');
}

