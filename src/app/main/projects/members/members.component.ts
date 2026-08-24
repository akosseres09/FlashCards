import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { LucideAngularModule } from 'lucide-angular';
import { Project } from '../../../models/Project';
import { ProjectMember, ProjectRole } from '../../../models/ProjectMember';
import { ProjectInvitation } from '../../../models/ProjectInvitation';
import { AuthService } from '../../../services/auth/auth.service';
import { ProjectService } from '../../../services/project/project.service';
import { ProjectMemberService } from '../../../services/project-member/project-member.service';
import { InvitationService } from '../../../services/invitation/invitation.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { RoleSeverity } from '../../../models/Role';

const ROLE_OPTIONS: { label: string; value: ProjectRole }[] = [
    { label: 'Viewer', value: 'viewer' },
    { label: 'Editor', value: 'editor' },
    { label: 'Admin', value: 'admin' },
];

@Component({
    selector: 'app-members',
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        LucideAngularModule,
        ButtonModule,
        SelectModule,
        TagModule,
        ConfirmDialog,
    ],
    templateUrl: './members.component.html',
    styleUrl: './members.component.scss',
    host: {
        class: 'flex-1 flex flex-col',
    },
})
export class MembersComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly projectService = inject(ProjectService);
    private readonly memberService = inject(ProjectMemberService);
    private readonly invitationService = inject(InvitationService);
    private readonly toastService = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly confirmationService = inject(ConfirmationService);

    readonly projectId = input.required<string>();

    readonly project = signal<Project | null>(null);
    readonly members = signal<ProjectMember[]>([]);
    readonly pendingInvites = signal<ProjectInvitation[]>([]);
    readonly userRole = signal<ProjectRole | 'owner' | null>(null);

    readonly canManage = computed(() => ['owner', 'admin'].includes(this.userRole() ?? ''));

    readonly roleOptions = ROLE_OPTIONS;

    private roleInitialized = false;

    ngOnInit() {
        this.projectService
            .getOne(this.projectId())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((project) => {
                this.project.set(project);
                if (!this.roleInitialized) {
                    this.roleInitialized = true;
                    this.resolveUserRole(project);
                }
            });

        this.memberService
            .getByProject(this.projectId())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((members) => this.members.set(members));

        this.invitationService
            .getByProject(this.projectId())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((invites) => this.pendingInvites.set(invites));
    }

    private resolveUserRole(project: Project): void {
        const user = this.authService.getUser();
        if (!user) return;

        if (project.createdBy === user.uid) {
            this.userRole.set('owner');
            return;
        }

        this.memberService
            .getMembership(project.id, user.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((member) => this.userRole.set(member?.role ?? null));
    }

    roleSeverity(role: ProjectRole): RoleSeverity {
        return role === 'admin' ? 'success' : role === 'editor' ? 'warn' : 'info';
    }

    async changeRole(member: ProjectMember, role: ProjectRole) {
        try {
            await this.memberService.updateRole(member.id, role);
            this.toastService.show(`${member.email} is now ${role}`, 'success');
        } catch (err) {
            console.error(err);
            this.toastService.show('Failed to update role', 'error');
        }
    }

    openRemoveMemberDialog(member: ProjectMember) {
        this.confirmationService.confirm({
            message: `Are you sure you want to remove ${member.email} from the project?`,
            closable: true,
            header: 'Confirm Remove',
            acceptButtonProps: { label: 'Remove', severity: 'danger' },
            rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                await this.removeMember(member);
            },
        });
    }

    openRevokeDialog(invitation: ProjectInvitation) {
        this.confirmationService.confirm({
            message: `Are you sure you want to revoke this invitation?`,
            closable: true,
            header: 'Confirm Revoke',
            acceptButtonProps: { label: 'Revoke', severity: 'danger' },
            rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                await this.revokeInvite(invitation);
            },
        });
    }

    async revokeInvite(invite: ProjectInvitation) {
        try {
            await this.invitationService.delete(invite.id);
            this.toastService.show('Invitation revoked', 'success');
        } catch (err) {
            console.error(err);
            this.toastService.show('Failed to revoke invitation', 'error');
        }
    }

    async removeMember(member: ProjectMember) {
        try {
            await this.memberService.delete(member.id);
            this.toastService.show(`${member.email} removed from project`, 'success');
        } catch (err) {
            console.error(err);
            this.toastService.show('Failed to remove member', 'error');
        }
    }
}
