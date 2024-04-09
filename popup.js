import config from "./config.json" with {type: "json"};


const orderNumber = document.getElementById("order-number");
const orderButton = document.getElementById("order-button");
let orderContainer = document.getElementById("order-container");
let orderDataList = document.getElementById("order");

const regex = /^\d+$/;

let orderNumberValue;

const getItemLocalStorage = () => {
    return localStorage.getItem('request-data') !== null ? localStorage.getItem('request-data').split(" ") : []
}

const insertDateFromLocalStorage = (itemLocalStorage) => {

    for (const itemLocalStorageElement of itemLocalStorage) {
        console.log(itemLocalStorageElement);

        let option = document.createElement("option");

        option.value = itemLocalStorageElement;
        option.textContent = itemLocalStorageElement;

        orderDataList.appendChild(option);
    }
}

const itemLocalStorage = getItemLocalStorage();
insertDateFromLocalStorage(itemLocalStorage);



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
            setToLocalStorage();
            orderContainer.innerHTML = `<div id="order-result">${(isOrderFound(data))? insertData(data): "<p class='result__notfound'>Замовлення не знайдено</p>"}</div>`

        })
        .catch(console.error);
}

const setToLocalStorage = () => {
    const requestDataJson = localStorage.getItem('request-data');
    // console.log(requestDataJson);
    let requestData = requestDataJson !== null ? JSON.parse(requestDataJson) : "";
    if (!requestData.includes(orderNumberValue)) {
        requestData += orderNumberValue + " ";
    }
    localStorage.setItem('request-data', JSON.stringify(requestData));
}

