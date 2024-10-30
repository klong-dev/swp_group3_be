const validateCard = (card_number, card_name, bank_name) => {
    if (!card_number || !card_name) {
        return { error_code: 1, message: "All fields must be filled" };
    }
    if (card_number.length !== 16) {
        return { error_code: 2, message: "Card number must be 16 digits" };
    }
    if (card_name.length < 3) {
        return { error_code: 3, message: "Card name must be at least 3 characters" };
    }
    if (!/^[0-9]+$/.test(card_number)) {
        return { error_code: 4, message: "Card number must be a number" };
    }
    if (!/^[a-zA-Z ]+$/.test(card_name)) {
        return { error_code: 5, message: "Card name must be a string" };
    }
    if (!bank_name) {
        return { error_code: 6, message: "Bank name must be filled" };
    }
    if (bank_name.length < 3) {
        return { error_code: 7, message: "Bank name must be at least 3 characters" };
    }
    if (!/^[a-zA-Z ]+$/.test(bank_name)) {
        return { error_code: 8, message: "Bank name must be a string" };
    }
    return null;
}

module.exports = { validateCard };