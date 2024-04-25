import config from "./config.json" with {type: "json"};

const regex = /^\d+$/;

const numberInput = document.getElementById("number-input");
const buttonInput = document.getElementById("button-input");
let storageInput = document.getElementById("storage-input");
let orderResult = document.getElementById("order-result");

let numberInputValue;

printStorageItems(getStorageItems());

numberInput.addEventListener("change", (event) => {
    numberInput.value = event.target.value;
});

buttonInput.addEventListener("click", () => {
    numberInputValue = numberInput.value;
    printStorageItems([numberInputValue]);

    if (isValid()) {
        const url = createUrl();

        getResponse(url).then(response => {
            console.log(response);
            orderResult.innerHTML = isOrderFound(response)
                ? getHtmlResult(response)
                : '<div class="result-not-found"><p>Замовлення не знайдено<p></div>';
        });

        const requestData = getStorageItems();
        if (!requestData.includes(numberInputValue)) {
            requestData.push(numberInputValue);
        }

        localStorage.setItem('request', JSON.stringify(requestData));
    }
});

function isValid() {
    return regex.test(numberInputValue);
}

function createUrl() {
    return config.evaApiBaseAddress
            + `/api/checkout-service/order-tracking-data?orderNumber=${numberInputValue}&storeCode=ua`;
}

function getStorageItems(){
    const items = localStorage.getItem('request');

    return (items !== null) ? JSON.parse(items) : [];
}

function isOrderFound(data) {
    return data.result.status !== 'error';
}

function getStatusClass(statusItemStr) {
    if (statusItemStr === "Отримано") {
        return ["status-success", "success"];
    } else if (statusItemStr === "Скасовано") {
        return ["status-canceled", "canceled"];
    } else {
        return ["status-new-order", "new-order"];
    }
}

function getHtmlResult (data) {
    const statusItem = data.result?.tracking_step;
    const trackingData = data.result?.tracking_data;
    const statusItemStr = getStatusItemStr(statusItem);

    let htmlContent = `<p class="result-number">№${numberInputValue}</p>`;

    let [statusClass, img] = getStatusClass(statusItemStr);

    htmlContent +=
        `<div class="${statusClass} status-container">
            <img class="status__img" src="images/${img}.png" alt="success">
            <span>${statusItemStr}</span>
        </div>`;
    

    htmlContent +=
        `<div class="result-container">
            <ul class="result__list">
                ${trackingData.map(item =>
            `<li class="result-list__item">
                <div class="result-list-item__description">
                    <img src="images/${item.is_active? "circle-success": item.is_disable? "circle-new-order" : "circle-canceled"}.png" 
                             alt="circle success"
                             class="result-list-item__img">
                    <span>${item.name}</span>
                </div>
                 <br>
                 <span class="result-list-item__date">${item.date}</span>
            </li>`
        ).join('')}
            </ul>
        </div>`;

    return htmlContent;
}

async function getResponse(url) {
    const response = await fetch(url).catch();

    return await response.json();
}

function getStatusItemStr(statusItem) {
    switch (statusItem) {
        case "parcel_received":
            return "Отримано";

        case "new_order":
            return "Нове замовлення";

        case "assembling_order":
            return "Замовлення збирається";

        case "parcel_sent":
            return "Замовлення відправлене";

        case "warehouse_delivered":
            return "Доставлене в пункт видачі";

        default:
            return "Скасовано";
    }
}

function printStorageItems(storageItems){
    for (const storageItem of storageItems) {
        let storageButton = createStorageButton(storageItem);

        const items = Array.from(storageInput.children);
        const orderExists = items.some(item => item.textContent === numberInputValue);

        if (!orderExists) {
            storageInput.appendChild(storageButton);
        }
    }
}

function removeStorageItem(storageItem) {
    let updatedStorage = getStorageItems().filter(item => item !== storageItem);

    localStorage.setItem('request', JSON.stringify(updatedStorage));
}

function createStorageButton(storageItem) {
    let button = document.createElement("button");
    let buttonImg = document.createElement("img");
    buttonImg.src = "images/trash.png";

    button.textContent = storageItem;

    button.classList.add("storage__btn");
    buttonImg.classList.add("storage__btn__img");

    button.addEventListener("click",() => {
        numberInput.value = storageItem;
    });

    buttonImg.addEventListener("click",(event) => {
        storageInput.removeChild(button);
        removeStorageItem(storageItem);

        event.stopPropagation();
    });

    button.appendChild(buttonImg);
    return button;
}

