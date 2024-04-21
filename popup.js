import config from "./config.json" with {type: "json"};


const orderNumber = document.getElementById("order-number");
const orderButton = document.getElementById("order-button");
let orderContainer = document.getElementById("order-container");
let orderStorage = document.getElementById("storage-container");

const regex = /^\d+$/;

let orderNumberValue;
orderNumber.addEventListener("change", (event) => {
    orderNumber.textContent = event.target.value;
});
orderButton.addEventListener("click", () => {
    orderNumberValue = orderNumber.value;

    if (isValid(orderNumberValue)) {
        const url = createUrl(orderNumberValue);

        fetchOrderTrackingData(url).then(response => {
            console.log(response);
            orderContainer.innerHTML = `<div id="order-result">${(isOrderFound(response))
                ? insertData(response)
                : "<p class='result__notfound'>Замовлення не знайдено</p>"}</div>`;
        });

        const requestData = setToLocalStorage();
        if (!requestData.includes(orderNumberValue)) {
            requestData.push(orderNumberValue);
        }

        localStorage.setItem('request-data', JSON.stringify(requestData));
    }
});

let itemsLocalStorage = getItemsLocalStorage();
let filteredItems = await filterRequestData(itemsLocalStorage);

localStorage.setItem('request-data', JSON.stringify(filteredItems));


insertDataFromLocalStorage(filteredItems);

function getItemsLocalStorage(){
    return localStorage.getItem('request-data') !== null ? JSON.parse(localStorage.getItem('request-data')): [];
}
async function filterRequestData (itemLocalStorage) {
    let filteredItems = [];

    for (const orderNValue of itemLocalStorage) {
        await fetchOrderTrackingData(createUrl(orderNValue)).then(response => {
            if (response.result?.status === 'success') {
                filteredItems.push(orderNValue);
            }
        });
    }

    return filteredItems;
}
function insertDataFromLocalStorage(itemLocalStorage){
    for (const itemLocalStorageElement of itemLocalStorage) {
        let buttonElement = document.createElement("button");
        let imgElement = document.createElement("img");

        imgElement.src = "images/trash.png";

        buttonElement.textContent = itemLocalStorageElement;

        buttonElement.classList.add("btn");
        imgElement.classList.add("btn__img");


        buttonElement.addEventListener("click", function() {
            orderNumber.value = itemLocalStorageElement;

        });

        imgElement.addEventListener("click", function(event) {
            orderStorage.removeChild(buttonElement);
            removeOrderFromHistory(itemLocalStorageElement);
            event.stopPropagation();
        });

        buttonElement.appendChild(imgElement);
        orderStorage.appendChild(buttonElement);
    }
}

function removeOrderFromHistory(orderTrackingNumber) {
    let data = getItemsLocalStorage().filter(item => item !== orderTrackingNumber);

    localStorage.setItem('request-data', JSON.stringify(data));
}

const isValid = (orderNumberValue) => regex.test(orderNumberValue);

function createUrl(orderNumberValue) {
    return config.evaApiBaseAddress
            + `/api/checkout-service/order-tracking-data?orderNumber=${orderNumberValue}&storeCode=ua`;
}

const isOrderFound = (data) => {
    return data.result.status !== 'error';
}

const insertData = (data) => {
    let buttonElement = document.createElement("button");
    let imgElement = document.createElement("img");

    imgElement.src = "images/trash.png";

    buttonElement.textContent = orderNumberValue;
    buttonElement.appendChild(imgElement);
    buttonElement.classList.add("btn");
    imgElement.classList.add("btn__img");

    imgElement.addEventListener("click", function(event) {
        orderStorage.removeChild(buttonElement);
        removeOrderFromHistory(orderNumberValue);
        event.stopPropagation();
    });

    let orders = Array.from(orderStorage.children);
    if (!orders.find(orderElement =>
        orderElement.textContent === orderNumberValue)) {
        orderStorage.appendChild(buttonElement);
    }

    const trackingData = data.result?.tracking_data;
    let htmlContent = `<p class="result__number">№${orderNumberValue}</p>`;

    switch (data.result?.tracking_step) {
        case 'parcel_received':
            htmlContent += '<div class="result__success">' +
                '<p class="result__success__description">Отримано</p>' +
                '</div>';
            break;
        case 'new_order':
            htmlContent += '<div class="result__newOrder">' +
                '<p class="result__newOrder__description">Нове замовлення</p>' +
                '</div>';
            break;
        case 'assembling_order':
            htmlContent += '<div class="result__newOrder">' +
                '<p class="result__newOrder__description">Замовлення збирається</p>' +
                '</div>';
            break;
        case 'parcel_sent':
            htmlContent += '<div class="result__newOrder">' +
                '<p class="result__newOrder__description__sent">Замовлення відправлене</p>' +
                '</div>';
            break;
        case 'warehouse_delivered':
            htmlContent += '<div class="result__newOrder">' +
                '<p class="result__newOrder__description__sent">Доставлене в пункт видачі</p>' +
                '</div>';
            break;
        default:
            htmlContent += '<div class="result__cancelled">' +
                '<p class="result__cancelled__description">Скасоване</p>' +
                '</div>';
    }

    htmlContent += '<ul class="result__list">';
    trackingData.forEach(element => {
        htmlContent += `<li class=${
            (element.is_active)
            ?"result__list__active"
            :(element.is_disabled)
                ?"result__list__disabled" 
                :"result__list__active__disabled"
        }>${element.name}</li><p class="list__date">${element.date}</p>`;
    });
    htmlContent += '</ul>';

    return htmlContent;
}

async function fetchOrderTrackingData(url){
    const response = await fetch(url).catch();
    return await response.json();
}

function setToLocalStorage() {
    let requestDataJson = localStorage.getItem('request-data');
    return requestDataJson !== null ? JSON.parse(requestDataJson) : [];
}

