import config from "./config.json" with {type: "json"};


const orderNumber = document.getElementById("order-number");
const orderButton = document.getElementById("order-button");
const orderContainer = document.getElementById("order-result");

const regex = /^\d+$/;

orderNumber.addEventListener("change", (event) => {
    orderNumber.textContent = event.target.value;
});

orderButton.addEventListener("click", () => {
    const orderNumberValue = orderNumber.value;

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

const insertDate = (data) => {
    return data.result;
}

const fetchOrderTrackingData = (url) => {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            orderContainer.innerHTML = `<span id="tracking-board">${(isOrderFound(data)) ? insertDate(data) : "Замовлення не знайдено"}</span>`;
            console.log(data);

        })
        .catch(console.error);
}

