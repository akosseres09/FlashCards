export function toData<T extends Omit<T, 'id'>>(doc: {
    data: T;
    ref: { id: string };
}): T & { id: string } {
    return { ...doc.data, id: doc.ref.id };
}
