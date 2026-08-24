import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { DocumentCreatedEventType } from '../utils/types';
import { CallableRequest } from 'firebase-functions/https';

export async function createQuestion(event: DocumentCreatedEventType) {
    const data = event.data?.data();
    if (data?.['_bulkImport'] === true) return;

    const { projectId } = event.params;
    await getFirestore()
        .doc(`projects/${projectId}`)
        .update({ cardCount: FieldValue.increment(1) });

    logger.info(`cardCount +1 for project ${projectId}`);
}

export async function deleteQuestion(event: DocumentCreatedEventType) {
    const { projectId } = event.params;
    try {
        await getFirestore()
            .doc(`projects/${projectId}`)
            .update({ cardCount: FieldValue.increment(-1) });
        logger.info(`cardCount -1 for project ${projectId}`);
    } catch {
        // Parent project was already deleted; nothing to update.
    }
}

export async function addQuestionBulk(request: CallableRequest<any>) {
    const { projectId, questions } = request.data as {
        projectId: string;
        questions: Array<Record<string, unknown>>;
    };

    if (!projectId || !Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid arguments: projectId and non-empty questions[] are required.');
    }

    const firestore = getFirestore();
    const batch = firestore.batch();

    for (const question of questions) {
        const ref = firestore.collection(`projects/${projectId}/questions`).doc();
        batch.set(ref, { ...question, _bulkImport: true });
    }

    batch.update(firestore.doc(`projects/${projectId}`), {
        cardCount: FieldValue.increment(questions.length),
    });

    await batch.commit();
    logger.info(`Bulk added ${questions.length} questions to project ${projectId}`);
}
