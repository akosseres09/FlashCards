import * as nodemailer from 'nodemailer';
import * as logger from 'firebase-functions/logger';
import { defineSecret } from 'firebase-functions/params';
import { CallableRequest, HttpsError } from 'firebase-functions/https';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { DocumentCreatedEventType } from '../utils/types';

// ── SMTP secrets (set via: firebase functions:secrets:set SECRET_NAME) ────────
const smtpHost = defineSecret('SMTP_HOST');
const smtpPort = defineSecret('SMTP_PORT');
const smtpUser = defineSecret('SMTP_USER');
const smtpPassword = defineSecret('SMTP_PASSWORD');
const smtpFrom = defineSecret('SMTP_FROM');
const appUrl = defineSecret('APP_URL');

/**
 * Sends an invitation email when a new /invitations document is created.
 * In emulator mode the email is logged but not actually sent.
 * @param event The Firestore document creation event for an invitation.
 */
export async function sendInvitationEmail(event: DocumentCreatedEventType) {
    const data = event.data?.data();
    if (!data || data['status'] !== 'pending') return;

    const inviteUrl =
        process.env['FUNCTIONS_EMULATOR'] === 'true'
            ? 'http://localhost:4200/invitations'
            : `${appUrl.value()}/invitations`;

    logger.info(
        `Invitation created for ${data['invitedEmail']} to project "${data['projectName']}"`,
    );

    if (process.env['FUNCTIONS_EMULATOR'] === 'true') {
        logger.info(`[Emulator] Skipping email. Invite URL: ${inviteUrl}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost.value(),
        port: parseInt(smtpPort.value(), 10),
        secure: parseInt(smtpPort.value(), 10) === 465,
        auth: {
            user: smtpUser.value(),
            pass: smtpPassword.value(),
        },
    });

    await transporter.sendMail({
        from: smtpFrom.value(),
        to: data['invitedEmail'],
        subject: `${data['invitedByName']} invited you to "${data['projectName']}" on Flashcards`,
        html: `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2>You have been invited!</h2>
      <p><strong>${data['invitedByName']}</strong> invited you to collaborate on the
      flashcard project <strong>"${data['projectName']}"</strong> as
      <strong>${data['role']}</strong>.</p>
      <p>
        <a href="${inviteUrl}"
           style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;
                  border-radius:8px;text-decoration:none;font-weight:600;">
          View Invitation
        </a>
      </p>
      <p style="color:#888;font-size:12px;">
        If you weren't expecting this, you can safely ignore this email.
      </p>
    </div>`,
    });

    logger.info(`Invitation email sent to ${data['invitedEmail']}`);
}

export async function onInvitationAccepted(request: CallableRequest<any>) {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in to accept an invitation.');
    }

    const { invitationId } = request.data as { invitationId: string };
    if (!invitationId) {
        throw new HttpsError('invalid-argument', 'invitationId is required.');
    }

    const firestore = getFirestore();
    const invRef = firestore.collection('invitations').doc(invitationId);
    const invSnap = await invRef.get();

    if (!invSnap.exists) {
        throw new HttpsError('not-found', 'Invitation not found.');
    }

    const invitation = invSnap.data();
    if (!invitation) {
        throw new HttpsError('data-loss', 'Invitation data is missing.');
    }

    if (invitation['status'] !== 'pending') {
        throw new HttpsError('failed-precondition', 'Invitation is no longer pending.');
    }

    if (invitation['invitedEmail'] !== request.auth.token.email) {
        throw new HttpsError('permission-denied', 'This invitation was not sent to your account.');
    }

    const memberId = `${invitation['projectId']}_${request.auth.uid}`;
    const memberRef = firestore.collection('projectMembers').doc(memberId);
    const memberSnap = await memberRef.get();

    if (memberSnap.exists) {
        // Already a member — idempotently mark invitation as accepted
        await invRef.update({ status: 'accepted' });
        logger.info(`User ${request.auth.uid} is already a member; invitation marked accepted.`);
        return { message: 'Already a member.' };
    }

    const batch = firestore.batch();
    batch.set(memberRef, {
        projectId: invitation['projectId'],
        userId: request.auth.uid,
        email: invitation['invitedEmail'],
        role: invitation['role'],
        invitedBy: invitation['invitedBy'],
        joinedAt: FieldValue.serverTimestamp(),
    });

    batch.update(invRef, { status: 'accepted' });
    await batch.commit();

    logger.info(`User ${request.auth.uid} accepted invitation ${invitationId}.`);
    return { message: 'Invitation accepted.' };
}

export async function onInvite(request: CallableRequest<any>) {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in to send an invitation.');
    }

    const projectId = request.data.projectId as string;
    const invitedEmail = request.data.invitedEmail as string;
    const role = request.data.role as string;

    if (!projectId || !invitedEmail || !role) {
        throw new HttpsError('invalid-argument', 'projectId, invitedEmail, and role are required.');
    }

    if (invitedEmail === request.auth.token.email) {
        throw new HttpsError('failed-precondition', 'You cannot invite yourself to a project.');
    }

    const firestore = getFirestore();
    const invRef = firestore.collection('invitations');
    const invSnap = await invRef
        .where('projectId', '==', projectId)
        .where('invitedEmail', '==', invitedEmail)
        .where('status', '==', 'pending')
        .get();

    if (!invSnap.empty) {
        throw new HttpsError(
            'already-exists',
            'An invitation for this user and project already exists.',
        );
    }

    const membersRef = firestore.collection('projectMembers');
    const memberSnap = await membersRef
        .where('projectId', '==', projectId)
        .where('email', '==', invitedEmail)
        .get();

    if (!memberSnap.empty) {
        throw new HttpsError('already-exists', 'This user is already a member of the project.');
    }

    try {
        await invRef.add({
            projectId,
            projectName: request.data.projectName as string,
            invitedEmail,
            role,
            invitedBy: request.auth.uid,
            invitedByName: request.auth.token.name || request.auth.token.email || 'Unknown',
            createdAt: FieldValue.serverTimestamp(),
            status: 'pending',
        });
        return { message: 'Invitation created.' };
    } catch (error) {
        logger.error('Error creating invitation:', error);
        throw new HttpsError('internal', 'Failed to create invitation.');
    }
}
