import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { InvitationService } from '../../services/invitation/invitation.service';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import { ProjectInvitation } from '../../models/ProjectInvitation';
import { ProjectRole } from '../../models/ProjectMember';
import { finalize } from 'rxjs';

type RoleSeverity = 'info' | 'warn' | 'success';

@Component({
    selector: 'app-invitation-inbox',
    imports: [CommonModule, ButtonModule, TagModule, SkeletonModule, DividerModule],
    templateUrl: './invitation-inbox.component.html',
    styleUrl: './invitation-inbox.component.scss',
})
export class InvitationInboxComponent implements OnInit {
    private readonly invitationService = inject(InvitationService);
    private readonly authService = inject(AuthService);
    private readonly toastService = inject(ToastService);
    private readonly functions = inject(Functions);
    private readonly destroyRef = inject(DestroyRef);

    readonly invitations = signal<ProjectInvitation[]>([]);
    readonly processingId = signal<string | null>(null);
    readonly isLoading = signal<boolean>(true);

    ngOnInit() {
        const user = this.authService.getUser();
        if (!user || !user.email) {
            this.isLoading.set(false);
            return;
        }

        this.invitationService
            .getByEmail(user.email)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.isLoading.set(false)),
            )
            .subscribe((invites) => this.invitations.set(invites));
    }

    roleSeverity(role: ProjectRole): RoleSeverity {
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
        } catch {
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
        } catch {
            this.toastService.show('Failed to decline invitation', 'error');
        } finally {
            this.processingId.set(null);
        }
    }
}
