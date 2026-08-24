import { setGlobalOptions } from 'firebase-functions';
import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { onInvitationAccepted, onInvite, sendInvitationEmail } from './invitation/invitation';
import { addQuestionBulk, createQuestion, deleteQuestion } from './question/question';

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
        return await createQuestion(event);
    },
);

/**
 * Decrements cardCount when any question is deleted.
 * Silently skips if the parent project was also deleted.
 */
export const onQuestionDeleted = onDocumentDeleted(
    'projects/{projectId}/questions/{questionId}',
    async (event) => {
        return await deleteQuestion(event);
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
    return await addQuestionBulk(request);
});

// ── Invitation email ──────────────────────────────────────────────────────────

/**
 * Sends an invitation email when a new /invitations document is created.
 * In emulator mode the email is logged but not actually sent.
 */
export const onInvitationCreated = onDocumentCreated(
    {
        document: 'invitations/{invitationId}',
        secrets: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM', 'APP_URL'],
    },
    async (event) => {
        return await sendInvitationEmail(event);
    },
);

// ── Accept invitation (callable) ─────────────────────────────────────────────

/**
 * Atomically creates the projectMember document and marks the invitation as
 * accepted. Must be called by the invited user (email must match).
 */
export const acceptInvitation = onCall(async (request) => {
    return await onInvitationAccepted(request);
});

/**
 * Callable function to create an invitation. Must be called by a project admin.
 * The function will create an invitation document and trigger the email sending.
 */
export const invite = onCall(async (request) => {
    return await onInvite(request);
});
