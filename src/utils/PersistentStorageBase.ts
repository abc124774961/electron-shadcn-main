/**
 *
 */
export class PersistentStorageBase {
    static defaultStorage: Storage = localStorage;

    constructor() {
        //@ts-ignore
        if (this.constructor.__store__) this.__store__ = this.constructor.__store__;
    }

    //需要存储的字段数据
    //@ts-ignore
    private __store__: { [key: string]: { name: string; autoSave: boolean } };
    //@ts-ignore
    private __store_key__: string;

    get store_key(): string {
        return this.__store_key__ ?? this.constructor.name;
    }

    /**
     * 需要保存的storage、子类可以重写
     * @returns
     */
    getStorage(): Storage {
        return PersistentStorageBase.defaultStorage;
    }

    getObjectValueByKey(key: string) {
        const _storage_keyNames = key.split(".");
        const _storage_pKeyName = _storage_keyNames[0];
        const _store = this.getStorage().getItem(_storage_pKeyName);
        if (_store) {
            const _object = JSON.parse(_store);
            if (_storage_keyNames[1]) {
                return _object[_storage_keyNames[1]] ?? {};
            }
            return _object ?? {};
        }
        return {};
    }

    getSaveKey() {
        const _storage_keyNames = this.__store_key__?.split(".") ?? [];
        const _storage_pKeyName = _storage_keyNames[0] ?? "";
        return _storage_pKeyName;
    }

    getCurrentKey() {
        const _keys = this.__store_key__?.split(".") ?? [];
        const _name = _keys[1] ?? this.__store_key__;
        return _name;
    }

    setObjectValueByKey(key: string, value: any) {
        const _storage_keyNames = key.split(".");
        const _storage_pKeyName = _storage_keyNames[0];
        const _store = this.getStorage().getItem(_storage_pKeyName);
        let _saveObject = {};
        if (_store) {
            _saveObject = JSON.parse(_store);
        }
        if (_storage_keyNames[1]) {
            //@ts-ignore
            _saveObject[_storage_keyNames[1]] = value;
        } else {
            _saveObject = value;
        }
        this.getStorage().setItem(_storage_pKeyName, JSON.stringify(_saveObject));
    }

    /**
     * 保存
     */
    save() {
        const _oldObject = this.getObjectValueByKey(this.store_key);
        const _keys = Object.keys(this.__store__ ?? {});
        const _saveObject = this.getObjectValueByKey(this.store_key);
        for (let i = 0; i < _keys.length; i++) {
            const key = _keys[i];
            const value = this.__store__[key];
            //@ts-ignore
            _saveObject[value.name] = this[key] ?? _oldObject[key];
        }
        this.setObjectValueByKey(this.store_key, _saveObject);
        // const valueString = JSON.stringify(
        //   _storage_keyNames[1]
        //     ? {
        //         [_storage_keyNames[1]]: _saveObject,
        //       }
        //     : _saveObject,
        // )
        // this.getStorage().setItem(_storage_pKeyName, valueString)
    }

    /**
     * 初始化、加载本地缓存数据
     */
    init() {
        //支持二级、属性
        // debugger
        const _storage_keyNames = this.store_key.split(".");
        const _storage_pKeyName = _storage_keyNames[0];
        const valueString = this.getStorage().getItem(_storage_pKeyName);

        if (valueString) {
            const _pNodeSaveObject = JSON.parse(valueString);
            const _saveObject =
                (_storage_keyNames[1]
                    ? _pNodeSaveObject[_storage_keyNames[1]]
                    : _pNodeSaveObject) ?? {};
            const _keys = Object.keys(this.__store__);
            for (let i = 0; i < _keys.length; i++) {
                const key = _keys[i];
                const value = _saveObject[this.__store__[key].name];
                //@ts-ignore
                this[key] = value;
            }
        }
    }

    remove() {
        this.getStorage().removeItem(this.store_key);
    }
}

/**
 * 标识需要存储的属性
 * @param target
 * @param key
 * @returns
 */
export function storageProperty(
    target: { autoSave: boolean } | any,
    key?: string | any
): ((target: any, key: string) => void) | any {
    if (key) {
        markStoreProperty(target?.constructor ?? target, key, { autoSave: false });
    } else {
        return markStoreProperty;
    }
}

function markStoreProperty(
    target: any,
    key: string,
    config: PropertyDescriptor & ThisType<any> & { autoSave: boolean }
) {
    const _config = Object.assign({ autoSave: true }, config);
    if (_config.autoSave) {
    }
    if (!target.__store__) target.__store__ = {};
    target.__store__[key] = {
        name: key.replace(/^_/gi, ""),
        autoSave: _config.autoSave,
    };
}
