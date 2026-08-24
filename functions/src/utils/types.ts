import { onDocumentCreated } from 'firebase-functions/firestore';

export type DocumentCreatedEventType = Parameters<Parameters<typeof onDocumentCreated>[1]>[0];
