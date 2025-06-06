import StorageLike from "@/resources/users/interfaces/storage.interface";

class NoopStorage implements StorageLike {
    getItem(_key: string): string | null { return null; }
    setItem(_key: string, _value: string): void {}
    removeItem(_key: string): void {}
}

export default NoopStorage;
