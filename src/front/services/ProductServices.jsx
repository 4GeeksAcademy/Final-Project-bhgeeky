export const fetchProducts = async () => {
    const response = await fetch("/products.json");
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
}