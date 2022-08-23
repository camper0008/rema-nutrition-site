const formatBody = (body) => {
    const blackListedIds = [240163, 92915, 92946];

    const res = [];
    for (supercategory of body) {
        if (supercategory.name === "Drikkevarer") continue;
        for (category of supercategory.categories) {
            for (item of category.items) {
                const { id, name, declaration, pricing, nutrition_info } = item;
                const { price, price_per_unit } = pricing;
                if (nutrition_info.length === 0) continue;
                if (blackListedIds.includes(id)) continue;
                const energy = nutrition_info[0].value;
                const protein = nutrition_info[6].value;
                const sugar = nutrition_info[4].value;

                // match numbers, optional whitespace and "kcal"
                // match group the numbers, then get the second object, since [0] is the
                // entire matched paramater then parse into int
                const kcalPer100 = parseInt(energy.match(/(\d+)\s*kcal/)[1]);
                const kcalPerKiloUnit = kcalPer100 * 10;
                const [_, pricePerUnitString, unitString] =
                    price_per_unit.match(/(\d+\.\d+)\s*per\s*(\S*)/);

                const proteinFloat = parseFloat(
                    protein.match(/(\d+\,?\d+)/)[1].replace(",", ".")
                );
                proteinPerKiloUnit = proteinFloat * 10;

                if (unitString.trim() === "Stk.") continue;
                let milliUnitString = "";
                if (unitString === "Kg.") {
                    milliUnitString = "Gram";
                } else {
                    milliUnitString = "Milliliter";
                }

                const pricePerUnit = parseFloat(pricePerUnitString);
                const kiloUnits = price / pricePerUnit;
                const kcalPerPrice = kcalPerKiloUnit / pricePerUnit;
                const proteinPerPrice = proteinPerKiloUnit / pricePerUnit;

                res.push({
                    id,
                    name,
                    declaration,
                    price,
                    pricePerUnit,
                    kcalPer100,
                    protein,
                    sugar,
                    kcalPerPrice,
                    proteinPerPrice,
                    kiloUnits,
                    unitString,
                    milliUnitString,
                    category: category.name,
                    supercategory: supercategory.name,
                });
            }
        }
    }

    return res;
};

const createElement = (tag, parent, className, text) => {
    const element = document.createElement(tag);
    element.className = className ? className : "";
    element.innerHTML = text ? text : "";
    parent.appendChild(element);
    return element;
};

const kcalSortFunction = (productA, productB) =>
    productA.kcalPerPrice < productB.kcalPerPrice;

const proteinSortFunction = (productA, productB) =>
    productA.proteinPerPrice < productB.proteinPerPrice;

const sortMap = {
    protein: proteinSortFunction,
    kcal: kcalSortFunction,
};

const main = async () => {
    const res = await fetch("file.json");
    const rawProducts = await res.json();
    const formattedProducts = formatBody(rawProducts);

    const sortSelect = document.querySelector("#sort-function");

    formattedProducts.sort(sortMap[sortSelect.value]);

    const allProductContainer = document.querySelector(
        "#all-product-container"
    );
    for (product of formattedProducts) {
        const productToggle = createElement("input", allProductContainer);
        productToggle.type = "checkbox";
        productToggle.id = `toggle-visible-${product.id}`;
        productToggle.checked = true;
        const productLabel = createElement(
            "label",
            allProductContainer,
            "product-title",
            `${product.name} <span class="product-id">#${product.id}</span>`
        );
        productLabel.setAttribute("for", `toggle-visible-${product.id}`);

        const productContainer = createElement(
            "div",
            allProductContainer,
            "product-container"
        );
        createElement(
            "p",
            productContainer,
            "",
            `Kcal. pr. kr.: ${Math.round(product.kcalPerPrice)}`
        );
        createElement(
            "p",
            productContainer,
            "",
            `Protein pr. kr.: ${Math.round(product.proteinPerPrice)}`
        );
        createElement(
            "p",
            productContainer,
            "",
            `Kcal pr. 100 ${product.milliUnitString.toLowerCase()}: ${
                product.kcalPer100
            }`
        );
        createElement(
            "p",
            productContainer,
            "",
            `${product.milliUnitString}: ${Math.round(
                product.kiloUnits * 1000
            )}`
        );
        createElement("p", productContainer, "", "Pris: " + product.price);
        createElement(
            "p",
            productContainer,
            "",
            `Kategori: ${product.category} | ${product.supercategory}`
        );

        createElement(
            "p",
            productContainer,
            "",
            `Protein pr. 100 ${product.milliUnitString.toLowerCase()}: ${
                product.protein
            } | Sukker pr. 100 ${product.milliUnitString.toLowerCase()}: ${
                product.sugar
            }`
        );

        createElement(
            "p",
            productContainer,
            "",
            `Ingredienser: ${product.declaration}`
        );

        const productLink = createElement(
            "p",
            productContainer,
            "",
            `<a target="_blank" href="https://shop.rema1000.dk/varer/${product.id}">Se produkt på rema1000.dk</a>`
        );

        createElement("br", allProductContainer);
    }
};
main();
