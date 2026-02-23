import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DreamWriterDB extends DBSchema {
    settings: {
        key: string;
        value: any;
    };
    novels: {
        key: string;
        value: {
            id: string;
            title: string;
            description: string;
            genre: string;
            outline: string;
            createdAt: number;
            updatedAt: number;
        };
        indexes: { 'by-updated': number };
    };
    characters: {
        key: string;
        value: {
            id: string;
            novelId: string;
            name: string;
            role: string;
            description: string;
            traits: string[];
        };
        indexes: { 'by-novel': string };
    };
    chapters: {
        key: string;
        value: {
            id: string;
            novelId: string;
            title: string;
            content: string;
            order: number;
            status: 'draft' | 'generating' | 'completed';
        };
        indexes: { 'by-novel': string };
    };
}

let dbPromise: Promise<IDBPDatabase<DreamWriterDB>> | null = null;

export async function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<DreamWriterDB>('DreamWriter', 1, {
            upgrade(db) {
                db.createObjectStore('settings');

                const novelStore = db.createObjectStore('novels', { keyPath: 'id' });
                novelStore.createIndex('by-updated', 'updatedAt');

                const characterStore = db.createObjectStore('characters', { keyPath: 'id' });
                characterStore.createIndex('by-novel', 'novelId');

                const chapterStore = db.createObjectStore('chapters', { keyPath: 'id' });
                chapterStore.createIndex('by-novel', 'novelId');
            },
        });
    }
    return dbPromise;
}

// Settings wrappers
export async function getSetting<T>(key: string): Promise<T | undefined> {
    const db = await getDB();
    return db.get('settings', key) as Promise<T | undefined>;
}

export async function setSetting(key: string, value: any): Promise<void> {
    const db = await getDB();
    await db.put('settings', value, key);
}
