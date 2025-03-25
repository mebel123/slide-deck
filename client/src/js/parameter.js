export function isSet(name,value,defaultValue) {
    const params = new URLSearchParams(window.location.search);
    if (!params.get(name)) {
        return defaultValue===value;
    }
    return params.get(name)===value;
}
