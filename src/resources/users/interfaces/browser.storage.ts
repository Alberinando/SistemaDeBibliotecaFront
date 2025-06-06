import StorageLike from "@/resources/users/interfaces/storage.interface";

class BrowserStorage implements StorageLike {
    getItem(key: string): string | null {
        return window.localStorage.getItem(key);
    }
    setItem(key: string, value: string): void {
        window.localStorage.setItem(key, value);
    }
    removeItem(key: string): void {
        window.localStorage.removeItem(key);
    }
}

export default BrowserStorage;
