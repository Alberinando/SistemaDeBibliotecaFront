const formatTelefone = (value: string) => {
    return value.replace(/\D/g, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

export default formatTelefone;
