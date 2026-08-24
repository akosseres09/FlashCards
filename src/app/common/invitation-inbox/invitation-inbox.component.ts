import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InvitationService } from '../../services/invitation/invitation.service';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import { ProjectInvitation } from '../../models/ProjectInvitation';
import { ProjectRole } from '../../models/ProjectMember';

@Component({
    selector: 'app-invitation-inbox',
    imports: [CommonModule, ButtonModule, TagModule],
    templateUrl: './invitation-inbox.component.html',
    styleUrl: './invitation-inbox.component.scss',
})
export class InvitationInboxComponent implements OnInit {
    private readonly invitationService = inject(InvitationService);
    private readonly authService = inject(AuthService);
    private readonly toastService = inject(ToastService);
    private readonly functions = inject(Functions);
    private readonly destroyRef = inject(DestroyRef);

    invitations = signal<ProjectInvitation[]>([]);
    processingId = signal<string | null>(null);

    ngOnInit() {
        const user = this.authService.getUser();
        if (!user?.email) return;

        this.invitationService
            .getByEmail(user.email)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((invites) => this.invitations.set(invites));
    }

    roleSeverity(role: ProjectRole): 'info' | 'warn' | 'success' {
        return role === 'admin' ? 'success' : role === 'editor' ? 'warn' : 'info';
    }

    async accept(invite: ProjectInvitation) {
        this.processingId.set(invite.id);
        try {
            const fn = httpsCallable<{ invitationId: string }, { message: string }>(
                this.functions,
                'acceptInvitation',
            );
            await fn({ invitationId: invite.id });
            this.toastService.show(`Joined "${invite.projectName}" as ${invite.role}`, 'success');
        } catch (err) {
            console.error(err);
            this.toastService.show('Failed to accept invitation', 'error');
        } finally {
            this.processingId.set(null);
        }
    }

    async decline(invite: ProjectInvitation) {
        this.processingId.set(invite.id);
        try {
            await this.invitationService.updateStatus(invite.id, 'declined');
            this.toastService.show('Invitation declined', 'info');
        } catch (err) {
            console.error(err);
            this.toastService.show('Failed to decline invitation', 'error');
        } finally {
            this.processingId.set(null);
        }
    }
}
