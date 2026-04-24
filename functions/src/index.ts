/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from 'firebase-functions';
import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

initializeApp();
setGlobalOptions({ maxInstances: 10 });

/**
 * Increments cardCount when a single question is added.
 * Skips documents marked with _bulkImport: true — those are handled by
 * the bulkAddQuestions callable which does a single increment for all.
 */
export const onQuestionCreated = onDocumentCreated(
    'projects/{projectId}/questions/{questionId}',
    async (event) => {
        const data = event.data?.data();
        if (data?.['_bulkImport'] === true) return;

        const { projectId } = event.params;
        await getFirestore()
            .doc(`projects/${projectId}`)
            .update({ cardCount: FieldValue.increment(1) });
        logger.info(`cardCount +1 for project ${projectId}`);
    },
);

/**
 * Decrements cardCount when any question is deleted.
 * Silently skips if the parent project was also deleted.
 */
export const onQuestionDeleted = onDocumentDeleted(
    'projects/{projectId}/questions/{questionId}',
    async (event) => {
        const { projectId } = event.params;
        try {
            await getFirestore()
                .doc(`projects/${projectId}`)
                .update({ cardCount: FieldValue.increment(-1) });
            logger.info(`cardCount -1 for project ${projectId}`);
        } catch {
            // Parent project was already deleted; nothing to update.
        }
    },
);

/**
 * Callable for bulk-adding questions.
 * Accepts an array of questions and writes them all in a single Firestore
 * batch, then updates cardCount once — regardless of how many questions
 * are added (max 499 per call due to Firestore batch limit).
 *
 * Each written document is tagged with _bulkImport: true so the
 * onQuestionCreated trigger skips it and avoids double-counting.
 */
export const bulkAddQuestions = onCall(async (request) => {
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
});
